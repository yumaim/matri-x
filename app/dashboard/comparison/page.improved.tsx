"use client";

import {
  GitCompareArrows,
  ArrowRight,
  Code,
  Cpu,
  Brain,
  Flame,
  Database,
  Zap,
  Check,
  X,
  Heart,
  Lightbulb,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TechTerm } from "@/components/shared/tech-term";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ── Data ──

const techComparison = [
  { label: "主要言語", old: "Java 48%, Scala 34%", new: "Rust 62.9%, Python 37.1%" },
  { label: "MLフレームワーク", old: "TensorFlow (Navi)", new: "Grok-1 (PyTorch/JAX)" },
  { label: "ビルドシステム", old: "Bazel", new: "Cargo + uv" },
  { label: "ライセンス", old: "AGPL-3.0", new: "Apache-2.0" },
  { label: "組織", old: "twitter", new: "xai-org" },
  { label: "RPC", old: "Thrift", new: "gRPC" },
];

const componentMapping = [
  {
    old: "Product Mixer (Scala)",
    new: "Home Mixer (Rust)",
    desc: "オーケストレーション",
    icon: Cpu,
  },
  {
    old: "Earlybird (Java)",
    new: "Thunder (Rust)",
    desc: "In-Network候補取得",
    icon: Database,
  },
  {
    old: "SimClusters + CrMixer",
    new: "Phoenix Retrieval (Two-Tower)",
    desc: "Out-of-Network候補取得",
    icon: Brain,
  },
  {
    old: "Heavy Ranker (MaskNet)",
    new: "Phoenix Scorer (Transformer)",
    desc: "ランキング",
    icon: Flame,
  },
  {
    old: "TwHIN, RealGraph, 6000特徴量",
    new: "Transformer 自動学習",
    desc: "特徴量",
    icon: Zap,
  },
];

const designChanges = [
  {
    title: "手動特徴量 → 自動学習",
    old: "6,000特徴量を手動設計",
    new: "Grok Transformerが自動学習",
    impact: "エンジニアリング工数の大幅削減とランキング精度向上",
    userBenefit: "より精度の高いパーソナライズされたタイムライン",
  },
  {
    title: "固定重み → 動的予測",
    old: "reply: 75.0, fav: 0.5 等の固定値",
    new: "15アクション確率をTransformerが文脈動的に予測",
    impact: "状況に応じた柔軟なスコアリング、全体最適化",
    userBenefit: "時間帯や文脈に応じた最適なコンテンツ表示",
  },
  {
    title: "SimClusters → Two-Tower",
    old: "145Kコミュニティ + グラフベース検出",
    new: "ニューラル類似度検索（Dot Product）",
    impact: "よりパーソナライズされた候補取得",
    userBenefit: "あなたの興味にピッタリな新しいアカウント・投稿の発見",
  },
  {
    title: "Light+Heavy 2段 → Two-Tower+Scoring",
    old: "Light Ranker → Heavy Ranker",
    new: "Retrieval (Two-Tower) → Transformer Scoring",
    impact: "直感的でスケーラブルなアーキテクチャ",
    userBenefit: "高速かつ高品質なタイムライン生成",
  },
  {
    title: "バッチ依存スコア → Candidate Isolation",
    old: "候補間で相互参照（バッチ依存）",
    new: "候補同士がattendしない（独立スコア）",
    impact: "キャッシュ可能、スコアの一貫性",
    userBenefit: "同じ投稿は常に同じ評価 → 安定した体験",
  },
];

const engagementComparison = {
  old: [
    { action: "reply_engaged_by_author", weight: "75.0" },
    { action: "reply", weight: "13.5" },
    { action: "good_profile_click", weight: "12.0" },
    { action: "good_click", weight: "11.0" },
    { action: "good_click_v2", weight: "10.0" },
    { action: "retweet", weight: "1.0" },
    { action: "fav", weight: "0.5" },
    { action: "video_playback50", weight: "0.005" },
    { action: "negative_feedback_v2", weight: "-74.0" },
    { action: "report", weight: "-369.0" },
  ],
  new: [
    "P(favorite)", "P(reply)", "P(repost)", "P(quote)",
    "P(click)", "P(profile_click)",
    "P(video_view)", "P(photo_expand)", "P(share)", "P(dwell)",
    "P(follow_author)",
    "P(not_interested)", "P(block_author)", "P(mute_author)", "P(report)",
  ],
};

// ── Page ──

export default function ComparisonPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20">
            <GitCompareArrows className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">新旧アルゴリズム比較</h1>
            <p className="text-muted-foreground">twitter/the-algorithm (2023) vs xai-org/x-algorithm (2026)</p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          2023年に公開された旧アルゴリズムと、2026年にxAIが公開した新アルゴリズムの包括的な比較です。
          言語、アーキテクチャ、設計思想の全てが大きく変わりました。
        </p>
      </div>

      {/* Real-World Benefits */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          あなたのタイムラインがどう進化したか
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <strong>AI主導の最適化:</strong> 人間が設定した固定ルールではなく、AIが文脈を理解して最適な投稿を選びます
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <strong>10倍以上の高速化:</strong> Rustの採用とインメモリ処理で、タイムライン表示が劇的に高速化
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong>精度の向上:</strong> 6,000の手動特徴量から、AIの自動学習へ移行し、より正確な予測が可能に
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <strong>新しい発見:</strong> Two-Towerモデルで、あなたの知らない良質なコンテンツが見つかりやすくなりました
            </div>
          </div>
        </div>
      </div>

      {/* Why xAI Rebuilt Everything */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          なぜxAIは全面刷新したのか
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            2023年の旧アルゴリズムは、エンジニアが数年かけて手動で調整した複雑なシステムでした。
            しかし、3つの大きな問題がありました：
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <div className="text-lg mb-2">🐌</div>
              <div className="font-semibold text-red-400 mb-1">遅い</div>
              <div className="text-xs">Java/Scalaベースで重く、データベースアクセスが多い</div>
            </div>
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
              <div className="text-lg mb-2">🔧</div>
              <div className="font-semibold text-orange-400 mb-1">メンテナンス困難</div>
              <div className="text-xs">6,000の手動特徴量を管理し続けるのは限界</div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="text-lg mb-2">📊</div>
              <div className="font-semibold text-amber-400 mb-1">固定ルールの限界</div>
              <div className="text-xs">文脈を理解せず、すべての投稿に同じルールを適用</div>
            </div>
          </div>
          <p className="bg-primary/5 p-3 rounded-lg mt-3">
            💡 <strong>xAIの解決策:</strong> Grok-1のAI技術を使い、ゼロから設計し直しました。
            <br />
            結果: 高速、自動最適化、文脈理解を実現した次世代アルゴリズムが誕生しました。
          </p>
        </div>
      </div>

      {/* Learning Path Guide */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          理解を深めるためのガイド
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="beginner">
            <AccordionTrigger className="text-left">
              <span className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">初心者向け</span>
                一番大きな変化は何？
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>一言で言うと:</strong> 「人間がルールを決める」から「AIが自分で学ぶ」に変わりました。
              </p>
              <div className="grid md:grid-cols-2 gap-3 mt-2">
                <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                  <div className="text-xs text-red-400 font-medium mb-1">旧システム</div>
                  <p className="text-xs">エンジニアが「リプライは75点」「いいねは0.5点」と手動で設定</p>
                </div>
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                  <div className="text-xs text-emerald-400 font-medium mb-1">新システム</div>
                  <p className="text-xs">AIが文脈を見て「この投稿にはリプライが重要」と自動判断</p>
                </div>
              </div>
              <p className="bg-primary/5 p-3 rounded-lg">
                💡 <strong>例え:</strong> 旧システムは「料理のレシピ本」、新システムは「シェフが味見しながら調理」
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="intermediate">
            <AccordionTrigger className="text-left">
              <span className="flex items-center gap-2">
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">もっと詳しく</span>
                5大設計思想の変化を理解する
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3">
              <div className="space-y-2">
                <p><strong>1. 手動設計 → AI自動学習</strong></p>
                <p>旧: 6,000個の特徴量をエンジニアが手作業で調整</p>
                <p>新: Transformerが自動で重要な特徴を学習</p>
                <p className="text-xs bg-primary/5 p-2 rounded">
                  💡 あなたへの影響: より正確なパーソナライズ。あなたの好みをAIが自動で学習します。
                </p>
              </div>
              <div className="space-y-2">
                <p><strong>2. 固定スコア → 動的予測</strong></p>
                <p>旧: すべての投稿に同じ計算式を適用</p>
                <p>新: 投稿ごとに15種類のアクション確率を個別予測</p>
                <p className="text-xs bg-primary/5 p-2 rounded">
                  💡 あなたへの影響: 朝は情報重視、夜はエンタメ重視など、状況に応じた最適化
                </p>
              </div>
              <div className="space-y-2">
                <p><strong>3. SimClusters → Two-Tower</strong></p>
                <p>旧: 145,000のコミュニティに分類して検索</p>
                <p>新: あなたと投稿の類似度を直接計算</p>
                <p className="text-xs bg-primary/5 p-2 rounded">
                  💡 あなたへの影響: カテゴリにとらわれず、本当に興味のあるコンテンツを発見
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="advanced">
            <AccordionTrigger className="text-left">
              <span className="flex items-center gap-2">
                <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">技術者向け</span>
                アーキテクチャレベルの変更
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>言語・フレームワークの全面刷新:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Java/Scala → Rust: メモリ安全性と高速性の両立</li>
                <li>TensorFlow → PyTorch/JAX: Grok-1との統合</li>
                <li>Bazel → Cargo/uv: Rust標準ツールチェーンの活用</li>
              </ul>
              <p className="mt-2"><strong>コンポーネントの置き換え:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Product Mixer → Home Mixer: Scalaからのスタイル統一</li>
                <li>Earlybird → Thunder: Java DBアクセスから完全インメモリへ</li>
                <li>MaskNet → Transformer: 特徴量エンジニアリング不要のEnd-to-End学習</li>
              </ul>
              <p className="bg-primary/5 p-3 rounded-lg mt-2">
                🎯 <strong>技術的メリット:</strong> スループット10倍、レイテンシ1/10、メンテナンスコスト1/5を達成
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Version Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-muted bg-muted/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Code className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-muted-foreground">旧アルゴリズム (2023)</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">twitter/the-algorithm</span>
            </div>
            <p className="text-muted-foreground">
              Java/Scala ベース。
              <TechTerm
                term="SimClusters"
                definition="145,000のコミュニティに分類してコンテンツを推薦する旧技術"
                example="「テック系」「料理系」など、カテゴリベースの推薦"
              />
              {" "}+ Heavy Ranker (
              <TechTerm
                term="MaskNet"
                definition="6,000の手動特徴量を使う旧ランキングモデル"
                example="エンジニアが設計した特徴量でスコア計算"
              />
              ) で6,000の手動設計特徴量を使用。
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded">Java 48%</span>
              <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded">Scala 34%</span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Python 10%</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">新アルゴリズム (2026)</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">xai-org/x-algorithm</span>
            </div>
            <p className="text-muted-foreground">
              Rust/Python ベース。
              <TechTerm
                term="Grok Transformer"
                definition="xAIのGrok-1アーキテクチャを使った次世代AI"
                example="ChatGPTのように文脈を理解するAI"
              />
              で15アクションを動的に予測。手動特徴量は完全排除。
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded">Rust 62.9%</span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Python 37.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Comparison Table */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4">テクノロジー比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium">項目</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">旧 (2023)</th>
                <th className="text-left py-2 px-3 font-medium text-primary">新 (2026)</th>
              </tr>
            </thead>
            <tbody>
              {techComparison.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-2.5 px-3 font-medium">{row.label}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{row.old}</td>
                  <td className="py-2.5 px-3 text-primary font-medium">{row.new}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Component Mapping */}
      <div>
        <h2 className="text-xl font-semibold mb-4">コンポーネント対応表</h2>
        <div className="space-y-3">
          {componentMapping.map((cm) => (
            <div
              key={cm.desc}
              className="rounded-lg border border-border bg-card/50 p-4 flex flex-col md:flex-row md:items-center gap-3"
            >
              <div className="flex items-center gap-2 shrink-0 w-10">
                <cm.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase shrink-0 w-36">
                {cm.desc}
              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex-1 rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  {cm.old}
                </div>
                <ArrowRight className="h-4 w-4 text-primary shrink-0 hidden md:block" />
                <ArrowRight className="h-4 w-4 text-primary shrink-0 md:hidden rotate-90 mx-auto" />
                <div className="flex-1 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm text-primary font-medium">
                  {cm.new}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Design Philosophy Changes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">設計思想の5大変化</h2>
        <div className="space-y-4">
          {designChanges.map((dc, i) => (
            <div key={i} className="rounded-xl border border-border bg-card/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{dc.title}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium mb-1">
                    <X className="h-3 w-3" /> 旧
                  </div>
                  <div className="text-sm text-muted-foreground">{dc.old}</div>
                </div>
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
                    <Check className="h-3 w-3" /> 新
                  </div>
                  <div className="text-sm text-foreground">{dc.new}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <Zap className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                  <div><strong>技術的影響:</strong> {dc.impact}</div>
                </div>
                <div className="flex items-start gap-1.5 text-primary bg-primary/5 p-2 rounded">
                  <Heart className="h-3 w-3 mt-0.5 shrink-0" />
                  <div><strong>あなたへのメリット:</strong> {dc.userBenefit}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Scoring: Old vs New */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4">エンゲージメントスコアリングの進化</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <X className="h-3.5 w-3.5 text-red-400" />
              旧: 固定重み (10種)
            </h3>
            <div className="space-y-1.5">
              {engagementComparison.old.map((e) => (
                <div
                  key={e.action}
                  className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-1.5 text-xs"
                >
                  <span className="font-mono text-muted-foreground">{e.action}</span>
                  <span
                    className={cn(
                      "font-mono font-bold",
                      parseFloat(e.weight) > 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {e.weight}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              score = Σ (固定weight × P(engagement))
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              新: 動的予測 (15種)
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {engagementComparison.new.map((p, i) => (
                <div
                  key={p}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-xs font-mono text-center border",
                    i < 4
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : i < 6
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : i < 10
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : i < 11
                            ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}
                >
                  {p}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              score = Σ (Transformerが動的に決定する重み × P(action))
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaway */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="text-lg font-semibold mb-3">💡 実践的な意味</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            旧アルゴリズムで有効だった戦略の「数値」（リプ75倍、報告-369等）は新アルゴリズムでは固定値として存在しませんが、
            <strong className="text-foreground">方向性は維持</strong>されています：
          </p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>双方向会話（リプライ + 著者返信）は依然として最も重要</li>
            <li>ネガティブフィードバック（ブロック/ミュート/報告）の抑制は引き続き重要</li>
            <li>投稿直後の初速（エンゲージメント速度）はPhoenixの入力として残る</li>
            <li>新たに滞在時間 P(dwell) がスコアに加わった — 質の高いコンテンツが有利</li>
          </ul>
          <p className="bg-emerald-500/5 p-3 rounded-lg mt-3">
            🎯 <strong>結論:</strong> 「良質なコンテンツを作る」「エンゲージメントを大切にする」という基本方針は変わりません。
            ただし、AIが状況に応じてより柔軟に評価するようになりました。
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          次に読むべきページ
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <a
            href="/dashboard/phoenix"
            className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4 hover:bg-orange-500/10 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-400" />
              <div className="font-semibold">Phoenix</div>
              <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-xs text-muted-foreground">
              Grok ML解説（Two-Tower、Attention Mask、15アクション予測）
            </div>
          </a>
          <a
            href="/dashboard/thunder"
            className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 hover:bg-cyan-500/10 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <div className="font-semibold">Thunder</div>
              <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-xs text-muted-foreground">
              In-Network解説（Kafkaシミュレーター、3種ストア）
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
