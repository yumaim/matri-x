"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GitBranch,
  Users,
  BarChart3,
  Search,
  ArrowRight,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  FileText,
  Trophy,
  Star,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  Lock,
  TrendingUp,
  Sparkles,
  Zap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const quickActions = [
  {
    title: "パイプライン探索",
    description: "推薦アルゴリズムの全体像を理解",
    href: "/dashboard/explore",
    icon: GitBranch,
    color: "from-[#1d9bf0] to-[#1a8cd8]",
    iconBg: "bg-[#1d9bf0]",
  },
  {
    title: "TweepCredシミュレーター",
    description: "あなたの信頼度スコアを計算",
    href: "/dashboard/simulator",
    icon: Users,
    color: "from-[#7856ff] to-[#6644ee]",
    iconBg: "bg-[#7856ff]",
    paid: true,
  },
  {
    title: "エンゲージメント分析",
    description: "各アクションの重み付けを確認",
    href: "/dashboard/engagement",
    icon: BarChart3,
    color: "from-[#00ba7c] to-[#00a06a]",
    iconBg: "bg-[#00ba7c]",
  },
  {
    title: "Deep AI検索",
    description: "AIに質問してソースコードを探索",
    href: "/dashboard/deepwiki",
    icon: Search,
    color: "from-orange-500 to-orange-600",
    iconBg: "bg-orange-500",
    paid: true,
  },
];

const recentUpdates = [
  {
    title: "X API 従量課金（Pay-Per-Use）に移行",
    date: "2026年2月1日",
    impact: "HIGH",
    description: "月額サブスク廃止。Analytics APIの一般開放、Activity Stream追加",
  },
  {
    title: "加速度（Velocity）重視の強化",
    date: "2025年12月15日",
    impact: "HIGH",
    description: "投稿後30分のリアルタイム特徴量ウィンドウの影響力が拡大",
  },
  {
    title: "Grok AIがコンテンツ品質評価に統合",
    date: "2025年10月1日",
    impact: "HIGH",
    description: "ツイートの品質を事前スコアリングし、初期表示の母数を調整",
  },
];

interface ProgressData {
  level: number;
  totalXp: number;
  nextLevelXp: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    xp: number;
    unlocked: boolean;
    tier: string;
  }>;
  learningTopics: Array<{
    id: string;
    name: string;
    description: string;
    completed: boolean;
    viewCount: number;
    plan: string;
  }>;
  stats: {
    postCount: number;
    commentCount: number;
    voteCount: number;
    simCount: number;
    verifiedPosts: number;
  };
  newAchievements: Array<{
    name: string;
    icon: string;
  }>;
}

const DEFAULT_PROGRESS: ProgressData = {
  level: 1,
  totalXp: 0,
  nextLevelXp: 50,
  achievements: [
    { id: "first_login", name: "はじめの一歩", description: "matri-xに初めてログイン", icon: "🎯", xp: 10, unlocked: false, tier: "bronze" },
    { id: "first_post", name: "発言者", description: "フォーラムに初投稿", icon: "💬", xp: 20, unlocked: false, tier: "bronze" },
    { id: "first_comment", name: "交流の第一歩", description: "初めてのコメント投稿", icon: "💭", xp: 15, unlocked: false, tier: "bronze" },
    { id: "first_vote", name: "いいね職人", description: "初めての投票", icon: "👆", xp: 10, unlocked: false, tier: "bronze" },
    { id: "5_posts", name: "常連メンバー", description: "フォーラムに5件投稿", icon: "📝", xp: 50, unlocked: false, tier: "silver" },
    { id: "10_comments", name: "議論好き", description: "10件以上のコメント", icon: "🗣️", xp: 30, unlocked: false, tier: "silver" },
    { id: "10_votes", name: "目利き", description: "10件以上の投票", icon: "👁️", xp: 20, unlocked: false, tier: "silver" },
    { id: "first_verification", name: "検証者", description: "初めての検証レポート", icon: "🔬", xp: 30, unlocked: false, tier: "silver" },
    { id: "20_posts", name: "情報発信者", description: "フォーラムに20件投稿", icon: "🏆", xp: 80, unlocked: false, tier: "gold" },
    { id: "community_builder", name: "コミュニティビルダー", description: "50件以上のコメント", icon: "🤝", xp: 50, unlocked: false, tier: "gold" },
    { id: "3_verifications", name: "検証マスター", description: "3件以上の検証レポート", icon: "⚗️", xp: 60, unlocked: false, tier: "gold" },
    { id: "popular_post", name: "バズメーカー", description: "10以上のスコアを獲得した投稿", icon: "🔥", xp: 40, unlocked: false, tier: "gold" },
    { id: "pipeline_master", name: "パイプラインマスター", description: "パイプライン探索を全セクション閲覧", icon: "🔧", xp: 40, unlocked: false, tier: "silver" },
    { id: "simulator_pro", name: "シミュレーター達人", description: "シミュレーターを5回以上使用", icon: "🧮", xp: 30, unlocked: false, tier: "silver" },
    { id: "deepwiki_seeker", name: "知識の探求者", description: "Deep AI検索で10回以上検索", icon: "🔍", xp: 30, unlocked: false, tier: "silver" },
    { id: "algorithm_sage", name: "アルゴリズム賢者", description: "全トピックの学習を完了", icon: "🧠", xp: 100, unlocked: false, tier: "gold" },
  ],
  learningTopics: [
    { id: "pipeline", name: "推薦パイプライン", description: "候補取得からランキングまでの全体フロー", completed: false, viewCount: 0, plan: "FREE" },
    { id: "engagement", name: "エンゲージメント重み付け", description: "いいね・リプライ・リポストの重み", completed: false, viewCount: 0, plan: "FREE" },
    { id: "velocity", name: "加速度とバイラル", description: "30分ウィンドウと拡散の仕組み", completed: false, viewCount: 0, plan: "FREE" },
    { id: "filters", name: "フィルタリング", description: "安全性・多様性・品質フィルター", completed: false, viewCount: 0, plan: "FREE" },
    { id: "heavy_ranker", name: "Heavy Ranker", description: "AIスコアリングの仕組み", completed: false, viewCount: 0, plan: "PRO" },
    { id: "tweepcred", name: "TweepCred", description: "アカウント信頼度スコア", completed: false, viewCount: 0, plan: "PRO" },
    { id: "simclusters", name: "SimClusters", description: "興味コミュニティの分類", completed: false, viewCount: 0, plan: "PRO" },
    { id: "grok", name: "Grok統合", description: "AI品質評価と配信判定", completed: false, viewCount: 0, plan: "PRO" },
  ],
  stats: { postCount: 0, commentCount: 0, voteCount: 0, simCount: 0, verifiedPosts: 0 },
  newAchievements: [],
};

const TOPIC_LINKS: Record<string, string> = {
  pipeline: "/dashboard/explore",
  engagement: "/dashboard/engagement",
  velocity: "/dashboard/engagement",
  filters: "/dashboard/explore",
  heavy_ranker: "/dashboard/explore",
  tweepcred: "/dashboard/simulator",
  simclusters: "/dashboard/explore",
  grok: "/dashboard/updates",
};

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

/* ── Intersection Observer for staggered reveal ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── Stat card with animated value ── */
function StatCard({ title, value, icon: Icon, color, bgColor, borderColor, delay, isLoading }: {
  title: string; value: number; icon: typeof FileText;
  color: string; bgColor: string; borderColor: string; delay: number; isLoading: boolean;
}) {
  const displayVal = useCountUp(isLoading ? 0 : value, 900);
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Card className={`glass ${borderColor} group hover:scale-[1.05] hover:shadow-xl hover:-translate-y-1`} style={{ transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className={`h-8 w-8 rounded-full ${bgColor} opacity-30 blur-lg transition-opacity duration-300 group-hover:opacity-60`} />
          </div>
          <div className="mt-3">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {displayVal}
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{title}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const [progressData, setProgressData] = useState<ProgressData>(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewAchievement, setShowNewAchievement] = useState(false);
  const [activityData, setActivityData] = useState<Array<{ date: string; posts: number; comments: number }>>([]);
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch("/api/users/progress");
        if (res.ok) {
          const data = await res.json();
          setProgressData(data);
          if (data.newAchievements?.length > 0) {
            setShowNewAchievement(true);
            setTimeout(() => setShowNewAchievement(false), 5000);
          }
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProgress();

    // Fetch user name
    fetch("/api/users/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setUserName(d.name); })
      .catch(() => {});

    // Fetch activity data for graph
    fetch("/api/analytics?period=30d")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.dailyActivity?.length > 0) {
          setActivityData(d.dailyActivity);
        } else {
          // Initialize with empty 30 days
          const empty = [];
          for (let i = 29; i >= 0; i--) {
            const dt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            empty.push({ date: dt.toISOString().slice(0, 10), posts: 0, comments: 0 });
          }
          setActivityData(empty);
        }
      })
      .catch(() => {
        const empty = [];
        for (let i = 29; i >= 0; i--) {
          const dt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          empty.push({ date: dt.toISOString().slice(0, 10), posts: 0, comments: 0 });
        }
        setActivityData(empty);
      });
  }, []);

  const xpProgress = progressData
    ? ((progressData.totalXp % 50) / 50) * 100
    : 0;

  const completedTopics = progressData.learningTopics.filter((t) => t.completed).length ?? 0;
  const totalTopics = progressData.learningTopics.length ?? 8;
  const unlockedAchievements = progressData.achievements.filter((a) => a.unlocked).length;
  const totalAchievements = progressData.achievements.length;

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "おやすみの時間です";
    if (hour < 12) return "おはようございます";
    if (hour < 18) return "こんにちは";
    return "こんばんは";
  };

  const statItems = [
    { title: "投稿数", value: progressData.stats.postCount, icon: FileText, color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/20" },
    { title: "コメント数", value: progressData.stats.commentCount, icon: MessageSquare, color: "text-accent", bgColor: "bg-accent/10", borderColor: "border-accent/20" },
    { title: "投票数", value: progressData.stats.voteCount, icon: ThumbsUp, color: "text-[#00ba7c]", bgColor: "bg-[#00ba7c]/10", borderColor: "border-[#00ba7c]/20" },
    { title: "検証レポート", value: progressData.stats.verifiedPosts, icon: Target, color: "text-orange-500", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" },
  ];

  /* reveal hooks for sections */
  const heroReveal = useReveal();
  const xpReveal = useReveal();
  const activityReveal = useReveal();
  const quickReveal = useReveal();
  const twoColReveal = useReveal();
  const updatesReveal = useReveal();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-x-hidden max-w-[1400px] mx-auto">
      {/* New Achievement Toast */}
      {showNewAchievement && progressData.newAchievements && progressData.newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <Card className="glass border-yellow-500/50 bg-yellow-500/10 w-80 shadow-lg shadow-yellow-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 text-2xl animate-bounce">
                {progressData.newAchievements[0]?.icon}
              </div>
              <div>
                <p className="text-xs text-yellow-500 font-semibold">🎉 アチーブメント解除！</p>
                <p className="text-sm font-bold text-foreground">{progressData.newAchievements[0]?.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Header — animated gradient mesh background */}
      <div
        ref={heroReveal.ref}
        className={`relative overflow-hidden rounded-2xl border border-border/50 p-6 sm:p-8 transition-all duration-700 bg-gradient-to-br from-primary/10 via-accent/5 to-[#00ba7c]/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-96 h-96 rounded-full bg-primary/15 blur-3xl" style={{ animation: "float 8s ease-in-out infinite" }} />
          <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 rounded-full bg-accent/15 blur-3xl" style={{ animation: "float 8s ease-in-out infinite 2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#00ba7c]/10 blur-3xl" style={{ animation: "float 8s ease-in-out infinite 4s" }} />
        </div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" style={{ animation: "sparkle 2s ease-in-out infinite" }} />
              <span className="text-sm text-primary font-medium">{getGreeting()}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {userName ? (
                <>
                  <span className="text-gradient">{userName}</span>さん
                </>
              ) : (
                "ダッシュボード"
              )}
            </h1>
            <p className="mt-1.5 text-muted-foreground">
              Xアルゴリズムの学習を続けましょう
            </p>
          </div>
          {progressData && (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 px-4 py-2.5 backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
                <Star className="h-5 w-5 text-yellow-500" style={{ animation: "sparkle 3s ease-in-out infinite 1s" }} />
                <span className="text-sm font-bold text-foreground">Lv.{progressData.level}</span>
                <div className="h-4 w-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">{progressData.totalXp} XP</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* XP Progress Bar */}
      <div
        ref={xpReveal.ref}
        className={`transition-all duration-700 delay-100 ${xpReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <Card className="glass border-primary/20 overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-bold text-xl shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105">
                {progressData.level}
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-black">
                  <Zap className="h-3 w-3" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground">
                    レベル {progressData.level}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {progressData.totalXp} / {progressData.nextLevelXp} XP
                  </span>
                </div>
                <div className="relative">
                  <Progress value={xpProgress} className="h-3" />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  次のレベルまであと <span className="text-primary font-semibold">{progressData.nextLevelXp - progressData.totalXp} XP</span>
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground font-medium">
                  {unlockedAchievements}/{totalAchievements}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid — animated counters with staggered reveal */}
      <div data-tour="stats-cards" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statItems.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 100} isLoading={isLoading} />
        ))}
      </div>

      {/* Activity Graph */}
      {activityData.length >= 0 && (
        <div
          ref={activityReveal.ref}
          className={`transition-all duration-700 ${activityReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Card className="glass overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  アクティビティ
                  <Badge variant="outline" className="ml-1 text-[10px]">30日間</Badge>
                </CardTitle>
                <Link href="/dashboard/analytics">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1">
                    詳細 <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  posts: { label: "投稿", color: "hsl(var(--primary))" },
                  comments: { label: "コメント", color: "hsl(var(--accent))" },
                }}
                className="h-[200px] w-full"
              >
                <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashComments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="posts" stroke="hsl(var(--primary))" fill="url(#dashPosts)" strokeWidth={2} />
                  <Area type="monotone" dataKey="comments" stroke="hsl(var(--accent))" fill="url(#dashComments)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div
        data-tour="quick-actions"
        ref={quickReveal.ref}
        className={`transition-all duration-700 ${quickReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            クイックアクション
          </h2>
        </div>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, i) => (
            <Link key={action.title} href={action.href}>
              <Card
                className="glass group h-full transition-all duration-300 hover:glow-primary hover:scale-[1.02] hover:border-primary/30"
                style={{ animation: `fadeInUp 0.5s ease-out ${i * 100}ms both` }}
              >
                <CardContent className="p-5 sm:p-6 relative overflow-hidden">
                  {/* Subtle background glow on hover */}
                  <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${action.color} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      {action.paid && (
                        <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-500">
                          開発中
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-3.5 font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                    <div className="mt-3.5 flex items-center text-sm text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                      開始する
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div
        ref={twoColReveal.ref}
        className={`grid gap-6 lg:grid-cols-2 transition-all duration-700 ${twoColReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* Learning Progress with Gamification */}
        <Card data-tour="learning-progress" className="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                学習進捗
              </CardTitle>
              <Badge variant="outline" className="text-xs font-medium">
                {completedTopics}/{totalTopics} 完了
              </Badge>
            </div>
            {/* Progress overview bar */}
            <div className="mt-2">
              <Progress value={(completedTopics / totalTopics) * 100} className="h-1.5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {progressData.learningTopics.map((topic) => {
              const isLocked = topic.plan === "PRO";
              const href = isLocked ? "#" : (TOPIC_LINKS[topic.id] ?? "#");
              return (
              <Link key={topic.id} href={href} className="block">
              <div
                className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-200 ${
                  topic.completed
                    ? "bg-primary/5 border border-primary/20"
                    : isLocked
                      ? "bg-muted/30 opacity-60 cursor-not-allowed"
                      : "bg-muted/50 hover:bg-muted/80 active:scale-[0.98]"
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                  topic.completed
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : isLocked
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-muted-foreground/10 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                }`}>
                  {topic.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isLocked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-medium ${topic.completed ? "text-primary" : "text-foreground"}`}>
                      {topic.name}
                    </p>
                    {isLocked && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-yellow-500/40 text-yellow-500">
                        Pro
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{topic.description}</p>
                </div>
                {!isLocked && !topic.completed && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                )}
              </div>
              </Link>
              );
            })}
            <Link href="/dashboard/explore">
              <Button variant="outline" className="mt-3 w-full bg-transparent hover:bg-primary/5 hover:border-primary/30 transition-all">
                学習を続ける
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
                アチーブメント
              </CardTitle>
              <Badge variant="outline" className="text-xs font-medium">
                {unlockedAchievements}/{totalAchievements} 解除
              </Badge>
            </div>
            <div className="mt-2">
              <Progress value={(unlockedAchievements / totalAchievements) * 100} className="h-1.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {progressData.achievements.map((achievement) => {
                const tierColor = achievement.tier === "gold"
                  ? "border-yellow-500/40 bg-yellow-500/5"
                  : achievement.tier === "silver"
                    ? "border-slate-400/40 bg-slate-400/5"
                    : "border-amber-700/30 bg-amber-700/5";
                const tierGlow = achievement.tier === "gold"
                  ? "shadow-yellow-500/20"
                  : achievement.tier === "silver"
                    ? "shadow-slate-400/15"
                    : "shadow-amber-700/10";
                return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-2.5 rounded-xl p-3 transition-all duration-300 ${
                    achievement.unlocked
                      ? `${tierColor} hover:scale-[1.04] shadow-md ${tierGlow} hover:shadow-lg`
                      : "bg-muted/30 opacity-40 border border-transparent"
                  } ${achievement.unlocked ? "border" : ""}`}
                >
                  <span className={`text-xl shrink-0 transition-transform duration-300 ${achievement.unlocked ? "hover:scale-110" : "grayscale"}`}>
                    {achievement.icon}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                      {achievement.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {achievement.description}
                    </p>
                    <p className={`text-[10px] font-semibold ${
                      achievement.tier === "gold" ? "text-yellow-500" 
                        : achievement.tier === "silver" ? "text-slate-400" 
                        : "text-amber-700"
                    }`}>
                      +{achievement.xp} XP
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Algorithm Updates */}
      <div
        ref={updatesReveal.ref}
        className={`transition-all duration-700 ${updatesReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <Card className="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                最近のアルゴリズム更新
              </CardTitle>
              <Link href="/dashboard/updates">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1">
                  すべて見る <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUpdates.map((update, index) => (
              <div
                key={index}
                className="flex gap-4 rounded-xl bg-muted/50 p-4 transition-all duration-200 hover:bg-muted/80 group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-foreground text-sm sm:text-base">
                      {update.title}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                        update.impact === "HIGH"
                          ? "bg-destructive/20 text-destructive"
                          : update.impact === "MEDIUM"
                            ? "bg-orange-500/20 text-orange-500"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {update.impact}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {update.description}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground/70">
                    {update.date}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Inline keyframes for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10px, -15px) scale(1.05); }
          66% { transform: translate(-8px, 8px) scale(0.95); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(0.85) rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
