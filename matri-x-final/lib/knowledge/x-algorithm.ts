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
    content: `Xの推薦アルゴリズムは、ユーザーのタイムラインに表示するツイートを選択するために、以下のパイプラインを通過させます：

1. **候補取得 (Candidate Fetch)**: 約1500のツイート候補を収集
   - In-Network: フォロー中のアカウントから約500ツイート
   - Out-of-Network: フォロー外から約1000ツイート（SimClusters、GraphJet等）
2. **ランキング (Ranking)**: Heavy Rankerモデルで候補をスコアリング
3. **フィルタリング (Filtering)**: Trust & Safety、品質フィルター適用
4. **ブレンド (Blending)**: 広告、トレンド等とミックス
5. **配信 (Serving)**: 最終的なタイムラインを構成

リポジトリ: \`twitter/the-algorithm\` (GitHub)
主要ディレクトリ: \`home-mixer/\`, \`product-mixer/\`, \`trust-safety/\``,
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
    content: `TweepCredは、ユーザーの信頼度を0-1のスコアで評価する指標です。PageRankベースのアルゴリズムで計算されます。

**計算要素:**
- **フォロワー/フォロー比率**: 高いほど良い（上限10倍で正規化）
- **アカウント年齢**: 古いアカウントほど信頼度が高い
- **エンゲージメント率**: いいね・リプライ・リポスト数
- **アクティブフォロワー率**: 実際にアクティブなフォロワーの割合
- **報告履歴**: スパム報告が少ないほど良い

**スコアレベル:**
| スコア | レベル | 説明 |
|--------|--------|------|
| 0.0-0.2 | 低 | 改善が必要 |
| 0.2-0.4 | 普通 | 平均以下 |
| 0.4-0.6 | 良好 | 平均的 |
| 0.6-0.8 | 優秀 | 平均以上 |
| 0.8-1.0 | 最高 | トップクラス |`,
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
    content: `各エンゲージメントアクションには異なる重みが設定されています。

**アクション別の重み:**
| アクション | 重み | 説明 |
|-----------|------|------|
| リプライ + 著者リプライ | 150x | 双方向コミュニケーションが最も高く評価 |
| いいね | 30x | 基本的なポジティブシグナル |
| リポスト | 20x | コンテンツ拡散のシグナル |
| プロフィール訪問 | 12x | 興味関心の強いシグナル |
| 引用ポスト | 20x | リポスト+独自コメント |
| 動画視聴 (50%以上) | 10x | 動画コンテンツへの関与 |
| リンククリック | 1x | 最も弱いシグナル |

**ネガティブシグナル:**
| アクション | 影響 |
|-----------|------|
| ミュート | -74x (強いネガティブ) |
| ブロック | -74x (最も強いネガティブ) |
| スパム報告 | -369x (致命的) |
| 「興味がない」 | -11x |

**メディアブースト:**
| メディアタイプ | ブースト倍率 |
|--------------|-------------|
| 動画 | 3.0x |
| 画像 | 1.8x |
| GIF | 1.5x |
| リンク | 1.2x |
| テキストのみ | 1.0x (基準) |`,
    keywords: [
      "エンゲージメント", "重み", "リプライ", "いいね", "リポスト",
      "プロフィール", "引用", "動画", "ミュート", "ブロック",
      "スパム", "メディア", "ブースト", "ネガティブ", "weight",
      "engagement", "150x", "30x", "20x", "重み付け",
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
    content: `SimClustersは、Xのユーザーとコンテンツを興味関心に基づいてクラスタリングするシステムです。

**仕組み:**
1. ユーザーの行動（フォロー、いいね、リプライ等）を分析
2. 類似した興味を持つユーザーを「クラスター」にグループ化
3. 各ツイートがどのクラスターに属するかを計算
4. ユーザーのクラスターに関連するツイートを推薦

**クラスター数:**
- 約145,000のクラスターが存在
- ユーザーは複数のクラスターに属する
- クラスターは動的に更新される

**Out-of-Network推薦への影響:**
- SimClustersが最も重要なOut-of-Network推薦ソース
- 「おすすめ」タブの約50%がSimClusters由来`,
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

**入力特徴量:**
- ユーザー特徴: フォロワー数、エンゲージメント履歴、TweepCredスコア
- ツイート特徴: テキスト、メディア、エンゲージメント数、経過時間
- コンテキスト特徴: ユーザーとツイート著者の関係性
- 約6,000の特徴量を使用

**スコアリング:**
- 各ツイートに対して「エンゲージメント確率」を予測
- リプライ確率 × 150 + いいね確率 × 30 + リポスト確率 × 20 + ...
- 最終スコアでランキング`,
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
A: リプライを促すコンテンツが最も効果的（150x重み）。動画コンテンツ（3.0xブースト）、適切な投稿時間、一貫したエンゲージメント活動が重要。

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
