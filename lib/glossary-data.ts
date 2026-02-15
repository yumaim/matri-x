export type GlossaryCategory =
  | "パイプライン"
  | "スコアリング"
  | "エンゲージメント"
  | "フィルタリング"
  | "その他";

export interface GlossaryTerm {
  id: string;
  nameEn: string;
  nameJa: string;
  category: GlossaryCategory;
  description: string;
  relatedLink?: { label: string; href: string };
}

export const GLOSSARY_CATEGORIES: { id: GlossaryCategory | "すべて"; label: string }[] = [
  { id: "すべて", label: "すべて" },
  { id: "パイプライン", label: "パイプライン" },
  { id: "スコアリング", label: "スコアリング" },
  { id: "エンゲージメント", label: "エンゲージメント" },
  { id: "フィルタリング", label: "フィルタリング" },
  { id: "その他", label: "その他" },
  // 新アルゴリズム (2026) - xai-org/x-algorithm
  {
    id: "phoenix",
    nameEn: "Phoenix",
    nameJa: "フェニックス",
    category: "スコアリング",
    description:
      "2026年公開のGrokベースML推薦エンジン。Two-Tower Retrieval（類似検索）+ Transformer Ranking（15アクション予測）の2段階構成。Candidate Isolation技術により候補同士が独立してスコアリングされる点が革新的。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "thunder",
    nameEn: "Thunder",
    nameJa: "サンダー",
    category: "パイプライン",
    description:
      "2026年導入のRust製インメモリポストストア。Kafkaからリアルタイムに投稿を取り込み、フォロー中アカウントの投稿を<1msで取得。Original/Reply+Repost/Videoの3種別で管理し、旧Earlybirdを置き換える。",
    relatedLink: { label: "Thunder解説", href: "/dashboard/thunder" },
  },
  {
    id: "grok",
    nameEn: "Grok",
    nameJa: "グロック",
    category: "スコアリング",
    description:
      "xAI社が開発した大規模言語モデル。Phoenixの基盤技術として、Transformerアーキテクチャでツイートのエンゲージメント確率を予測。手動特徴量エンジニアリングを完全排除し、全てを学習で獲得。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "two-tower",
    nameEn: "Two-Tower Model",
    nameJa: "ツータワーモデル",
    category: "スコアリング",
    description:
      "Phoenix Retrievalの類似検索手法。User Tower（ユーザー特徴）とCandidate Tower（投稿特徴）を独立してエンコードし、Dot Product類似度で候補を取得。数百万投稿から数千候補へ高速絞込が可能。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "candidate-isolation",
    nameEn: "Candidate Isolation",
    nameJa: "候補アイソレーション",
    category: "スコアリング",
    description:
      "Phoenix Rankerの革新的設計思想。Attention Maskで候補同士が互いにattendできないよう制約し、スコアが他候補に依存しない独立性を確保。キャッシング効率・一貫性・スケーラビリティが向上。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "home-mixer-2026",
    nameEn: "Home Mixer (2026)",
    nameJa: "ホームミキサー (2026)",
    category: "パイプライン",
    description:
      "2026年版のRust製オーケストレーション層（gRPC）。Candidate Pipelineフレームワーク上で Source → Hydration → Filter → Score → Select → SideEffect の6段パイプラインを実行。旧Java/Scala版を完全置換。",
    relatedLink: { label: "新旧比較", href: "/dashboard/comparison" },
  },
  {
    id: "15-action-prediction",
    nameEn: "15-Action Prediction",
    nameJa: "15アクション予測",
    category: "エンゲージメント",
    description:
      "Phoenix Rankerが同時予測する15種のエンゲージメント確率。ポジティブ4種（fav/reply/repost/quote）、インタレスト3種、消費3種、ソーシャル1種、ネガティブ4種（not_interested/block/mute/report）に分類され、重み付け合計で最終スコア算出。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "rust-rewrite",
    nameEn: "Rust Rewrite",
    nameJa: "Rust リライト",
    category: "その他",
    description:
      "2026年アルゴリズムの62.9%がRustで記述。Java/Scalaからの全面移行により、メモリ安全性・並行性・低レイテンシを実現。Home Mixer、Thunder、Candidate Pipelineが主要Rustコンポーネント。",
    relatedLink: { label: "新旧比較", href: "/dashboard/comparison" },
  },
  {
    id: "xai",
    nameEn: "xAI",
    nameJa: "xAI社",
    category: "その他",
    description:
      "イーロン・マスクが2023年設立したAI企業。Grok LLMを開発し、2026年2月にxai-org/x-algorithmとして最新推薦アルゴリズムをオープンソース公開。Phoenix技術の源泉。",
    relatedLink: { label: "新旧比較", href: "/dashboard/comparison" },
  },
  {
    id: "hash-based-embeddings",
    nameEn: "Hash-Based Embeddings",
    nameJa: "ハッシュベース埋め込み",
    category: "スコアリング",
    description:
      "Phoenixで採用された埋め込み手法。複数ハッシュ関数でIDをルックアップし、疎な特徴量を効率的にベクトル化。従来の辞書ベース手法より省メモリで高速。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
];

export const glossaryTerms: GlossaryTerm[] = [
  // パイプライン系
  {
    id: "earlybird",
    nameEn: "Earlybird",
    nameJa: "アーリーバード",
    category: "パイプライン",
    description:
      "Luceneベースのリアルタイム検索・インデックスシステム。投稿されたツイートを即座にインデックス化し、検索クエリやタイムライン構築のための候補取得に使われる。数十億ツイートを低レイテンシで処理する。",
    relatedLink: { label: "パイプライン探索", href: "/dashboard/explore" },
  },
  {
    id: "uteg",
    nameEn: "UTEG (UserTweetEntityGraph)",
    nameJa: "ユーザー・ツイート・エンティティグラフ",
    category: "パイプライン",
    description:
      "ユーザー、ツイート、エンティティ（ハッシュタグ・URL等）の三者間関係をグラフ構造で表現。フォロー外のおすすめツイート候補の取得に重要な役割を果たす。",
    relatedLink: { label: "パイプライン探索", href: "/dashboard/explore" },
  },
  {
    id: "crmixer",
    nameEn: "CrMixer (Candidate Retrieval Mixer)",
    nameJa: "候補取得ミキサー",
    category: "パイプライン",
    description:
      "Earlybird、UTEG、SimClusters等の複数ソースから取得した候補ツイートを統合・重複排除するコンポーネント。タイムラインに表示する候補の多様性を確保する。",
    relatedLink: { label: "パイプライン探索", href: "/dashboard/explore" },
  },
  {
    id: "heavy-ranker",
    nameEn: "Heavy Ranker",
    nameJa: "ヘビーランカー",
    category: "パイプライン",
    description:
      "約6,000の特徴量を用いたMLベースの最終スコアリングエンジン。各ツイートのエンゲージメント確率を予測し、最終的な表示順序を決定する。Xアルゴリズムの核心部分。",
    relatedLink: { label: "エンゲージメント分析", href: "/dashboard/engagement" },
  },
  {
    id: "light-ranker",
    nameEn: "Light Ranker",
    nameJa: "ライトランカー",
    category: "パイプライン",
    description:
      "Heavy Rankerの前段で動作する軽量な事前フィルタリングスコアラー。大量の候補ツイートを高速に絞り込み、Heavy Rankerの計算コストを削減する。",
    relatedLink: { label: "パイプライン探索", href: "/dashboard/explore" },
  },
  {
    id: "home-mixer",
    nameEn: "Home Mixer",
    nameJa: "ホームミキサー",
    category: "パイプライン",
    description:
      "ホームタイムラインの最終組み立てを行うコンポーネント。スコアリング済みツイート、広告、おすすめアカウント等を最終的なタイムライン順序に統合する。",
    relatedLink: { label: "パイプライン探索", href: "/dashboard/explore" },
  },

  // スコアリング系
  {
    id: "tweepcred",
    nameEn: "TweepCred",
    nameJa: "ツイープクレド",
    category: "スコアリング",
    description:
      "PageRankアルゴリズムをベースにしたユーザー信頼度スコア（0〜100）。フォロワーの質、エンゲージメント履歴、アカウント年齢等から算出。スコアが高いほどツイートの初期配信範囲が広がる。",
    relatedLink: { label: "TweepCredシミュレーター", href: "/dashboard/simulator" },
  },
  {
    id: "reputation-score",
    nameEn: "Reputation Score",
    nameJa: "レピュテーションスコア",
    category: "スコアリング",
    description:
      "ユーザーの行動品質を評価するスコア。スパム報告数、ブロック率、ネガティブフィードバック率などから算出。低スコアのユーザーのツイートは配信範囲が制限される。",
  },
  {
    id: "real-graph",
    nameEn: "Real Graph",
    nameJa: "リアルグラフ",
    category: "スコアリング",
    description:
      "2人のユーザー間の関係強度を0〜1で予測するMLモデル。相互フォロー、DM頻度、リプライ回数、プロフィール訪問頻度などを特徴量として使用。スコアが高いほどタイムラインに表示されやすい。",
  },
  {
    id: "simclusters",
    nameEn: "SimClusters",
    nameJa: "シムクラスターズ",
    category: "スコアリング",
    description:
      "約145,000のコミュニティクラスターによる興味関心モデリング。ユーザーとツイートをクラスター空間に埋め込み、類似度を計算。フォロー外おすすめの主要ソース。",
    relatedLink: { label: "パイプライン探索", href: "/dashboard/explore" },
  },
  {
    id: "trust-safety-score",
    nameEn: "Trust & Safety Score",
    nameJa: "トラスト＆セーフティスコア",
    category: "スコアリング",
    description:
      "コンテンツの安全性を評価するスコア。暴力、ヘイトスピーチ、誤情報等のリスクレベルを判定し、Visibility Filteringの判断材料となる。低スコアのコンテンツは表示制限を受ける。",
  },

  // エンゲージメント系
  {
    id: "engagement-probability",
    nameEn: "Engagement Probability",
    nameJa: "エンゲージメント確率",
    category: "エンゲージメント",
    description:
      "Heavy Rankerが予測する各アクションの発生確率。いいね(P_fav)、リツイート(P_retweet)、リプライ(P_reply)、滞在時間(P_dwell)などの確率に重み付けし、最終スコアを算出する。",
    relatedLink: { label: "エンゲージメント分析", href: "/dashboard/engagement" },
  },
  {
    id: "dwell-time",
    nameEn: "Dwell Time",
    nameJa: "滞在時間",
    category: "エンゲージメント",
    description:
      "ツイートがビューポートに表示されていた時間。長い滞在時間は関心の高さを示すポジティブシグナル。スレッドや動画コンテンツで特に重要な指標。",
    relatedLink: { label: "エンゲージメント分析", href: "/dashboard/engagement" },
  },
  {
    id: "negative-feedback",
    nameEn: "Negative Feedback",
    nameJa: "ネガティブフィードバック",
    category: "エンゲージメント",
    description:
      "「興味がない」「このユーザーをミュート」「ブロック」「スパム報告」等のネガティブシグナル。スパム報告(-369x)は最も強力なペナルティで、いいね738個分のマイナスに相当する。",
    relatedLink: { label: "エンゲージメント分析", href: "/dashboard/engagement" },
  },
  {
    id: "out-of-network",
    nameEn: "Out-of-Network (OON)",
    nameJa: "アウトオブネットワーク",
    category: "エンゲージメント",
    description:
      "フォローしていないユーザーからのおすすめツイート。タイムラインの約50%を占める。UTEG、SimClusters、トレンド等から候補が取得され、Heavy Rankerでスコアリングされる。",
  },

  // フィルタリング系
  {
    id: "visibility-filtering",
    nameEn: "Visibility Filtering",
    nameJa: "ビジビリティフィルタリング",
    category: "フィルタリング",
    description:
      "コンテンツの表示可否を制御するルールエンジン。Trust & Safety Score、ユーザーの設定、法的要件等に基づき、ツイートの表示/非表示/警告付き表示を決定する。",
  },
  {
    id: "author-diversity",
    nameEn: "Author Diversity Injection",
    nameJa: "著者多様性インジェクション",
    category: "フィルタリング",
    description:
      "タイムライン上で同一著者のツイートが連続表示されることを防ぐ多様性フィルター。ユーザー体験を向上させるため、異なる著者のコンテンツを交互に配置する。",
  },
  {
    id: "content-balance",
    nameEn: "Content Balance",
    nameJa: "コンテンツバランス",
    category: "フィルタリング",
    description:
      "フォロー内(In-Network)とフォロー外(OON)のツイート比率、トピック別のバランスを調整するフィルター。特定ジャンルへの偏りを防ぎ、タイムラインの多様性を維持する。",
  },

  // その他
  {
    id: "blue-verified",
    nameEn: "Blue Verified",
    nameJa: "ブルー認証",
    category: "その他",
    description:
      "X Premium（旧Twitter Blue）の認証バッジ。認証ユーザーのツイートはスコアリング時にブースト係数が適用される。リプライの表示優先度も上がる。",
  },
  {
    id: "tombstone",
    nameEn: "Tombstone",
    nameJa: "トゥームストーン",
    category: "その他",
    description:
      "規約違反やVisibility Filteringにより非表示となったツイートの「墓石」表示。「このツイートは表示できません」等のメッセージに置き換えられる。元のコンテンツは閲覧不可。",
  },
  {
    id: "tweet-mixing",
    nameEn: "Tweet Mixing",
    nameJa: "ツイートミキシング",
    category: "その他",
    description:
      "Home Mixerの最終段階で、オーガニックツイート、広告、おすすめアカウント、トレンド等を最終的なタイムラインに混合するプロセス。広告の挿入位置やフリークエンシーもここで制御される。",
  },
  // 新アルゴリズム (2026) - xai-org/x-algorithm
  {
    id: "phoenix",
    nameEn: "Phoenix",
    nameJa: "フェニックス",
    category: "スコアリング",
    description:
      "2026年公開のGrokベースML推薦エンジン。Two-Tower Retrieval（類似検索）+ Transformer Ranking（15アクション予測）の2段階構成。Candidate Isolation技術により候補同士が独立してスコアリングされる点が革新的。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "thunder",
    nameEn: "Thunder",
    nameJa: "サンダー",
    category: "パイプライン",
    description:
      "2026年導入のRust製インメモリポストストア。Kafkaからリアルタイムに投稿を取り込み、フォロー中アカウントの投稿を<1msで取得。Original/Reply+Repost/Videoの3種別で管理し、旧Earlybirdを置き換える。",
    relatedLink: { label: "Thunder解説", href: "/dashboard/thunder" },
  },
  {
    id: "grok",
    nameEn: "Grok",
    nameJa: "グロック",
    category: "スコアリング",
    description:
      "xAI社が開発した大規模言語モデル。Phoenixの基盤技術として、Transformerアーキテクチャでツイートのエンゲージメント確率を予測。手動特徴量エンジニアリングを完全排除し、全てを学習で獲得。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "two-tower",
    nameEn: "Two-Tower Model",
    nameJa: "ツータワーモデル",
    category: "スコアリング",
    description:
      "Phoenix Retrievalの類似検索手法。User Tower（ユーザー特徴）とCandidate Tower（投稿特徴）を独立してエンコードし、Dot Product類似度で候補を取得。数百万投稿から数千候補へ高速絞込が可能。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "candidate-isolation",
    nameEn: "Candidate Isolation",
    nameJa: "候補アイソレーション",
    category: "スコアリング",
    description:
      "Phoenix Rankerの革新的設計思想。Attention Maskで候補同士が互いにattendできないよう制約し、スコアが他候補に依存しない独立性を確保。キャッシング効率・一貫性・スケーラビリティが向上。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "home-mixer-2026",
    nameEn: "Home Mixer (2026)",
    nameJa: "ホームミキサー (2026)",
    category: "パイプライン",
    description:
      "2026年版のRust製オーケストレーション層（gRPC）。Candidate Pipelineフレームワーク上で Source → Hydration → Filter → Score → Select → SideEffect の6段パイプラインを実行。旧Java/Scala版を完全置換。",
    relatedLink: { label: "新旧比較", href: "/dashboard/comparison" },
  },
  {
    id: "15-action-prediction",
    nameEn: "15-Action Prediction",
    nameJa: "15アクション予測",
    category: "エンゲージメント",
    description:
      "Phoenix Rankerが同時予測する15種のエンゲージメント確率。ポジティブ4種（fav/reply/repost/quote）、インタレスト3種、消費3種、ソーシャル1種、ネガティブ4種（not_interested/block/mute/report）に分類され、重み付け合計で最終スコア算出。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
  {
    id: "rust-rewrite",
    nameEn: "Rust Rewrite",
    nameJa: "Rust リライト",
    category: "その他",
    description:
      "2026年アルゴリズムの62.9%がRustで記述。Java/Scalaからの全面移行により、メモリ安全性・並行性・低レイテンシを実現。Home Mixer、Thunder、Candidate Pipelineが主要Rustコンポーネント。",
    relatedLink: { label: "新旧比較", href: "/dashboard/comparison" },
  },
  {
    id: "xai",
    nameEn: "xAI",
    nameJa: "xAI社",
    category: "その他",
    description:
      "イーロン・マスクが2023年設立したAI企業。Grok LLMを開発し、2026年2月にxai-org/x-algorithmとして最新推薦アルゴリズムをオープンソース公開。Phoenix技術の源泉。",
    relatedLink: { label: "新旧比較", href: "/dashboard/comparison" },
  },
  {
    id: "hash-based-embeddings",
    nameEn: "Hash-Based Embeddings",
    nameJa: "ハッシュベース埋め込み",
    category: "スコアリング",
    description:
      "Phoenixで採用された埋め込み手法。複数ハッシュ関数でIDをルックアップし、疎な特徴量を効率的にベクトル化。従来の辞書ベース手法より省メモリで高速。",
    relatedLink: { label: "Phoenix解説", href: "/dashboard/phoenix" },
  },
];
