export interface KnowledgeEntry {
  id: string;
  topic: string;
  category: string;
  content: string;
  keywords: string[];
  codeReferences?: { file: string; description: string }[];
  relatedTopics?: string[];
  /** "legacy" = twitter/the-algorithm (2023), "current" = xai-org/x-algorithm (2026), "both" */
  era?: "legacy" | "current" | "both";
}

// ─── NEW: xai-org/x-algorithm (2026) ───────────────────────────────

export const knowledgeBase: KnowledgeEntry[] = [
  // ── パイプライン概要 (2026 版) ──
  {
    id: "pipeline-overview-2026",
    topic: "パイプライン概要 (2026)",
    category: "アーキテクチャ",
    era: "current",
    content: `2026年2月にxAIが公開した最新の推薦アルゴリズム（xai-org/x-algorithm）のパイプラインです。
言語が **Java/Scala → Rust (62.9%) + Python (37.1%)** に全面リライトされました。

**パイプライン:**
1. **Query Hydration**: ユーザーの最近のエンゲージメント履歴・メタデータ（フォローリスト等）を取得
2. **候補取得 (Candidate Sourcing)**:
   - **Thunder** (In-Network): フォロー中アカウントの投稿をインメモリからサブミリ秒で取得
   - **Phoenix Retrieval** (Out-of-Network): Two-Tower MLモデルで全コーパスから類似検索
3. **Hydration**: コア投稿データ、著者情報、メディアエンティティ等を付与
4. **Pre-Scoring Filters**: 10種のフィルタで重複・古い投稿・ブロック/ミュート等を除外
5. **Scoring**: 3段階で順次適用:
   - **Phoenix Scorer**: Grok-based Transformer が15種のエンゲージメント確率を予測
   - **Weighted Scorer**: 重み付き合計 → 最終スコア
   - **Author Diversity Scorer**: 同一著者の連続表示を抑制
   - **OON Scorer**: Out-of-Network コンテンツのスコア調整
6. **Selection**: スコア順でTop K候補を選択
7. **Post-Selection Filtering**: VFFilter（Visibility Filtering）で最終検証

**設計思想の5大変化:**
- ✅ 手動特徴量エンジニアリングの完全排除 → Grokが全てを学習
- ✅ Candidate Isolation → バッチ内の他候補に依存しないスコアリング
- ✅ Hash-Based Embeddings → 複数ハッシュ関数によるルックアップ
- ✅ Multi-Action Prediction → 15アクション別確率予測
- ✅ Composable Pipeline → Rust traitによる型安全な拡張性

**ソースコード参照:**
- \`home-mixer/\` — Rust製オーケストレーション層 (gRPC)
- \`phoenix/\` — Python製 Grok-based ML (Retrieval + Ranking)
- \`thunder/\` — Rust製インメモリポストストア (Kafka)
- \`candidate-pipeline/\` — Rust製パイプラインフレームワーク`,
    keywords: [
      "パイプライン",
      "推薦",
      "タイムライン",
      "2026",
      "xai-org",
      "Rust",
      "Python",
      "候補取得",
      "ランキング",
      "フィルタリング",
      "Grok",
      "Phoenix",
      "Thunder",
      "Home Mixer",
      "pipeline",
      "recommendation",
      "新アルゴリズム",
      "最新",
    ],
    codeReferences: [
      { file: "home-mixer/", description: "Rust製オーケストレーション層" },
      { file: "phoenix/", description: "Grok-based ML推薦エンジン" },
      { file: "thunder/", description: "インメモリポストストア" },
      {
        file: "candidate-pipeline/",
        description: "パイプラインフレームワーク",
      },
    ],
    relatedTopics: [
      "Phoenix (Grok ML)",
      "Thunder (In-Network)",
      "フィルタリング (2026)",
    ],
  },

  // ── Phoenix ──
  {
    id: "phoenix",
    topic: "Phoenix (Grok ML)",
    category: "ランキング",
    era: "current",
    content: `Phoenixは新アルゴリズムの中核MLコンポーネントです。xAIのGrok-1アーキテクチャをベースにした推薦システムで、2ステージで動作します。

**Stage 1: Retrieval (Two-Tower Model)**
全コーパスからOut-of-Networkの関連投稿を効率的に検索:
- **User Tower**: ユーザーの特徴量+エンゲージメント履歴をTransformerでエンコード → 正規化された埋め込み \`[B, D]\`
- **Candidate Tower**: 全投稿を埋め込み \`[N, D]\`
- **Similarity Search**: Dot Product類似度でTop-K取得（数百万→数千件）
- User TowerはRanking Modelと同じTransformerアーキテクチャを共有

**Stage 2: Ranking (Transformer + Candidate Isolation)**
候補の最終スコアリング:
- ユーザーコンテキスト（エンゲージメント履歴）と候補投稿を入力
- **Candidate Isolation**: 特殊なAttention Maskにより、候補同士は互いにattendできない（自分自身のみ）
  - User + History: 双方向attention
  - Candidates → User/History: attend可能
  - Candidates → Candidates: attend不可（対角のみ）
- これにより、スコアがバッチの他候補に依存しない → **キャッシュ可能**

**出力: 15種類のエンゲージメント確率予測**

| 予測対象 | カテゴリ |
|---------|---------|
| P(favorite) | ポジティブ |
| P(reply) | ポジティブ |
| P(repost) | ポジティブ |
| P(quote) | ポジティブ |
| P(click) | インタレスト |
| P(profile_click) | インタレスト |
| P(video_view) | コンテンツ消費 |
| P(photo_expand) | コンテンツ消費 |
| P(share) | コンテンツ消費 |
| P(dwell) | コンテンツ消費 |
| P(follow_author) | ソーシャル |
| P(not_interested) | ネガティブ |
| P(block_author) | ネガティブ |
| P(mute_author) | ネガティブ |
| P(report) | ネガティブ |

**最終スコア計算:**
\`Final Score = Σ (weight_i × P(action_i))\`
ポジティブアクションは正の重み、ネガティブアクションは負の重み。

**ソースコード参照:**
- \`phoenix/\` — Pythonで実装されたMLモデル
- \`uv run run_ranker.py\` — ランカー実行
- \`uv run run_retrieval.py\` — リトリーバル実行`,
    keywords: [
      "Phoenix",
      "Grok",
      "Transformer",
      "Two-Tower",
      "Retrieval",
      "Ranking",
      "Candidate Isolation",
      "Attention Mask",
      "ML",
      "機械学習",
      "15アクション",
      "予測",
      "15 predictions",
      "確率",
      "favorite",
      "reply",
      "repost",
      "click",
      "dwell",
      "phoenix",
      "ランカー",
      "リトリーバル",
    ],
    codeReferences: [
      { file: "phoenix/", description: "Phoenix ML推薦エンジン" },
      {
        file: "phoenix/README.md",
        description: "アーキテクチャ詳細ドキュメント",
      },
    ],
    relatedTopics: [
      "パイプライン概要 (2026)",
      "エンゲージメント予測 (2026)",
      "Thunder (In-Network)",
    ],
  },

  // ── Thunder ──
  {
    id: "thunder",
    topic: "Thunder (In-Network)",
    category: "候補取得",
    era: "current",
    content: `Thunderは新アルゴリズムで追加された完全新規コンポーネントです。フォロー中アカウントの投稿を**サブミリ秒**でルックアップするインメモリポストストアです。

**仕組み:**
1. **Kafkaイベントストリーム**: ポスト作成/削除イベントをリアルタイム消費
2. **ユーザー別3種別ストア**:
   - 📝 Original posts（通常投稿）
   - 💬 Replies + Reposts（返信とリポスト）
   - 🎥 Video posts（動画投稿を専用管理）
3. **インメモリ**: 外部DBを一切叩かずにサブミリ秒応答
4. **自動トリミング**: 保持期間を超えた古い投稿は自動削除
5. **In-Network候補提供**: リクエストユーザーがフォローしているアカウントの投稿を返す

**旧アルゴリズムとの比較:**
| 項目 | 旧 (Earlybird) | 新 (Thunder) |
|------|---------------|-------------|
| 言語 | Java | **Rust** |
| ストレージ | 転置インデックス | **インメモリストア** |
| レイテンシ | ミリ秒〜10msクラス | **サブミリ秒** |
| パーティション | ユーザー × 種別 | ✅ 同じ |
| 動画専用ストア | なし | ✅ 対応 |

**ソースコード参照:**
- \`thunder/\` — Rust実装`,
    keywords: [
      "Thunder",
      "In-Network",
      "インメモリ",
      "Kafka",
      "リアルタイム",
      "サブミリ秒",
      "ポストストア",
      "フォロー",
      "フォロー中",
      "thunder",
      "Earlybird",
      "Rust",
    ],
    codeReferences: [
      { file: "thunder/", description: "Rust製インメモリポストストア" },
    ],
    relatedTopics: ["パイプライン概要 (2026)", "Phoenix (Grok ML)"],
  },

  // ── Home Mixer (2026) ──
  {
    id: "home-mixer-2026",
    topic: "Home Mixer (オーケストレーション)",
    category: "アーキテクチャ",
    era: "current",
    content: `Home Mixerは「For You」フィードのオーケストレーション層です。旧アルゴリズムではScalaで書かれていましたが、新アルゴリズムでは**Rust**で完全リライトされています。

**役割:**
- CandidatePipelineフレームワークを使って全パイプラインを統合
- gRPCエンドポイント（\`ScoredPostsService\`）を公開
- Source → Hydration → Filter → Score → Select → SideEffect の6段パイプラインを実行

**旧アルゴリズムとの比較:**
| 項目 | 旧 | 新 |
|------|----|----|
| 言語 | Scala | **Rust** |
| RPC | Thrift | **gRPC** |
| フレームワーク | Product Mixer | **Candidate Pipeline** |
| 依存 | SimClusters + TwHIN + RealGraph | **Phoenix + Thunder** |

**ソースコード参照:**
- \`home-mixer/\` — Rust実装`,
    keywords: [
      "Home Mixer",
      "オーケストレーション",
      "gRPC",
      "Rust",
      "ScoredPostsService",
      "CandidatePipeline",
      "home mixer",
      "Scala",
    ],
    codeReferences: [
      { file: "home-mixer/", description: "Rust製オーケストレーション層" },
    ],
    relatedTopics: [
      "パイプライン概要 (2026)",
      "Candidate Pipeline フレームワーク",
    ],
  },

  // ── Candidate Pipeline Framework ──
  {
    id: "candidate-pipeline",
    topic: "Candidate Pipeline フレームワーク",
    category: "アーキテクチャ",
    era: "current",
    content: `Candidate Pipelineは新アルゴリズムの再利用可能なパイプラインフレームワークです。Rustの**trait**システムを活用して型安全かつ拡張性の高い設計になっています。

**6つのTrait:**
| Trait | 役割 |
|-------|------|
| \`Source\` | 候補取得（Thunder / Phoenix Retrieval） |
| \`Hydrator\` | メタデータ付与（投稿データ、著者情報など） |
| \`Filter\` | 不要な候補の除外 |
| \`Scorer\` | スコアリング（Phoenix Scorer等） |
| \`Selector\` | Top K選択 |
| \`SideEffect\` | ログ、モニタリング等 |

**特徴:**
- 独立ステージの**並列実行**（SourceとHydratorは並列可能）
- グレースフルエラーハンドリング（一部ステージの失敗で全体が落ちない）
- ビジネスロジックとパイプライン実行の完全分離
- テスト容易性（各Traitを独立にモック可能）

**ソースコード参照:**
- \`candidate-pipeline/\` — Rust実装`,
    keywords: [
      "Candidate Pipeline",
      "フレームワーク",
      "Trait",
      "Source",
      "Hydrator",
      "Filter",
      "Scorer",
      "Selector",
      "SideEffect",
      "並列",
      "Rust",
      "candidate pipeline",
      "framework",
    ],
    codeReferences: [
      {
        file: "candidate-pipeline/",
        description: "Rust製パイプラインフレームワーク",
      },
    ],
    relatedTopics: [
      "Home Mixer (オーケストレーション)",
      "パイプライン概要 (2026)",
    ],
  },

  // ── Engagement Predictions (2026) ──
  {
    id: "engagement-predictions-2026",
    topic: "エンゲージメント予測 (2026)",
    category: "スコアリング",
    era: "current",
    content: `新アルゴリズムのPhoenix Scorerは**15種類のエンゲージメント確率**を個別に予測します。旧アルゴリズムの固定重み方式から大きく進化しました。

**旧アルゴリズムとの比較:**
| 比較項目 | 旧 (2023) | 新 (2026) |
|---------|----------|----------|
| 予測数 | ~10種 | **15種** |
| モデル | MaskNet (6,000特徴量) | **Grok Transformer** |
| 特徴量設計 | 手動エンジニアリング | **完全自動学習** |
| ネガティブ予測 | 2種 (negative_feedback, report) | **4種** (not_interested, block, mute, report) |

**最終スコア計算:**
\`Final Score = Σ (weight_i × P(action_i))\`

- ポジティブアクション (favorite, reply, repost, quote, share, follow_author) → **正の重み**
- ネガティブアクション (not_interested, block_author, mute_author, report) → **負の重み**

**重要な変更点:**
- 旧方式: \`scored_tweets_model_weight_fav: 0.5\`, \`reply: 13.5\` 等の**固定値**
- 新方式: Transformerが**動的に**重要度を文脈に合わせて調整
- \`P(dwell)\` — 滞在時間予測が追加（Unregretted User-Seconds 最適化）
- \`P(video_view)\` / \`P(photo_expand)\` — メディア消費の細分化

**ソースコード参照:**
\`phoenix/\` 内のモデル出力レイヤー`,
    keywords: [
      "エンゲージメント",
      "予測",
      "15種",
      "確率",
      "スコアリング",
      "重み",
      "favorite",
      "reply",
      "repost",
      "quote",
      "click",
      "dwell",
      "not_interested",
      "block",
      "mute",
      "report",
      "ネガティブ",
      "Weighted Scorer",
      "Multi-Action",
      "重み付け",
    ],
    codeReferences: [
      { file: "phoenix/", description: "エンゲージメント予測モデル" },
    ],
    relatedTopics: ["Phoenix (Grok ML)", "パイプライン概要 (2026)"],
  },

  // ── Filtering (2026) ──
  {
    id: "filtering-2026",
    topic: "フィルタリング (2026)",
    category: "フィルタリング",
    era: "current",
    content: `新アルゴリズムのフィルタリングは2段階に分かれています。

**Pre-Scoring Filters（スコアリング前・10種）:**
| フィルタ名 | 機能 |
|-----------|------|
| DropDuplicatesFilter | 重複投稿の除外 |
| CoreDataHydrationFilter | コアデータ欠損の除外 |
| AgeFilter | 古すぎる投稿の除外 |
| SelfpostFilter | 自身の投稿の除外 |
| RepostDeduplicationFilter | リポスト重複の排除 |
| IneligibleSubscriptionFilter | 無資格サブスクコンテンツ除外 |
| PreviouslySeenPostsFilter | 既に見た投稿の除外 |
| PreviouslyServedPostsFilter | 最近配信済み投稿の除外 |
| MutedKeywordFilter | ミュートキーワード合致除外 |
| AuthorSocialgraphFilter | ブロック/ミュート著者除外 |

**Post-Selection Filters（選択後・2種）:**
| フィルタ名 | 機能 |
|-----------|------|
| VFFilter | Visibility Filtering (削除済み/スパム/暴力等) |
| DedupConversationFilter | 会話の重複排除 |

**旧アルゴリズムとの比較:**
旧: Trust & Safety → Visibility Filtering → Quality Filter → Abuse Filter → Global Rules
新: 明確にPre-Scoring / Post-Selectionの2段階構造

**ソースコード参照:**
- \`home-mixer/\` 内のフィルタ実装`,
    keywords: [
      "フィルタリング",
      "フィルター",
      "Pre-Scoring",
      "Post-Selection",
      "VFFilter",
      "DedupConversation",
      "MutedKeyword",
      "AuthorSocialgraph",
      "重複",
      "ブロック",
      "ミュート",
      "Visibility",
      "filter",
    ],
    codeReferences: [{ file: "home-mixer/", description: "フィルタ実装" }],
    relatedTopics: ["パイプライン概要 (2026)", "Trust & Safety フィルター"],
  },

  // ── 新旧比較 ──
  {
    id: "algorithm-comparison",
    topic: "新旧アルゴリズム比較",
    category: "アーキテクチャ",
    era: "both",
    content: `2023年公開の旧アルゴリズム (twitter/the-algorithm) と2026年公開の新アルゴリズム (xai-org/x-algorithm) の包括的比較です。

**テクノロジー変遷:**
| 項目 | 旧 (2023) | 新 (2026) |
|------|----------|----------|
| 言語 | Java 48%, Scala 34% | **Rust 62.9%, Python 37.1%** |
| ML | TensorFlow (Navi) | **Grok-1 (PyTorch/JAX)** |
| ビルド | Bazel | **Cargo + uv** |
| ライセンス | AGPL-3.0 | **Apache-2.0** |
| 組織 | twitter | **xai-org** |

**アーキテクチャ変遷:**
| 旧コンポーネント | → | 新コンポーネント |
|----------------|---|----------------|
| Product Mixer (Scala) | → | **Home Mixer (Rust)** |
| Earlybird (Java) | → | **Thunder (Rust)** |
| SimClusters + CrMixer | → | **Phoenix Retrieval (Two-Tower)** |
| Heavy Ranker (MaskNet) | → | **Phoenix Scorer (Grok Transformer)** |
| TwHIN, RealGraph | → | 不要（**Transformer が自動学習**） |

**主要な設計思想の変化:**
1. **手動特徴量 → 自動学習**: 6,000特徴量の手動設計が不要に
2. **固定重み → 動的予測**: 75.0/13.5等の固定値 → Transformerが文脈動的に予測
3. **Light+Heavy 2段 → Two-Tower+Transformer 2段**: 直感的でスケーラブルな構造
4. **SimClusters → Two-Tower**: コミュニティ検出 → ニューラル類似度検索
5. **Thrift RPC → gRPC**: より標準的でパフォーマンスの高い通信

**意味:**
旧アルゴリズムで最適化された戦略（リプ75倍、報告-369等）の「数値」は変わるが、
**双方向会話の重視・ネガティブの抑制**という方向性は維持されている。`,
    keywords: [
      "比較",
      "新旧",
      "旧アルゴリズム",
      "新アルゴリズム",
      "変遷",
      "進化",
      "Java",
      "Scala",
      "Rust",
      "Python",
      "2023",
      "2026",
      "twitter/the-algorithm",
      "xai-org/x-algorithm",
      "comparison",
    ],
    codeReferences: [],
    relatedTopics: ["パイプライン概要 (2026)", "パイプライン概要 (旧)"],
  },

  // ─── LEGACY: twitter/the-algorithm (2023) ─────────────────────────

  {
    id: "pipeline-overview",
    topic: "パイプライン概要 (旧)",
    category: "アーキテクチャ",
    era: "legacy",
    content: `⚠️ **これは2023年公開の旧アルゴリズム (twitter/the-algorithm) の情報です。**
最新版は「パイプライン概要 (2026)」を参照してください。

Xの旧推薦アルゴリズムは、以下のパイプラインで構成されていました：

1. **候補取得 (Candidate Fetch)**: 約1,400のツイート候補を4つのソースから収集
   - Earlybird (In-Network): フォロー中のアカウントから最大600件
   - UTEG (User-Tweet-Entity-Graph): GraphJetベースのグラフ探索で300件
   - CrMixer (SimClusters ANN): Out-of-Network候補400件
   - FRS (Follow Recommendation Service): 注目アカウントから100件
2. **ランキング (Heavy Ranker)**: MaskNetアーキテクチャで~6,000特徴量を入力、10種のEG確率を予測してスコアリング
3. **フィルタリング (Visibility Filtering)**: Trust & Safety、Author Diversity、Content Balance、Feedback Fatigueフィルター適用
4. **ミキシング (Home Mixer)**: 広告、おすすめユーザー(WTF)、会話モジュールとミックス
5. **配信 (Serving)**: 最終50件をタイムラインに表示（キャッシュTTL: 3分）

**ソースコード参照:**
- \`home-mixer/\` — タイムライン構築サービス（Scala）
- \`the-algorithm-ml/projects/home/recap/\` — Heavy Rankerモデル（Python/TF）
- \`simclusters_v2/\` — コミュニティ検出・埋め込み
- \`visibilitylib/\` — コンテンツフィルタリングエンジン`,
    keywords: [
      "パイプライン",
      "旧",
      "2023",
      "twitter/the-algorithm",
      "legacy",
      "Earlybird",
      "SimClusters",
      "Heavy Ranker",
      "Product Mixer",
    ],
    codeReferences: [
      {
        file: "home-mixer/",
        description: "ホームタイムラインのメインロジック（旧Scala版）",
      },
      {
        file: "product-mixer/",
        description: "プロダクトミキサーフレームワーク",
      },
    ],
    relatedTopics: ["新旧アルゴリズム比較", "パイプライン概要 (2026)"],
  },
  {
    id: "tweepcred",
    topic: "TweepCred スコア",
    category: "スコアリング",
    era: "both",
    content: `TweepCredは、ユーザーの信頼度を0-100のスコアで評価する指標です。Googleの検索ランキングと同じ**PageRankアルゴリズム**がベースです。

⚠️ **注意**: 新アルゴリズム（2026版）ではTweepCredの明示的なスコアは確認されていません。Grok Transformerがユーザーのエンゲージメント履歴から暗黙的に「信頼度」を学習している可能性があります。

**計算の仕組み（旧ソースコードから）:**
1. ユーザーのフォロー/メンション/リツイートのインタラクショングラフを構築
2. Hadoop MapReduceで3段階処理:
   - PreparePageRankData → WeightedPageRank → ExtractTweepcred
3. PageRankの対数スケールで0-100に変換

**UserMass（ユーザー質量）計算要素:**
- **加算要素**: アカウント年齢、フォロワー数、正規デバイス使用、認証バッジ
- **減算要素**: 制限状態、停止状態、異常なフォロー比率

**スコアレベル（推定）:**
| スコア | レベル | 説明 |
|--------|--------|------|
| 0-20 | 低 | 新規 or 非アクティブ |
| 20-40 | 普通 | 一般ユーザー |
| 40-60 | 良好 | アクティブユーザー |
| 60-80 | 優秀 | インフルエンサー |
| 80-100 | 最高 | トップクラス |`,
    keywords: [
      "TweepCred",
      "信頼度",
      "スコア",
      "PageRank",
      "フォロワー",
      "フォロー比率",
      "アカウント年齢",
      "エンゲージメント率",
      "tweepcred",
      "評価",
    ],
    codeReferences: [
      {
        file: "src/scala/com/twitter/graph/batch/job/tweepcred/",
        description: "TweepCredバッチジョブ（旧）",
      },
    ],
    relatedTopics: ["エンゲージメント予測 (2026)", "新旧アルゴリズム比較"],
  },
  {
    id: "engagement-weights",
    topic: "エンゲージメント重み付け (旧)",
    category: "スコアリング",
    era: "legacy",
    content: `⚠️ **これは2023年公開の旧アルゴリズムの固定重み値です。**
新アルゴリズム（2026版）では、PhoenixのGrok Transformerが15アクションを動的に予測するため、固定重みは不要になっています。
最新版は「エンゲージメント予測 (2026)」を参照してください。

**旧スコア計算式:**
\`score = Σ (weight_i × probability_i)\`

**アクション別の重み（旧ソースコード準拠）:**
| アクション | 重み | 説明 |
|-----------|------|------|
| リプライ + 著者が返信 | 75.0 | 最強。双方向会話を最も重視 |
| リプライ | 13.5 | いいねの27倍 |
| プロフィール訪問→いいね/リプ | 12.0 | プロフを開いてからEGした場合 |
| 会話クリック→リプ/いいね | 11.0 | 会話スレッドに入ってEG |
| 会話クリック→2分以上滞在 | 10.0 | 深い関心の指標 |
| リポスト | 1.0 | 拡散シグナル |
| いいね | 0.5 | 最も弱いポジティブシグナル |
| 動画50%以上視聴 | 0.005 | 極めて小さいが計測される |

**ネガティブシグナル:**
| アクション | 重み |
|-----------|------|
| スパム報告 | -369.0 |
| 興味なし / ミュート / ブロック | -74.0 |

**ソースコード参照:**
\`scored_tweets_model_weight_fav: 0.5\`
\`scored_tweets_model_weight_reply: 13.5\`
\`scored_tweets_model_weight_reply_engaged_by_author: 75.0\`
\`scored_tweets_model_weight_report: -369.0\``,
    keywords: [
      "エンゲージメント",
      "重み",
      "旧",
      "2023",
      "リプライ",
      "いいね",
      "75.0",
      "0.5",
      "13.5",
      "-369",
      "固定重み",
      "legacy",
    ],
    codeReferences: [
      {
        file: "ScoredTweetsModelWeightProvider.scala",
        description: "モデル重み付け設定（旧）",
      },
    ],
    relatedTopics: ["エンゲージメント予測 (2026)", "新旧アルゴリズム比較"],
  },
  {
    id: "simclusters",
    topic: "SimClusters (旧)",
    category: "推薦エンジン",
    era: "legacy",
    content: `⚠️ **SimClustersは旧アルゴリズムのコンポーネントです。**
新アルゴリズムでは**Phoenix Retrieval (Two-Tower Model)** に置き換わっています。

SimClustersは、Xのユーザーとコンテンツを興味関心に基づいて分類するシステムでした。

**仕組み:**
1. フォロー関係を二部グラフとして構築
2. Producer-Producer類似度をコサイン類似度で計算
3. Metropolis-Hastingsサンプリングでコミュニティ検出
4. 各Producerを1つのコミュニティに割り当て（KnownFor行列）
5. Consumer埋め込み = フォローグラフ × KnownFor行列

**規模:**
- 約145,000のコミュニティ
- おすすめタブの約50%がSimClusters由来

**新アルゴリズムへの移行:**
SimClusters → **Phoenix Two-Tower Retrieval**
- コミュニティ検出ベース → **ニューラル類似度検索**
- バッチ更新 → **リアルタイムTransformerエンコーディング**`,
    keywords: [
      "SimClusters",
      "旧",
      "legacy",
      "クラスター",
      "コミュニティ検出",
      "145000",
      "simclusters",
    ],
    codeReferences: [
      {
        file: "src/scala/com/twitter/simclusters_v2/",
        description: "SimClusters v2 実装（旧）",
      },
    ],
    relatedTopics: ["Phoenix (Grok ML)", "新旧アルゴリズム比較"],
  },
  {
    id: "heavy-ranker",
    topic: "Heavy Ranker (旧)",
    category: "ランキング",
    era: "legacy",
    content: `⚠️ **Heavy Rankerは旧アルゴリズムのコンポーネントです。**
新アルゴリズムでは**Phoenix Scorer (Grok Transformer)** に置き換わっています。

**旧モデルアーキテクチャ:** Parallel MaskNet
- ~6,000特徴量を入力
- 10種のエンゲージメント確率を予測

**新モデルとの比較:**
| 項目 | 旧 Heavy Ranker | 新 Phoenix Scorer |
|------|---------------|-----------------|
| アーキテクチャ | MaskNet | **Grok Transformer** |
| 特徴量 | ~6,000（手動設計） | **自動学習（Hash Embeddings）** |
| 予測数 | 10種 | **15種** |
| ベース | TensorFlow | **Grok-1** |`,
    keywords: [
      "Heavy Ranker",
      "旧",
      "legacy",
      "MaskNet",
      "6000特徴量",
      "heavy ranker",
      "ランカー",
    ],
    codeReferences: [
      {
        file: "the-algorithm-ml/projects/home/recap/",
        description: "旧Heavy Rankerモデル",
      },
    ],
    relatedTopics: ["Phoenix (Grok ML)", "新旧アルゴリズム比較"],
  },
  {
    id: "trust-safety",
    topic: "Trust & Safety フィルター",
    category: "フィルタリング",
    era: "both",
    content: `Trust & Safetyフィルターは、新旧アルゴリズム共通の品質・安全性確保のためのフィルタリングです。

**新アルゴリズム (2026) での実装:**
Pre-Scoring: AuthorSocialgraphFilter（ブロック/ミュート著者除外）
Post-Selection: VFFilter（Visibility Filtering — 削除済み/スパム/暴力/gore除外）

**旧アルゴリズム (2023) での実装:**
1. Visibility Filtering: ブロック/ミュート済みユーザーのツイート除外
2. NSFW フィルター: センシティブコンテンツの判定
3. Quality Filter: 低品質コンテンツの除外
4. Abuse Filter: 嫌がらせ/スパム検出
5. Global Rules: プラットフォーム全体のルール適用

**品質スコア:**
- テキスト品質（スペル、文法、長さ）
- メディア品質（解像度、適切さ）
- アカウント品質（TweepCredスコア）
- コンテンツ品質（オリジナリティ、情報量）`,
    keywords: [
      "Trust",
      "Safety",
      "フィルター",
      "品質",
      "NSFW",
      "VFFilter",
      "スパム",
      "ブロック",
      "ミュート",
      "Visibility",
      "filter",
    ],
    codeReferences: [
      { file: "home-mixer/", description: "フィルタ実装（新）" },
      { file: "visibility-filters/", description: "可視性フィルター（旧）" },
    ],
    relatedTopics: ["フィルタリング (2026)", "パイプライン概要 (2026)"],
  },
  {
    id: "posting-time",
    topic: "投稿時間の影響",
    category: "最適化",
    era: "both",
    content: `投稿時間はアルゴリズムのスコアリングに大きな影響を与えます。

**新旧共通:**
- ツイートは投稿直後が最もスコアが高い
- 時間の経過とともにスコアが減衰

**新アルゴリズムでの変化:**
- Thunderは投稿の保持期間を管理し、古すぎる投稿は自動トリミング
- AgeFilterがPre-Scoring段階で古い投稿を除外

**最適な投稿時間:**
- ターゲットオーディエンスがアクティブな時間帯
- 日本: 7-9時、12-13時、20-22時がピーク`,
    keywords: [
      "投稿時間",
      "時間",
      "減衰",
      "最適",
      "ピーク",
      "タイミング",
      "time",
      "decay",
      "posting time",
    ],
    codeReferences: [],
    relatedTopics: ["パイプライン概要 (2026)", "フィルタリング (2026)"],
  },
  {
    id: "hashtags",
    topic: "ハッシュタグの影響",
    category: "最適化",
    era: "both",
    content: `ハッシュタグのアルゴリズムへの影響について解説します。

**現在の扱い:**
- 新アルゴリズムでは、Grok Transformerがテキスト全体を理解するため、ハッシュタグの独立的な影響は限定的
- 過剰なハッシュタグはスパム判定のリスク
- 関連性の高い1-2個が推奨

**トレンド連動:**
- トレンドハッシュタグは「トレンド」タブでの表示に影響
- 「おすすめ」タイムラインには直接的な影響は限定的`,
    keywords: ["ハッシュタグ", "トレンド", "タグ", "hashtag", "#"],
    codeReferences: [],
    relatedTopics: ["フィルタリング (2026)", "エンゲージメント予測 (2026)"],
  },
  {
    id: "blue-badge",
    topic: "ブルーバッジ（認証済み）の影響",
    category: "アカウント",
    era: "both",
    content: `認証済みアカウント（ブルーバッジ / X Premium）がアルゴリズムに与える影響について解説します。

**新アルゴリズムでの扱い:**
- Candidate Hydration時に \`subscription_status\` が付与され、Phoenix Scorerに入力
- IneligibleSubscriptionFilter がサブスクコンテンツの資格チェック
- Grok Transformerがユーザーのサブスクリプション状態を考慮した予測を行う

**旧アルゴリズムでの優遇措置:**
- 認証ユーザーのツイートは一部の品質フィルターをバイパス
- リプライの優先表示
- 検索結果での優先順位向上`,
    keywords: [
      "ブルーバッジ",
      "認証",
      "Premium",
      "サブスクリプション",
      "blue badge",
      "verified",
      "subscription",
    ],
    codeReferences: [],
    relatedTopics: ["フィルタリング (2026)", "エンゲージメント予測 (2026)"],
  },
  {
    id: "faq",
    topic: "よくある質問",
    category: "FAQ",
    era: "both",
    content: `Xアルゴリズムに関するよくある質問と回答です。

**Q: 2026年の新アルゴリズムで何が変わった？**
A: 最大の変化は3つ: (1) Grok Transformerによる自動学習（手動特徴量不要）、(2) Rust + Pythonへの全面リライト、(3) 15種のアクション同時予測です。

**Q: 旧アルゴリズムの重み（リプ75倍等）はまだ有効？**
A: 固定重みは廃止されましたが、**双方向会話の重視**という方向性は維持されています。Transformerが文脈に応じて動的に重みを調整します。

**Q: フォロワー数はどれくらい重要？**
A: 直接的な固定ブーストはなくなりましたが、Phoenix Scorerのエンゲージメント履歴入力に含まれるため、間接的に影響します。

**Q: インプレッションを増やすには？**
A: 方向性は変わらず: (1) リプライを促すコンテンツ、(2) 投稿直後の初速、(3) ネガティブフィードバック（ブロック/ミュート/報告）を受けないこと。

**Q: シャドウバンは存在する？**
A: 「シャドウバン」という仕組みはありません。ただしVFFilter（Visibility Filtering）による表示制限は新旧共通で存在します。

**Q: リポジトリはどこで見れる？**
A: https://github.com/xai-org/x-algorithm （Apache-2.0ライセンス）`,
    keywords: [
      "FAQ",
      "質問",
      "よくある質問",
      "変化",
      "2026",
      "フォロワー",
      "インプレッション",
      "シャドウバン",
    ],
    codeReferences: [],
    relatedTopics: ["新旧アルゴリズム比較", "パイプライン概要 (2026)"],
  },
];
