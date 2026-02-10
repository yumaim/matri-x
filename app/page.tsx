"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LPHeader } from "@/components/lp/lp-header";
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
  Twitter,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// navigation moved to components/lp/lp-header.tsx

const stats = [
  { value: "6,000+", label: "分析対象の特徴量" },
  { value: "75.0×", label: "最強エンゲージメント重み" },
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
    description: "今なら全機能が無料で使えます",
    features: [
      "パイプライン完全探索",
      "エンゲージメント重み付け分析",
      "TweepCredシミュレーター",
      "検証コミュニティ参加",
      "アルゴリズム更新通知",
    ],
    cta: "今すぐ無料で始める",
    popular: true,
    comingSoon: false,
  },
  {
    name: "Pro",
    price: "—",
    period: "",
    description: "より深い分析機能を準備中",
    features: [
      "Free全機能",
      "Deep AI検索",
      "高度なシミュレーション",
      "カスタムレポート",
      "優先サポート",
    ],
    cta: "Coming Soon",
    popular: false,
    comingSoon: true,
  },
  {
    name: "Enterprise",
    price: "—",
    period: "",
    description: "チーム・代理店向けの高度な分析",
    features: [
      "Pro全機能",
      "API アクセス",
      "チーム共有機能",
      "カスタムレポート",
      "専用サポート",
    ],
    cta: "Coming Soon",
    popular: false,
    comingSoon: true,
  },
];

// Header extracted to components/lp/lp-header.tsx for render isolation

const heroLines = [
  "\"いいね\"を追う運用、まだ続けますか？",
  "リプライの重みは、いいねの150倍",
  "Xのソースコードは、嘘をつかない",
  "根拠のない提案に、クライアントは気づく",
  "アルゴリズムを読んだ人だけが勝つ時代",
];

function TypewriterText() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentLine = heroLines[lineIndex];

    if (!isDeleting && charIndex <= currentLine.length) {
      timerRef.current = setTimeout(() => {
        setDisplayText(currentLine.slice(0, charIndex));
        setCharIndex((c) => c + 1);
      }, 100);
    } else if (!isDeleting && charIndex > currentLine.length) {
      timerRef.current = setTimeout(() => setIsDeleting(true), 3500);
    } else if (isDeleting && charIndex > 0) {
      timerRef.current = setTimeout(() => {
        setCharIndex((c) => c - 1);
        setDisplayText(currentLine.slice(0, charIndex - 1));
      }, 50);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setLineIndex((i) => (i + 1) % heroLines.length);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [charIndex, isDeleting, lineIndex]);

  return (
    <span className="text-gradient">
      {displayText}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
}

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
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Xアルゴリズム完全解析
            </span>
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl h-[4.5rem] sm:h-[6rem] md:h-[7.5rem] lg:h-[9rem] overflow-hidden">
            <TypewriterText />
          </h1>

          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            ソースコードから判明した実際の数値で、Xアルゴリズムの真実を解き明かす。
            あなたの運用戦略が、根拠に基づいたものに変わります。
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="glow-primary group"><Link href="/register">今すぐ無料で始める<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="group bg-transparent"><Link href="#features"><Play className="mr-2 h-4 w-4" />アルゴリズムを覗く</Link></Button>
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
                  {item.weight} ×
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl p-6 sm:p-12 text-center glow-primary">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">今すぐ始めましょう</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Xアルゴリズムを理解し、あなたのコンテンツ戦略を最適化しましょう。
          </p>
          <Button asChild size="lg" className="mt-8 glow-primary group"><Link href="/register">今すぐ無料で始める<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></Button>
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
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              プライバシー
            </Link>
            <Link
              href="https://tally.so/r/wA6o1z"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              お問い合わせ
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
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
      <LPHeader />
      <HeroSection />
      <FeaturesSection />
      <EngagementSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
