export interface KnowledgeEntry {
  id: string;
  topic: string;
  category: string;
  content: string;
  keywords: string[];
  codeReferences?: { file: string; description: string }[];
  relatedTopics?: string[];
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "pipeline-overview",
    topic: "パイプライン概要",
    category: "アーキテクチャ",
    content: `Xの推薦アルゴリズムは、ユーザーのタイムライン（For You）に表示するツイートを選択するために、以下のパイプラインを通過させます：

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
      "パイプライン", "推薦", "タイムライン", "候補取得", "ランキング",
      "フィルタリング", "ブレンド", "配信", "In-Network", "Out-of-Network",
      "Candidate Fetch", "Heavy Ranker", "フロー", "概要", "全体",
      "アルゴリズム", "仕組み", "pipeline", "recommendation",
    ],
    codeReferences: [
      { file: "home-mixer/", description: "ホームタイムラインのメインロジック" },
      { file: "product-mixer/", description: "プロダクトミキサーフレームワーク" },
      { file: "trust-safety/", description: "Trust & Safety フィルター" },
    ],
    relatedTopics: ["SimClusters", "Heavy Ranker", "Trust & Safety フィルター"],
  },
  {
    id: "tweepcred",
    topic: "TweepCred スコア",
    category: "スコアリング",
    content: `TweepCredは、ユーザーの信頼度を0-100のスコアで評価する指標です。Googleの検索ランキングと同じ**PageRankアルゴリズム**がベースです。

**計算の仕組み（ソースコードから）:**
1. ユーザーのフォロー/メンション/リツイートのインタラクショングラフを構築
2. Hadoop MapReduceで3段階処理:
   - PreparePageRankData → WeightedPageRank → ExtractTweepcred
3. PageRankの対数スケールで0-100に変換

**UserMass（ユーザー質量）計算要素:**
- **加算要素**: アカウント年齢、フォロワー数、正規デバイス使用、認証バッジ
- **減算要素**: 制限状態、停止状態、異常なフォロー比率

**フォロー/フォロワー比率ペナルティ:**
\`Reputation.scala\` の \`adjustReputationsPostCalculation\` 関数で計算:
- followings/followers比が高い → ペナルティ（division factor）
- フォロー数 >> フォロワー数のアカウントは信用度が低下

**スコアレベル（推定）:**
| スコア | レベル | 説明 |
|--------|--------|------|
| 0-20 | 低 | 新規 or 非アクティブ |
| 20-40 | 普通 | 一般ユーザー |
| 40-60 | 良好 | アクティブユーザー |
| 60-80 | 優秀 | インフルエンサー |
| 80-100 | 最高 | トップクラス |`,
    keywords: [
      "TweepCred", "信頼度", "スコア", "PageRank", "フォロワー",
      "フォロー比率", "アカウント年齢", "エンゲージメント率",
      "アクティブフォロワー", "報告", "スパム", "信頼", "ユーザースコア",
      "tweepcred", "評価",
    ],
    codeReferences: [
      { file: "src/scala/com/twitter/graph/batch/job/tweepcred/", description: "TweepCredバッチジョブ" },
      { file: "TweepCred.scala", description: "メインの計算ロジック" },
    ],
    relatedTopics: ["エンゲージメント重み付け", "Heavy Ranker", "Trust & Safety フィルター"],
  },
  {
    id: "engagement-weights",
    topic: "エンゲージメント重み付け",
    category: "スコアリング",
    content: `各エンゲージメントアクションには異なる重みが設定されています。以下はソースコード（twitter/the-algorithm-ml）から判明した**実際の重み値**です。

**スコア計算式:**
\`score = Σ (weight_i × probability_i)\`

**アクション別の重み（ソースコード準拠）:**
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
| スパム報告 | -369.0 (いいね738個分のマイナス) |
| 興味なし / ミュート / ブロック | -74.0 (いいね148個分のマイナス) |

**重要な発見:**
- いいね(0.5)はリプライ+著者返信(75.0)の**150分の1**
- スパム報告1件でいいね738個分が帳消し
- 多くのSNSコンサルが「いいねを増やそう」と言うが、アルゴリズム的にはリプライの方が27倍重要

**ソースコード参照:**
\`scored_tweets_model_weight_fav: 0.5\`
\`scored_tweets_model_weight_reply: 13.5\`
\`scored_tweets_model_weight_reply_engaged_by_author: 75.0\`
\`scored_tweets_model_weight_negative_feedback_v2: -74.0\`
\`scored_tweets_model_weight_report: -369.0\``,
    keywords: [
      "エンゲージメント", "重み", "リプライ", "いいね", "リポスト",
      "プロフィール", "引用", "動画", "ミュート", "ブロック",
      "スパム", "メディア", "ブースト", "ネガティブ", "weight",
      "engagement", "75.0", "0.5", "13.5", "重み付け", "-369",
      "report", "negative", "fav", "reply",
    ],
    codeReferences: [
      { file: "home-mixer/server/src/main/scala/com/twitter/home_mixer/", description: "ホームミキサーのスコアリング" },
      { file: "ScoredTweetsModelWeightProvider.scala", description: "モデル重み付け設定" },
    ],
    relatedTopics: ["Heavy Ranker", "TweepCred スコア", "パイプライン概要"],
  },
  {
    id: "simclusters",
    topic: "SimClusters",
    category: "推薦エンジン",
    content: `SimClustersは、Xのユーザーとコンテンツを興味関心に基づいて分類するシステムです。KDD'2020 Applied Data Science Trackで発表された論文がベース。

**仕組み（ソースコードから）:**
1. フォロー関係を二部グラフとして構築: [Consumer] →follows→ [Producer]
2. Producer-Producer類似度をコサイン類似度で計算（共通フォロワー基準）
3. Metropolis-Hastingsサンプリングでコミュニティ検出
4. 各Producerを1つのコミュニティに割り当て（KnownFor行列）
5. Consumer埋め込み = フォローグラフ × KnownFor行列
6. ツイート埋め込み = いいねしたユーザーのInterestedInベクトルを**リアルタイム**加算

**規模:**
- 約145,000のコミュニティが存在
- Top 20M producersが分類対象
- ユーザーは複数のクラスターに属する

**埋め込みの種類:**
| 種類 | 用途 | 更新頻度 |
|------|------|---------|
| KnownFor | Producerのコミュニティ所属 | バッチ（日次） |
| InterestedIn | Consumerの興味 | バッチ（日次） |
| Tweet Embeddings | ツイートのベクトル | **リアルタイム** |

**実践的意味:**
- 発信軸を絞ればKnownForが明確になり、同じクラスターの人に届きやすくなる
- いいねするたびにリアルタイムでツイート埋め込みが変わる
- おすすめタブの約50%がSimClusters由来`,
    keywords: [
      "SimClusters", "クラスター", "クラスタリング", "興味関心",
      "Out-of-Network", "推薦", "おすすめ", "グループ化",
      "145000", "simclusters", "類似", "ユーザー分類",
    ],
    codeReferences: [
      { file: "src/scala/com/twitter/simclusters_v2/", description: "SimClusters v2 実装" },
      { file: "SimClustersEmbedding.scala", description: "エンベディング計算" },
    ],
    relatedTopics: ["パイプライン概要", "Heavy Ranker", "エンゲージメント重み付け"],
  },
  {
    id: "heavy-ranker",
    topic: "Heavy Ranker",
    category: "ランキング",
    content: `Heavy Rankerは、候補ツイートの最終スコアリングを行うニューラルネットワークモデルです。

**モデルアーキテクチャ:** Parallel MaskNet
- 複数のMaskBlockを並列に実行し、特徴量の非線形な相互作用を学習

**入力特徴量 (~6,000):**
- **author_aggregate**: 著者の過去50日間のEG統計 + リアルタイム30分集計
- **user_aggregate**: 閲覧ユーザーの行動パターン
- **user_author_aggregate**: ユーザー×著者ペアの相互作用履歴
- **tweet_aggregate**: ツイート自体の集計特徴量
- **RealGraph**: ユーザー間インタラクション予測モデル
- **SimClusters embeddings**: コミュニティベースの類似度

**スコア計算:**
\`score = Σ (weight_i × P(engagement_i))\`

| エンゲージメント | 重み |
|----------------|------|
| reply_engaged_by_author | 75.0 |
| reply | 13.5 |
| good_profile_click | 12.0 |
| good_click | 11.0 |
| good_click_v2 | 10.0 |
| retweet | 1.0 |
| fav | 0.5 |
| video_playback50 | 0.005 |
| negative_feedback_v2 | -74.0 |
| report | -369.0 |

**リアルタイム特徴量（30分ウィンドウ）:**
投稿後30分間のEG速度が初期スコアを決定。この「加速度」がバイラルの鍵。`,
    keywords: [
      "Heavy Ranker", "ランキング", "ニューラルネットワーク", "スコアリング",
      "特徴量", "モデル", "予測", "確率", "6000", "ランカー",
      "heavy ranker", "neural network", "feature",
    ],
    codeReferences: [
      { file: "home-mixer/server/src/main/scala/com/twitter/home_mixer/model/", description: "ホームフィーチャーモデル" },
      { file: "HomeFeatures.scala", description: "特徴量定義" },
    ],
    relatedTopics: ["エンゲージメント重み付け", "パイプライン概要", "SimClusters"],
  },
  {
    id: "trust-safety",
    topic: "Trust & Safety フィルター",
    category: "フィルタリング",
    content: `Trust & Safetyフィルターは、ツイートの品質と安全性を確保するためのフィルタリングステージです。

**フィルタリングステージ:**
1. **Visibility Filtering**: ブロック/ミュート済みユーザーのツイート除外
2. **NSFW フィルター**: センシティブコンテンツの判定
3. **Quality Filter**: 低品質コンテンツの除外
4. **Abuse Filter**: 嫌がらせ/スパム検出
5. **Global Rules**: プラットフォーム全体のルール適用

**品質スコア:**
- テキスト品質（スペル、文法、長さ）
- メディア品質（解像度、適切さ）
- アカウント品質（TweepCredスコア）
- コンテンツ品質（オリジナリティ、情報量）`,
    keywords: [
      "Trust", "Safety", "フィルター", "品質", "NSFW",
      "スパム", "ブロック", "ミュート", "Visibility", "Abuse",
      "Quality", "フィルタリング", "安全", "信頼", "センシティブ",
      "trust safety", "filter",
    ],
    codeReferences: [
      { file: "trust-safety/", description: "Trust & Safety モジュール" },
      { file: "visibility-filters/", description: "可視性フィルター" },
    ],
    relatedTopics: ["パイプライン概要", "TweepCred スコア", "ブルーバッジ（認証済み）の影響"],
  },
  {
    id: "posting-time",
    topic: "投稿時間の影響",
    category: "最適化",
    content: `ツイートの投稿時間はアルゴリズムのスコアリングに大きな影響を与えます。

**時間減衰:**
- ツイートは投稿直後が最もスコアが高い
- 時間の経過とともに指数関数的にスコアが減衰
- 「おすすめ」タブでは最大24時間前のツイートまで表示

**最適な投稿時間:**
- ターゲットオーディエンスがアクティブな時間帯
- 日本: 7-9時、12-13時、20-22時がピーク
- コンテンツの競争が少ない時間帯も有利`,
    keywords: [
      "投稿時間", "時間", "減衰", "最適", "ピーク",
      "24時間", "タイミング", "スケジュール", "アクティブ",
      "time", "decay", "posting time",
    ],
    codeReferences: [],
    relatedTopics: ["パイプライン概要", "Heavy Ranker", "エンゲージメント重み付け"],
  },
  {
    id: "hashtags",
    topic: "ハッシュタグの影響",
    category: "最適化",
    content: `ハッシュタグのアルゴリズムへの影響について解説します。

**現在の扱い:**
- ハッシュタグ自体はランキングにほとんど影響しない
- 過剰なハッシュタグはスパム判定のリスク
- 関連性の高い1-2個が推奨

**トレンド連動:**
- トレンドハッシュタグは「トレンド」タブでの表示に影響
- 「おすすめ」タイムラインには直接的な影響は限定的`,
    keywords: [
      "ハッシュタグ", "トレンド", "タグ", "スパム",
      "hashtag", "trend", "#",
    ],
    codeReferences: [],
    relatedTopics: ["Trust & Safety フィルター", "エンゲージメント重み付け"],
  },
  {
    id: "blue-badge",
    topic: "ブルーバッジ（認証済み）の影響",
    category: "アカウント",
    content: `認証済みアカウント（ブルーバッジ）がアルゴリズムに与える影響について解説します。

**優遇措置:**
- 認証ユーザーのツイートは一部の品質フィルターをバイパス
- リプライの優先表示（認証済みリプライが上位に）
- 検索結果での優先順位向上

**制限:**
- エンゲージメント重み付け自体は変わらない
- TweepCredスコアの計算には直接影響しない
- 品質が低いコンテンツは認証済みでもフィルタリングされる`,
    keywords: [
      "ブルーバッジ", "認証", "バッジ", "Blue", "Premium",
      "優遇", "検索", "リプライ", "フィルター", "バイパス",
      "blue badge", "verified", "認証済み",
    ],
    codeReferences: [],
    relatedTopics: ["Trust & Safety フィルター", "TweepCred スコア", "エンゲージメント重み付け"],
  },
  {
    id: "faq",
    topic: "よくある質問",
    category: "FAQ",
    content: `Xアルゴリズムに関するよくある質問と回答です。

**Q: フォロワー数はどれくらい重要？**
A: フォロワー数自体よりも、フォロワー/フォロー比率とエンゲージメント率が重要。TweepCredスコアの計算にフォロワー数は含まれるが、正規化される。

**Q: インプレッションを増やすには？**
A: リプライを促すコンテンツが最も効果的（重み75.0、著者が返信すると最大）。投稿後30分の初速が重要（リアルタイム特徴量のウィンドウ）。一貫したエンゲージメント活動が重要。

**Q: シャドウバンは存在する？**
A: 「シャドウバン」という公式の仕組みはない。ただし、Trust & Safetyフィルターによる表示制限は存在する。Visibility Filteringによって、特定のコンテキストでツイートが表示されないことがある。

**Q: アルゴリズムはどれくらいの頻度で更新される？**
A: Xのアルゴリズムは継続的に更新されている。オープンソース化されたのは2023年3月時点のスナップショット。現在のアルゴリズムとは差異がある可能性がある。`,
    keywords: [
      "FAQ", "質問", "フォロワー", "インプレッション", "シャドウバン",
      "更新", "フォロワー数", "増やす", "バン", "shadow ban",
      "よくある質問", "頻度",
    ],
    codeReferences: [],
    relatedTopics: ["TweepCred スコア", "エンゲージメント重み付け", "Trust & Safety フィルター"],
  },
];
