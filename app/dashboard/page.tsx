"use client";

import { useState, useEffect } from "react";
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
  Flame,
  Target,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const quickActions = [
  {
    title: "パイプライン探索",
    description: "推薦アルゴリズムの全体像を理解",
    href: "/dashboard/explore",
    icon: GitBranch,
    color: "bg-primary",
  },
  {
    title: "TweepCredシミュレーター",
    description: "あなたの信頼度スコアを計算",
    href: "/dashboard/simulator",
    icon: Users,
    color: "bg-accent",
    paid: true,
  },
  {
    title: "エンゲージメント分析",
    description: "各アクションの重み付けを確認",
    href: "/dashboard/engagement",
    icon: BarChart3,
    color: "bg-[#00ba7c]",
  },
  {
    title: "Deep AI検索",
    description: "AIに質問してソースコードを探索",
    href: "/dashboard/deepwiki",
    icon: Search,
    color: "bg-orange-500",
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
    { id: "heavy_ranker", name: "Heavy Ranker", description: "AIスコアリングの仕組み", completed: false, viewCount: 0, plan: "STANDARD" },
    { id: "tweepcred", name: "TweepCred", description: "アカウント信頼度スコア", completed: false, viewCount: 0, plan: "STANDARD" },
    { id: "simclusters", name: "SimClusters", description: "興味コミュニティの分類", completed: false, viewCount: 0, plan: "STANDARD" },
    { id: "grok", name: "Grok統合", description: "AI品質評価と配信判定", completed: false, viewCount: 0, plan: "STANDARD" },
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

export default function DashboardPage() {
  const [progressData, setProgressData] = useState<ProgressData>(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewAchievement, setShowNewAchievement] = useState(false);

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
  }, []);

  const xpProgress = progressData
    ? ((progressData.totalXp % 50) / 50) * 100
    : 0;

  const completedTopics = progressData.learningTopics.filter((t) => t.completed).length ?? 0;
  const totalTopics = progressData.learningTopics.length ?? 8;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* New Achievement Toast */}
      {showNewAchievement && progressData.newAchievements && progressData.newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <Card className="glass border-yellow-500/50 bg-yellow-500/10 w-80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 text-2xl">
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

      {/* Header with Level */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            ダッシュボード
          </h1>
          <p className="mt-1 text-muted-foreground">
            Xアルゴリズムの学習を続けましょう
          </p>
        </div>
        {progressData && (
          <div className="flex items-center gap-3">
            <div data-tour="level-badge" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-bold text-foreground">Lv.{progressData.level}</span>
              <span className="text-xs text-muted-foreground">{progressData.totalXp} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* XP Progress Bar */}
      <Card className="glass border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-bold text-xl">
                {progressData.level}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    レベル {progressData.level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {progressData.totalXp} / {progressData.nextLevelXp} XP
                  </span>
                </div>
                <Progress value={xpProgress} className="h-3" />
                <p className="mt-1 text-xs text-muted-foreground">
                  次のレベルまであと {progressData.nextLevelXp - progressData.totalXp} XP
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="h-4 w-4 text-yellow-500" />
                {progressData.achievements.filter((a) => a.unlocked).length}/{progressData.achievements.length} 解除
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Stats Grid */}
      <div data-tour="stats-cards" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { title: "投稿数", value: progressData.stats.postCount, icon: FileText, color: "text-primary" },
          { title: "コメント数", value: progressData.stats.commentCount, icon: MessageSquare, color: "text-accent" },
          { title: "投票数", value: progressData.stats.voteCount, icon: ThumbsUp, color: "text-[#00ba7c]" },
          { title: "検証レポート", value: progressData.stats.verifiedPosts, icon: Target, color: "text-orange-500" },
        ].map((stat) => (
          <Card key={stat.title} className="glass">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value ?? 0}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div data-tour="quick-actions">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          クイックアクション
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="glass group h-full transition-all hover:glow-primary">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}
                    >
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    {action.paid && (
                      <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-500">
                        有料
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    開始する
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Learning Progress with Gamification */}
        <Card data-tour="learning-progress" className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              学習進捗
              <Badge variant="outline" className="ml-auto text-xs">
                {completedTopics}/{totalTopics} 完了
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {progressData.learningTopics.map((topic) => (
              <Link
                key={topic.id}
                href={topic.plan === "STANDARD" ? "#" : (TOPIC_LINKS[topic.id] ?? "#")}
                className="block"
              >
              <div
                className={`flex items-center gap-3 rounded-lg p-3 transition-colors cursor-pointer ${
                  topic.completed
                    ? "bg-primary/5 border border-primary/20"
                    : topic.plan === "STANDARD"
                      ? "bg-muted/30 opacity-70 cursor-not-allowed"
                      : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  topic.completed
                    ? "bg-primary text-white"
                    : topic.plan === "STANDARD"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-muted-foreground/10 text-muted-foreground"
                }`}>
                  {topic.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : topic.plan === "STANDARD" ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-xs font-medium">{topic.viewCount}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-medium ${topic.completed ? "text-primary" : "text-foreground"}`}>
                      {topic.name}
                    </p>
                    {topic.plan === "STANDARD" && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-yellow-500/40 text-yellow-500">
                        Standard
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{topic.description}</p>
                </div>
                {topic.viewCount > 0 && !topic.completed && topic.plan !== "STANDARD" && (
                  <span className="text-xs text-muted-foreground">{topic.viewCount}回閲覧</span>
                )}
              </div>
              </Link>
            ))}
            <Link href="/dashboard/explore">
              <Button variant="outline" className="mt-2 w-full bg-transparent">
                学習を続ける
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              アチーブメント
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {progressData.achievements.map((achievement) => {
                const tierColor = achievement.tier === "gold"
                  ? "border-yellow-500/40 bg-yellow-500/5"
                  : achievement.tier === "silver"
                    ? "border-slate-400/40 bg-slate-400/5"
                    : "border-amber-700/30 bg-amber-700/5";
                return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-2.5 rounded-lg p-3 transition-all ${
                    achievement.unlocked
                      ? `${tierColor}`
                      : "bg-muted/30 opacity-40 border border-transparent"
                  } ${achievement.unlocked ? "border" : ""}`}
                >
                  <span className={`text-xl ${!achievement.unlocked && "grayscale"}`}>
                    {achievement.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {achievement.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {achievement.description}
                    </p>
                    <p className={`text-[10px] font-medium ${
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
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">最近のアルゴリズム更新</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentUpdates.map((update, index) => (
            <div
              key={index}
              className="flex gap-4 rounded-lg bg-muted/50 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">
                    {update.title}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
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
                <p className="mt-1 text-sm text-muted-foreground">
                  {update.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {update.date}
                </p>
              </div>
            </div>
          ))}
          <Link href="/dashboard/updates">
            <Button variant="outline" className="w-full bg-transparent">
              すべての更新を見る
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
