"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
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
  Twitter,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "探索", href: "#features" },
  { name: "シミュレーター", href: "#engagement" },
  { name: "料金", href: "#pricing" },
];

const stats = [
  { value: "6,000+", label: "分析対象の特徴量" },
  { value: "75.0", label: "最強エンゲージメント重み" },
  { value: "145K", label: "SimClustersコミュニティ" },
  { value: "30分", label: "初速ウィンドウ" },
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
  { action: "リプライ + 著者返信", weight: "75.0", color: "bg-primary" },
  { action: "リプライ", weight: "13.5", color: "bg-primary/80" },
  { action: "プロフィール→EG", weight: "12.0", color: "bg-orange-500" },
  { action: "会話クリック→EG", weight: "11.0", color: "bg-[#00ba7c]" },
  { action: "2分以上滞在", weight: "10.0", color: "bg-cyan-500" },
  { action: "リポスト", weight: "1.0", color: "bg-accent" },
  { action: "いいね", weight: "0.5", color: "bg-pink-500" },
  { action: "スパム報告", weight: "-369", color: "bg-red-600" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "¥0",
    description: "アルゴリズムの基本を学びたい方",
    features: [
      "パイプライン概要閲覧",
      "基本的な重み付け表",
      "週1回の更新通知",
    ],
    cta: "無料で始める",
    popular: false,
    comingSoon: false,
  },
  {
    name: "Standard",
    price: "¥980",
    period: "/月",
    description: "本格的に学びたいマーケター・クリエイター",
    features: [
      "全機能アクセス",
      "TweepCredシミュレーター",
      "SimClusters詳細解説",
      "Deep AI検索(月50回)",
      "リアルタイム更新通知",
    ],
    cta: "Coming Soon",
    popular: true,
    comingSoon: true,
  },
  {
    name: "Pro",
    price: "¥2,980",
    period: "/月",
    description: "チームや代理店向けの高度な分析",
    features: [
      "Standard全機能",
      "Deep AI検索(無制限)",
      "API アクセス",
      "チーム共有機能",
      "優先サポート",
      "カスタムレポート",
    ],
    cta: "Coming Soon",
    popular: false,
    comingSoon: true,
  },
];

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">Matri-X</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Button asChild variant="ghost" size="sm"><Link href="/login">ログイン</Link></Button>
          <Button asChild size="sm" className="glow-primary"><Link href="/register">無料で始める</Link></Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm glass p-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-gradient">Matri-X</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 space-y-3">
                  <Button asChild variant="outline" className="w-full bg-transparent"><Link href="/login">ログイン</Link></Button>
                  <Button asChild className="w-full glow-primary"><Link href="/register">無料で始める</Link></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Xアルゴリズム完全解析
            </span>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-foreground">Xの推薦アルゴリズムを</span>
            <br />
            <span className="text-gradient">完全に理解する</span>
          </h1>

          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            オープンソース化されたX(旧Twitter)のアルゴリズムを視覚的・動的に学び、
            あなたのコンテンツ戦略を次のレベルへ引き上げましょう。
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="glow-primary group"><Link href="/register">無料で始める<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="group bg-transparent"><Link href="#pipeline"><Play className="mr-2 h-4 w-4" />デモを見る</Link></Button>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-6 text-center transition-all hover:glow-primary"
            >
              <div className="text-3xl font-bold text-gradient">
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
              <h3 className="text-lg font-semibold text-foreground">
                推薦パイプライン概要
              </h3>
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
                ライブプレビュー
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {[
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
                  desc: "AIが「あなたが反応しそうな投稿」を予測してスコアをつけます",
                  color: "bg-accent",
                  tags: ["約1,000件に絞込"],
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
              ].map((item, index) => (
                <div key={item.step} className="relative flex">
                  <div className="rounded-xl bg-muted/50 p-5 transition-all hover:bg-muted flex-1 flex flex-col">
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.color} text-sm font-bold text-white`}
                    >
                      {item.step}
                    </div>
                    <h4 className="font-semibold text-foreground">
                      {item.title}
                    </h4>
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
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
                <feature.icon className="h-6 w-6 text-primary" />
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">エンゲージメント重み付け</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            各アクションがどれだけスコアに影響するかを可視化
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {engagementWeights.map((item) => (
            <div
              key={item.action}
              className="glass rounded-2xl p-6 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">
                  {item.action}
                </span>
                <span
                  className={`${item.color} rounded-full px-3 py-1 text-sm font-bold text-white`}
                >
                  {item.weight}
                </span>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{
                    width: `${Math.max(5, Math.min(100, (Math.abs(parseFloat(item.weight)) / 75) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="glass rounded-2xl p-6 border-l-4 border-orange-500">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" />
              90日ルール
            </h4>
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

function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">料金プラン</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            あなたのニーズに合ったプランをお選びください
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
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
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.comingSoon ? (
                <Button className="mt-8 w-full opacity-50 cursor-not-allowed" variant="outline" disabled>
                  {plan.cta}
                </Button>
              ) : (
                <Button asChild className={`mt-8 w-full ${plan.popular ? "glow-primary" : ""}`} variant={plan.popular ? "default" : "outline"}><Link href="/register">{plan.cta}</Link></Button>
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="glass rounded-3xl p-12 text-center glow-primary">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">今すぐ始めましょう</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Xアルゴリズムを理解し、あなたのコンテンツ戦略を最適化しましょう。
          </p>
          <Button asChild size="lg" className="mt-8 glow-primary group"><Link href="/register">無料トライアルを開始<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-gradient">Matri-X</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              利用規約
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              プライバシー
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              お問い合わせ
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
            >
              <Twitter className="h-5 w-5" />
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
      <Header />
      <HeroSection />
      <FeaturesSection />
      <EngagementSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
