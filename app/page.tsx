import Link from "next/link";
import { LPHeader } from "@/components/lp/lp-header";
import { TypewriterText } from "@/components/lp/typewriter-text";
import {
  Zap,
  ArrowRight,
  Play,
  Sparkles,
  GitBranch,
  Users,
  Cpu,
  Search,
  BarChart3,
  RefreshCw,
  ShieldCheck,
  BookOpen,
  Check,
  ChevronRight,
  Video,
  Brain,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matri-X | X(Twitter)アルゴリズム解析プラットフォーム",
  description:
    "Xの推薦アルゴリズムをソースコードレベルで完全解析。2025年最新のビデオファースト戦略・Grok AI・UUS対応。150倍エンゲージメント重み付け、パイプライン可視化。",
  alternates: {
    canonical: "https://matri-x.jp",
  },
  openGraph: {
    title: "Matri-X | X(Twitter)アルゴリズム解析プラットフォーム",
    description:
      "2025年最新アルゴリズム完全対応。ビデオファースト3.0×、リプライ150×の重み付け、Grok AIランキングをソースコードレベルで解析。",
    type: "website",
    siteName: "Matri-X",
    url: "https://matri-x.jp",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matri-X | X(Twitter)アルゴリズム解析プラットフォーム",
    description:
      "2025年最新Xアルゴリズムをソースコードレベルで完全解析するプラットフォーム",
  },
};

const stats = [
  { value: "150×", label: "最強エンゲージメント重み" },
  { value: "3.0×", label: "動画リーチブースト" },
  { value: "145K+", label: "SimClustersコミュニティ" },
  { value: "27M", label: "Grok AIパラメータ" },
];

const features = [
  {
    icon: GitBranch,
    title: "パイプライン探索",
    description: "候補取得からランキング、フィルタリングまでの全フローを視覚化",
  },
  {
    icon: Users,
    title: "TweepCredシミュレーター",
    description: "あなたのアカウント信頼度スコアをリアルタイムで予測",
  },
  {
    icon: Cpu,
    title: "SimClusters解説",
    description: "興味関心クラスタリングの仕組みを深く理解",
  },
  {
    icon: Search,
    title: "Deep AI検索",
    description: "アルゴリズムの疑問をAIに質問して即座に回答",
  },
  {
    icon: BarChart3,
    title: "エンゲージメント分析",
    description: "各アクションの重み付けを詳細に可視化",
  },
  {
    icon: RefreshCw,
    title: "リアルタイム更新",
    description: "GitHubコミットを追跡し最新変更を自動反映",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    description: "フィルタリングロジックとセーフティ機能を解説",
  },
  {
    icon: BookOpen,
    title: "学習コンテンツ",
    description: "ステップバイステップのチュートリアルとケーススタディ",
  },
];

const engagementWeights = [
  { action: "リプライ + 著者返信", weight: "150", color: "bg-primary" },
  { action: "リポスト", weight: "20.0", color: "bg-accent" },
  { action: "リプライ", weight: "13.5", color: "bg-primary/80" },
  { action: "プロフィール→アクション", weight: "12.0", color: "bg-orange-500" },
  { action: "リンククリック (2分+)", weight: "11.0", color: "bg-[#00ba7c]" },
  { action: "ブックマーク", weight: "10.0", color: "bg-cyan-500" },
  { action: "いいね", weight: "1.0", color: "bg-pink-500" },
  { action: "スパム報告", weight: "-369", color: "bg-red-600" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "¥0",
    description: "アルゴリズムの基礎を無料で学ぶ",
    features: [
      "パイプライン基礎解説",
      "エンゲージメント重み確認",
      "コミュニティ閲覧",
      "アルゴリズム更新通知",
    ],
    cta: "今すぐ無料で始める",
    popular: false,
    comingSoon: false,
  },
  {
    name: "Standard",
    price: "¥2,980",
    period: "/月",
    description: "シミュレーターで実践的に分析",
    features: [
      "Free全機能",
      "エンゲージメントシミュレーター",
      "TweepCred分析",
      "コミュニティ閲覧",
      "メールサポート",
    ],
    cta: "Coming Soon",
    popular: true,
    comingSoon: true,
  },
  {
    name: "Pro",
    price: "¥5,980",
    period: "/月",
    description: "AI検索・視覚化でアルゴリズムを完全攻略",
    features: [
      "Standard全機能",
      "DeepWiki AI検索 無制限",
      "SimClusters視覚化",
      "週次レポート",
      "コミュニティ投稿",
      "優先サポート",
    ],
    cta: "Coming Soon",
    popular: false,
    comingSoon: true,
  },
  {
    name: "Enterprise",
    price: "お問い合わせ",
    period: "",
    description: "チーム・代理店向けの高度な分析環境",
    features: [
      "Pro全機能",
      "API アクセス",
      "チームプライベートフォーラム",
      "専属担当 (SLA)",
    ],
    cta: "Coming Soon",
    popular: false,
    comingSoon: true,
  },
];

const pipelineSteps = [
  {
    step: "01",
    title: "候補取得",
    desc: "あなたのタイムラインに表示する候補を約1,400件収集します",
    color: "bg-primary",
    tags: ["フォロー中 50%", "フォロー外 50%"],
  },
  {
    step: "02",
    title: "ランキング",
    desc: "Grok AI（27Mパラメータ Transformer）が「あなたが反応しそうな投稿」を予測してスコアをつけます",
    color: "bg-accent",
    tags: ["約1,000件に絞込", "Grok AI"],
  },
  {
    step: "03",
    title: "フィルタリング",
    desc: "安全でない投稿や、同じ人の投稿が連続しないように調整します",
    color: "bg-[#00ba7c]",
    tags: ["約700件に絞込"],
  },
  {
    step: "04",
    title: "配信",
    desc: "広告やおすすめユーザーと組み合わせて、タイムラインが完成します",
    color: "bg-orange-500",
    tags: ["最終50件を表示"],
  },
];

const algorithmHighlights = [
  {
    icon: Video,
    title: "ビデオファースト戦略",
    subtitle: "2025年、Xは動画中心モデルへ完全移行",
    items: [
      { label: "ネイティブ動画", value: "3.0×", color: "text-primary" },
      { label: "動画", value: "2.5×", color: "text-primary/80" },
      { label: "複数画像", value: "2.0×", color: "text-orange-500" },
      { label: "画像", value: "1.8×", color: "text-cyan-500" },
      { label: "外部リンク", value: "0.8×", color: "text-red-400" },
    ],
  },
  {
    icon: Brain,
    title: "Grok AI Heavy Ranker",
    subtitle: "27Mパラメータ Transformer がFor Youを決定",
    items: [
      { label: "パラメータ数", value: "27M", color: "text-primary" },
      { label: "フォロー中フィード", value: "関連度順", color: "text-orange-500" },
      { label: "フォロータブ", value: "時系列", color: "text-cyan-500" },
    ],
  },
  {
    icon: Clock,
    title: "Unregretted User-Seconds",
    subtitle: "ユーザーが後悔しない滞在時間を最大化する新指標",
    items: [
      { label: "情報的", value: "1.3×", color: "text-primary" },
      { label: "教育的", value: "1.25×", color: "text-[#00ba7c]" },
      { label: "エンタメ", value: "1.2×", color: "text-orange-500" },
      { label: "ネガティブ", value: "0.7×", color: "text-red-400" },
      { label: "炎上系", value: "0.85×", color: "text-red-400" },
    ],
  },
  {
    icon: Shield,
    title: "90日ルール & TweepCred",
    subtitle: "アカウント信頼度がリーチを決定づける",
    items: [
      { label: "新規 (<90日)", value: "0.5×", color: "text-red-400" },
      { label: "ベテラン (>1年)", value: "1.2×", color: "text-[#00ba7c]" },
      { label: "Premium", value: "2〜4×", color: "text-primary" },
      { label: "TweepCred閾値", value: ">0.65", color: "text-orange-500" },
    ],
  },
];

const personas = [
  {
    icon: "🎨",
    title: "クリエイター",
    subtitle: "ビデオファースト時代にリーチを伸ばしたいクリエイター",
    description:
      "動画3.0×ブースト、リンク0.8×ペナルティなどの最新係数を把握し、BAN・シャドウバンのリスクを回避しながら最大リーチを実現",
  },
  {
    icon: "🏢",
    title: "マーケティング企業",
    subtitle: "Grok AI & UUS時代のトレンドをキャッチしたい企業",
    description:
      "Grok AIランキング、UUSスコアなど2025年最新のアルゴリズム変更を即座にキャッチし、データドリブンな戦略を立案",
  },
  {
    icon: "📊",
    title: "X運用代行",
    subtitle: "150倍の重み付けデータで案件獲得したいX運用代行",
    description:
      "リプライ150倍、ブックマーク10倍などソースコード解析という差別化要素で、クライアントに数値根拠ある提案を提供",
  },
  {
    icon: "⚡",
    title: "Xディープ界隈",
    subtitle: "90日ルール・TweepCredを活用したいXディープ層",
    description:
      "アカウント信頼度スコア、90日サンドボックス、フィード配分50:50の仕組みを理解して、最小労力で最大効果",
  },
];

function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24 sm:pt-32 pb-16 sm:pb-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">
              Xアルゴリズム完全解析
            </span>
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl min-h-[4.5rem] sm:min-h-[6rem] md:min-h-[7.5rem] lg:min-h-[9rem]">
            {/* SSR-visible text for SEO crawlers */}
            <span className="sr-only">動画3倍・リプライ150倍 — 2025年Xアルゴリズム完全解析 Matri-X</span>
            <TypewriterText />
          </h1>

          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            ソースコードから判明した2025年最新の重み付けで、Xアルゴリズムの真実を解き明かす。
            ビデオファースト時代の運用戦略が、数値根拠に基づいたものに変わります。
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="glow-primary group">
              <Link href="/register">
                今すぐ無料で始める
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="group bg-transparent">
              <Link href="#features">
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                アルゴリズムを覗く
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 sm:mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-4 sm:p-6 text-center transition-all hover:glow-primary"
            >
              <div className="text-2xl sm:text-3xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-5xl">
          <div className="glass rounded-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                推薦パイプライン概要
              </h2>
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
                ライブプレビュー
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {pipelineSteps.map((item, index) => (
                <div key={item.step} className="relative flex">
                  <div className="rounded-xl bg-muted/50 p-5 transition-all hover:bg-muted flex-1 flex flex-col">
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.color} text-sm font-bold text-white`}
                    >
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground flex-1">
                      {item.desc}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className={`rounded-full ${item.color} px-2.5 py-0.5 text-[10px] font-medium text-white`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="absolute top-1/2 -right-3 hidden w-6 -translate-y-1/2 md:flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">8つの主要機能</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            アルゴリズムを多角的に理解するためのツールセット
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass group rounded-2xl p-6 transition-all hover:glow-primary"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EngagementSection() {
  return (
    <section id="engagement" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">エンゲージメント重み付け</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            各アクションがどれだけスコアに影響するかを可視化
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {engagementWeights.map((item) => {
            const pct = Math.max(5, Math.min(100, (Math.abs(parseFloat(item.weight)) / 150) * 100));
            return (
              <div
                key={item.action}
                className="glass rounded-2xl p-6 transition-all md:hover:scale-105"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-foreground font-medium text-sm sm:text-base">
                    {item.action}
                  </span>
                  <span
                    className={`${item.color} rounded-full px-3 py-1 text-sm font-bold text-white shrink-0`}
                  >
                    {item.weight} ×
                  </span>
                </div>
                <div
                  className="mt-4 h-2 w-full rounded-full bg-muted"
                  role="meter"
                  aria-label={`${item.action}の重み: ${item.weight}倍`}
                  aria-valuenow={Math.abs(parseFloat(item.weight))}
                  aria-valuemin={0}
                  aria-valuemax={150}
                >
                  <div
                    className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="glass rounded-2xl p-6 border-l-4 border-orange-500">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" aria-hidden="true" />
              90日ルール
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              90日以上非アクティブなアカウントからのエンゲージメントは、
              スコア計算から除外されます。継続的な活動が重要です。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AlgorithmHighlightsSection() {
  return (
    <section id="algorithm-highlights" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">2025年 アルゴリズム最前線</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            ソースコードから解析した4つの重要な変化
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2">
          {algorithmHighlights.map((highlight) => (
            <div
              key={highlight.title}
              className="glass group rounded-2xl p-6 transition-all hover:glow-primary"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <highlight.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-foreground">
                    {highlight.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {highlight.subtitle}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {highlight.items.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg bg-muted/50 px-3 py-2 text-center transition-colors hover:bg-muted"
                  >
                    <div className={`text-lg font-bold ${item.color}`}>
                      {item.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonaSection() {
  return (
    <section id="persona" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">こんな方におすすめ</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Matri-Xはこんな方の課題を解決します
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="glass group rounded-2xl p-6 transition-all hover:glow-primary"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-3xl transition-colors group-hover:bg-primary/20">
                  {persona.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {persona.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {persona.subtitle}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">料金プラン</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            あなたのニーズに合ったプランをお選びください
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`glass rounded-3xl p-8 transition-all flex flex-col ${
                plan.popular
                  ? "ring-2 ring-primary glow-primary lg:scale-105"
                  : "hover:glow-accent"
              }`}
            >
              {plan.popular && (
                <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  人気プラン
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-gradient">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="ml-1 text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.comingSoon ? (
                <Button className="mt-8 w-full opacity-50 cursor-not-allowed" variant="outline" disabled>
                  {plan.cta}
                </Button>
              ) : (
                <Button asChild className={`mt-8 w-full ${plan.popular ? "glow-primary" : ""}`} variant={plan.popular ? "default" : "outline"}>
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl p-6 sm:p-12 text-center glow-primary">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">今すぐ始めましょう</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            2025年最新ビデオファースト × Grok AI時代のアルゴリズムを理解し、あなたのコンテンツ戦略を最適化しましょう。
          </p>
          <Button asChild size="lg" className="mt-8 glow-primary group">
            <Link href="/register">
              今すぐ無料で始める
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gradient">Matri-X</span>
          </div>
          <nav aria-label="フッターナビゲーション">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/terms"
                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                利用規約
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                プライバシー
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="https://tally.so/r/wA6o1z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="https://x.com/hubz_yuma"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="X (Twitter) 公式アカウント"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          &copy; 2026 Matri-X. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <LPHeader />
      <HeroSection />
      <FeaturesSection />
      <EngagementSection />
      <AlgorithmHighlightsSection />
      <PersonaSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
