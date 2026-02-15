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
];
