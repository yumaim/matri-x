"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  Users,
  BarChart3,
  Search,
  TrendingUp,
  ArrowRight,
  Zap,
  Clock,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
  },
  {
    title: "エンゲージメント分析",
    description: "各アクションの重み付けを確認",
    href: "/dashboard/engagement",
    icon: BarChart3,
    color: "bg-[#00ba7c]",
  },
  {
    title: "DeepWiki AI検索",
    description: "AIに質問してソースコードを探索",
    href: "/dashboard/deepwiki",
    icon: Search,
    color: "bg-orange-500",
  },
];

const stats = [
  {
    title: "シミュレーション回数",
    key: "simulationCount" as const,
    icon: Users,
  },
  {
    title: "投稿数",
    key: "postCount" as const,
    icon: FileText,
  },
  {
    title: "コメント数",
    key: "commentCount" as const,
    icon: MessageSquare,
  },
  {
    title: "受け取った投票数",
    key: "receivedVotes" as const,
    icon: ThumbsUp,
  },
];

const recentUpdates = [
  {
    title: "リプライの重み付けが調整されました",
    date: "2025年2月3日",
    impact: "HIGH",
    description: "著者リプライの重み付けが150xから140xに変更",
  },
  {
    title: "SimClustersの更新サイクル変更",
    date: "2025年2月1日",
    impact: "MEDIUM",
    description: "クラスタ更新が週次から日次に変更",
  },
  {
    title: "新しいTrust & Safetyフィルター追加",
    date: "2025年1月28日",
    impact: "LOW",
    description: "スパム検出の精度が向上",
  },
];

const learningProgress = [
  { name: "パイプライン基礎", progress: 100 },
  { name: "エンゲージメント重み付け", progress: 85 },
  { name: "TweepCred理解", progress: 60 },
  { name: "SimClusters", progress: 40 },
  { name: "Trust & Safety", progress: 20 },
];

interface UserStats {
  simulationCount: number;
  postCount: number;
  commentCount: number;
  receivedVotes: number;
}

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/users/me/stats");
        if (res.ok) {
          const data = await res.json();
          setUserStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            ダッシュボード
          </h1>
          <p className="mt-1 text-muted-foreground">
            Xアルゴリズムの学習を続けましょう
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            Pro Plan
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {userStats ? userStats[stat.key] : "—"}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          クイックアクション
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="glass group h-full transition-all hover:glow-primary">
                <CardContent className="p-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
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
        {/* Learning Progress */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">学習進捗</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {learningProgress.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
            <Button variant="outline" className="mt-4 w-full bg-transparent">
              学習を続ける
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

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
            <Button variant="outline" className="w-full bg-transparent">
              すべての更新を見る
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
