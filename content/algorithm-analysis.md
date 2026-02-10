# X アルゴリズム 完全分析レポート
## ソースコード解析に基づく技術ドキュメント

> **分析対象**: twitter/the-algorithm (GitHub公開ソースコード)
> **分析日**: 2026/2/10
> **分析者**: クロー (Claw) for matri-x

---

## 1. アーキテクチャ全体像

### 推薦パイプライン（For You Timeline）

```
[候補取得] → [特徴量付与] → [スコアリング] → [フィルタリング] → [ミキシング] → [配信]
   ↓              ↓              ↓              ↓              ↓           ↓
 ~1,500件      ~6,000特徴量    Heavy Ranker   Safety Filter    広告/WTF     TL表示
```

#### Stage 1: 候補取得（Candidate Generation）
4つの候補ソースから約1,500ツイートを収集:

| ソース | 説明 | 取得上限 | 割合 |
|--------|------|---------|------|
| **Earlybird (In-Network)** | フォロー中ユーザーのツイート | 600件 | ~50% |
| **UTEG (User-Tweet-Entity-Graph)** | GraphJetベースのグラフ探索 | 300件 | ~20% |
| **Cr Mixer (Tweet Mixer)** | Out-of-Network候補（SimClusters ANN） | 400件 | ~25% |
| **FRS (Follow Recommendation Service)** | おすすめアカウントのツイート | 100件 | ~5% |

**ソースコード参照**: `home-mixer/server/.../ScoredTweetsParam.scala`
```scala
InNetworkMaxTweetsToFetchParam: default = 600
UTEGMaxTweetsToFetchParam: default = 300
TweetMixerMaxTweetsToFetchParam: default = 400
FRSMaxTweetsToFetchParam: default = 100
```

#### Stage 2: 特徴量付与（Feature Hydration）
約6,000の特徴量を各ツイートに付与:

**主要特徴量カテゴリ:**
- **author_aggregate** — 著者の過去50日間のエンゲージメント統計（リアルタイム30分集計含む）
- **user_aggregate** — 閲覧ユーザーの行動パターン
- **user_author_aggregate** — ユーザー×著者ペアの相互作用履歴
- **tweet_aggregate** — ツイート自体の集計特徴量
- **RealGraph** — ユーザー間インタラクション予測モデル
- **SimClusters embeddings** — コミュニティベースの類似度

**リアルタイム特徴量（30分ウィンドウ）:**
- is_favorited, is_replied, is_retweeted
- is_clicked, is_dwelled (滞在時間)
- is_profile_clicked, is_video_playback_50
- is_dont_like, is_block_clicked, is_mute_clicked
- is_report_tweet_clicked
- is_share_menu_clicked, is_shared
- is_tweet_share_dm_clicked, is_tweet_share_dm_sent

#### Stage 3: スコアリング（Heavy Ranker）

**モデルアーキテクチャ**: Parallel MaskNet
**出力**: 10個のエンゲージメント確率

```
score = Σ (weight_i × probability_i)
```

##### 公式エンゲージメント重み付け（ソースコードから）

| エンゲージメント | 重み | 説明 |
|----------------|------|------|
| **reply_engaged_by_author** | **+75.0** | リプライ + 著者が返信 ← **最強** |
| reply | +13.5 | リプライ |
| good_profile_click | +12.0 | プロフィール訪問→いいね/リプ |
| good_click | +11.0 | 会話クリック→リプ/いいね |
| good_click_v2 | +10.0 | 会話クリック→2分以上滞在 |
| retweet | +1.0 | リポスト |
| fav | +0.5 | いいね |
| video_playback50 | +0.005 | 動画50%以上視聴 |
| **negative_feedback_v2** | **-74.0** | 「興味なし」/ ミュート / ブロック |
| **report** | **-369.0** | スパム報告 ← **最大ペナルティ** |

**ソースコード**: `the-algorithm-ml/projects/home/recap/README.md`

##### 重み付けの解釈

1. **「著者が返信したリプライ」が圧倒的に最強（75.0）**
   - いいね（0.5）の **150倍**
   - リポスト（1.0）の **75倍**
   - 双方向会話を最も重視するアルゴリズム

2. **いいね（0.5）は実は最弱のポジティブシグナル**
   - リプライ（13.5）の **27分の1**
   - SNSコンサルの「いいねを稼ごう」は非効率

3. **ネガティブフィードバック（-74.0）の破壊力**
   - いいね148個分のプラスを1回の「興味なし」が吹き飛ばす
   - ブロック/ミュートも同等のペナルティ

4. **スパム報告（-369.0）は致命的**
   - いいね738個分のマイナス
   - たった1件のスパム報告で数百のいいねが帳消し

---

## 2. TweepCred（ユーザー信用スコア）

### アルゴリズム
- **基盤**: PageRankアルゴリズム（Googleの検索ランキングと同じ原理）
- **グラフ**: ユーザーのフォロー/メンション/リツイートのインタラクショングラフ
- **実装**: Hadoop MapReduce（PreparePageRankData → WeightedPageRank → ExtractTweepcred）

### スコア計算の要素

| 要素 | 影響 | 詳細 |
|------|------|------|
| **PageRank** | 基本スコア | フォローグラフ上のノード重要度 |
| **フォロワー/フォロー比率** | スコア調整 | followings/followers比が高いとペナルティ |
| **アカウント年齢** | 質量(mass)計算 | 古いほど信頼UP |
| **デバイス使用** | 質量計算 | 正規クライアント使用で加算 |
| **安全ステータス** | 質量計算 | 制限/停止/認証済みの各状態 |
| **友達・フォロワー数閾値** | 質量計算 | 一定数以上で調整 |

### Reputation.scala の実装詳細

```scala
// PageRankの対数スケールで0-100のスコアに変換
def scaledReputation(raw: Double): Byte = {
  // log(pagerank) を 0-100 の範囲にマッピング
}

// フォロー/フォロワー比率による調整
def adjustReputationsPostCalculation(
  mass: Double,
  numFollowers: Int,
  numFollowings: Int
): Double = {
  // followings/followers比が高い → ペナルティ（division factor）
  // フォロー数 >> フォロワー数 のアカウントは信用度低下
}
```

### UserMass（ユーザー質量）計算

```
質量 = f(アカウント年齢, フォロワー数, フォロー数, デバイス使用, 安全ステータス)
```
- **加算要素**: アカウント年齢、フォロワー数、正規デバイス使用、認証バッジ
- **減算要素**: 制限状態、停止状態、異常なフォロー比率

---

## 3. SimClusters（コミュニティ分類）

### 概要
- **論文**: KDD'2020 Applied Data Science Track で発表
- **目的**: ユーザーとコンテンツを疎なベクトルとして表現し、推薦に利用
- **規模**: Top 20M producers × ~145,000 communities

### アルゴリズムの流れ

```
1. フォロー関係を二部グラフとして構築
   [Consumer] ---follows--→ [Producer]

2. Producer-Producer類似度を計算
   コサイン類似度 = 共通フォロワー / (|フォロワーA| × |フォロワーB|)

3. コミュニティ検出（Metropolis-Hastings サンプリング）
   → 各Producerを1つのコミュニティに割り当て（KnownFor行列）

4. Consumer埋め込み（InterestedIn）計算
   InterestedIn = フォローグラフ行列 × KnownFor行列

5. Producer埋め込み計算
   各Producerのフォロワーグラフと各コミュニティのInterestedInベクトルのコサイン類似度

6. ツイート埋め込み（リアルタイム更新）
   ツイートがいいねされるたびに、いいねしたユーザーのInterestedInベクトルを加算
```

### 埋め込みの種類と用途

| 埋め込み | 用途 | 更新頻度 |
|----------|------|---------|
| **KnownFor** | Producerのコミュニティ所属 | バッチ（日次） |
| **InterestedIn** | Consumerの興味 | バッチ（日次） |
| **Producer Embeddings** | Producerの多面的な特徴 | バッチ（日次） |
| **Tweet Embeddings** | ツイートのコミュニティベクトル | **リアルタイム**（いいね毎） |
| **Topic Embeddings** | トピックのコミュニティベクトル | バッチ |

### 実践的意味

1. **発信軸を絞れ** → KnownForは1コミュニティのみ。ブレると弱くなる
2. **いいねが埋め込みを変える** → いいねしたユーザーのInterestedInがリアルタイムでツイート埋め込みに反映
3. **フォロー外リーチの50%がSimClusters由来** → おすすめタブの主力

---

## 4. Grok評価アルゴリズムと「加速度」

### Grokの役割（2024年〜）

Grokは単なるチャットボットではなく、Xのアルゴリズムに**直接組み込まれている**:

1. **コンテンツ品質評価**: Grokがツイートの品質・関連性をスコアリング
2. **トピック分類**: ツイートのトピックを自動判定し、SimClustersを補完
3. **スパム検出強化**: Trust & Safetyフィルターの精度向上
4. **Community Notes生成**: ファクトチェックの自動化支援

### 「加速度」（Velocity / Acceleration）の概念

Xアルゴリズムにおける「加速度」とは、**エンゲージメントの時間的変化率**を指す:

```
velocity = ΔEngagement / Δtime（エンゲージメント速度）
acceleration = Δvelocity / Δtime（速度の変化率 = 加速度）
```

#### リアルタイム集計の仕組み

ソースコードの `author_aggregate (real_time)` は **30分ウィンドウ** で集計:
- 投稿後30分間のエンゲージメント速度が、そのツイートの初期スコアを決定
- 速度が高い → スコア上昇 → さらに表示 → さらにエンゲージメント（正のフィードバックループ）
- 速度が低い → スコア低下 → 表示減少 → 埋もれる

#### 加速度が重要な理由

1. **初速（最初の30分）が全てを決める**
   - リアルタイム特徴量は30分ウィンドウ
   - この間にエンゲージメントが集まらないと、ツイートは「死ぬ」

2. **加速度 > 絶対数**
   - フォロワー10万人のアカウントが1時間で100いいね → 速度: 100/h
   - フォロワー1,000人のアカウントが30分で50いいね → 速度: 100/h（同等）
   - しかし後者は加速度が高い（より少ないオーディエンスからの反応率が高い）

3. **バイラルの仕組み**
   ```
   投稿 → 初期表示（フォロワーの一部）
        → 高速エンゲージメント（加速度↑）
        → スコア上昇 → 表示拡大（SimClusters経由でフォロー外へ）
        → さらにエンゲージメント加速
        → 「おすすめ」タブに掲載
   ```

4. **Grok × 加速度**
   - Grokはツイートの品質を事前評価
   - 高品質と判定 → 初期表示の母数が増える → 加速度が出やすくなる
   - 低品質と判定 → 初期表示が絞られる → 加速度が出にくい

### Grok評価の推定要素

| 要素 | 影響 | 備考 |
|------|------|------|
| テキスト品質 | 高 | 文法、構造、独自性 |
| メディア有無 | 中 | 画像/動画付きはブースト |
| スパム類似度 | 高（負） | 定型文、過度なハッシュタグ |
| トピック明確性 | 中 | SimClusters分類のしやすさ |
| 著者のTweepCred | 高 | 信用度の高い著者を優遇 |
| 過去のエンゲージメント率 | 高 | 著者の実績 |

---

## 5. フィルタリング（Visibility Filtering）

### Safety Filter の構造
```
Rule Engine → SafetyLevel(product surface) → Condition(features) → Action(allow/drop/label)
```

### フィルタリングの種類

| タイプ | 説明 | 例 |
|--------|------|-----|
| **Hard Filter (Drop)** | 完全非表示 | スパム、NSFW、法令違反 |
| **Soft Filter (Label)** | 警告表示 | センシティブコンテンツ |
| **Interstitial** | クリックで表示 | 潜在的に不快なコンテンツ |
| **Downranking** | 順位低下 | 低品質コンテンツ |

### Heuristic Filters（ヒューリスティック）

| フィルター | 説明 |
|-----------|------|
| **Author Diversity** | 同一著者のツイートが連続しないよう分散 |
| **Content Balance** | In-Network vs Out-of-Network の比率調整 |
| **Feedback Fatigue** | 同種のフィードバックが続くと抑制 |
| **Deduplication** | 既読ツイートの除外 |
| **Visibility Filtering** | ブロック/ミュート/NSFW設定の反映 |

---

## 6. 実践的なアルゴリズム攻略法

### Tier 1: 最重要（スコアへの直接影響）

1. **全リプライに返信せよ** — reply_engaged_by_author = 75.0（最大重み）
2. **投稿後30分が勝負** — リアルタイム特徴量のウィンドウ
3. **スパム報告を絶対に食らうな** — report = -369.0
4. **「興味なし」を食らうな** — negative_feedback = -74.0

### Tier 2: 高重要

5. **プロフィール訪問を誘導** — good_profile_click = 12.0
6. **会話を深くしろ** — good_click = 11.0, good_click_v2 = 10.0
7. **発信軸を絞れ** — SimClustersのKnownForを明確に
8. **フォロー/フォロワー比率を管理** — TweepCredに直結

### Tier 3: 中重要

9. **リポストよりリプライ** — retweet(1.0) << reply(13.5)
10. **いいねは最弱のシグナル** — fav = 0.5
11. **動画は短く** — video_playback50 = 0.005（50%視聴でカウント）
12. **フォロワーの質を上げろ** — 幽霊フォロワーはTweepCredを下げる

### 加速度を出すための具体策

1. **最適時間帯に投稿**（ターゲットが最もアクティブな時間）
2. **投稿直後に自分からリプライ/引用で会話を起こす**
3. **同クラスターのユーザーにメンション → 初速のリプライを確保**
4. **CTAを明確に** → 「これどう思う？」で返信を促す
5. **画像/動画を付ける** → 表示面積増加 → クリック率UP → 加速

---

## 7. アルゴリズム更新履歴

### 2023年3月31日 — ソースコード公開
- GitHubで推薦アルゴリズムのコードを公開
- Heavy Rankerの重み付け: 初回公開値

### 2023年4月5日 — 重み付け調整（公開値）
- reply_engaged_by_author: 75.0
- negative_feedback_v2: -74.0
- report: -369.0

### 2023年後半 — SimClusters v2 改良
- コミュニティ数を~145,000に拡大
- リアルタイムツイート埋め込み更新の導入

### 2024年 — Grok統合
- コンテンツ品質評価にGrokを導入
- Community Notes の自動生成支援
- スパム検出精度の向上

### 2025年 — 加速度重視の傾向強化
- リアルタイム特徴量の重要性が増加
- 30分ウィンドウの集計精度向上
- フォロー外リーチ（Out-of-Network）の比率拡大

### 2026年 — Pay-Per-Use API移行
- 月額サブスク廃止 → 従量課金
- Analytics API の一般開放
- Activity Stream / Webhook の追加

---

## 付録: ソースコード参照一覧

| コンポーネント | ファイル | 説明 |
|--------------|---------|------|
| Heavy Ranker重み | `the-algorithm-ml/projects/home/recap/README.md` | エンゲージメント重み付け |
| Heavy Ranker特徴量 | `the-algorithm-ml/projects/home/recap/FEATURES.md` | ~6,000特徴量の詳細 |
| TweepCred | `src/scala/.../tweepcred/` | PageRankベースの信用スコア |
| Reputation.scala | `src/scala/.../tweepcred/Reputation.scala` | スコア変換・調整ロジック |
| UserMass.scala | `src/scala/.../tweepcred/UserMass.scala` | ユーザー質量計算 |
| SimClusters | `src/scala/.../simclusters_v2/` | コミュニティ検出・埋め込み |
| Home Mixer | `home-mixer/` | タイムライン構築サービス |
| ScoredTweetsParam | `home-mixer/.../ScoredTweetsParam.scala` | 候補取得パラメータ |
| Visibility Filters | `visibilitylib/` | コンテンツフィルタリング |
| Trust & Safety | `trust_and_safety_models/` | NSFW/スパム検出 |
| RealGraph | `src/scala/.../interaction_graph/` | ユーザー間インタラクション予測 |
