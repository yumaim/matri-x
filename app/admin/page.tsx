"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  MessageSquare,
  MessageCircle,
  UserPlus,
  AlertTriangle,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  todayNewUsers: number;
  flaggedPosts: number;
  activeUsersLast7d: number;
  activeRate: number;
  planDistribution: { plan: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  userGrowth: { date: string; total: number; new: number }[];
  recentFlaggedPosts: {
    id: string;
    title: string;
    updatedAt: string;
    author: { name: string | null; email: string };
  }[];
}

const PLAN_COLORS: Record<string, string> = {
  FREE: "hsl(var(--chart-1))",
  STANDARD: "hsl(var(--chart-2))",
  PRO: "hsl(var(--chart-3))",
};

const CATEGORY_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">エラー: {error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "総ユーザー数",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "投稿数",
      value: stats?.totalPosts ?? 0,
      icon: MessageSquare,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "コメント数",
      value: stats?.totalComments ?? 0,
      icon: MessageCircle,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "今日の新規登録",
      value: stats?.todayNewUsers ?? 0,
      icon: UserPlus,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-card border-border">
            <CardContent className="p-6">
              {loading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.bgColor}`}
                  >
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-400/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                フラグ付き投稿
              </p>
              <p className="text-xl font-bold">
                {loading ? (
                  <Skeleton className="h-6 w-8 inline-block" />
                ) : (
                  stats?.flaggedPosts ?? 0
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10">
              <Activity className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                週間アクティブ
              </p>
              <p className="text-xl font-bold">
                {loading ? (
                  <Skeleton className="h-6 w-8 inline-block" />
                ) : (
                  stats?.activeUsersLast7d ?? 0
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                アクティブ率
              </p>
              <p className="text-xl font-bold">
                {loading ? (
                  <Skeleton className="h-6 w-8 inline-block" />
                ) : (
                  `${stats?.activeRate ?? 0}%`
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Growth Chart */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              ユーザー成長（過去30日）
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats?.userGrowth ?? []}>
                  <defs>
                    <linearGradient
                      id="colorNew"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(204 89% 53%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(204 89% 53%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(0 0% 15%)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(0 0% 60%)" }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(0 0% 60%)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 5%)",
                      border: "1px solid hsl(0 0% 15%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 98%)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(204 89% 53%)"
                    fillOpacity={1}
                    fill="url(#colorNew)"
                    name="累計"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">プラン分布</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats?.planDistribution ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="plan"
                    >
                      {(stats?.planDistribution ?? []).map((entry) => (
                        <Cell
                          key={entry.plan}
                          fill={
                            PLAN_COLORS[entry.plan] ??
                            "hsl(var(--chart-1))"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0 0% 5%)",
                        border: "1px solid hsl(0 0% 15%)",
                        borderRadius: "8px",
                        color: "hsl(0 0% 98%)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex justify-center gap-4">
                  {(stats?.planDistribution ?? []).map((entry) => (
                    <div
                      key={entry.plan}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            PLAN_COLORS[entry.plan] ??
                            "hsl(var(--chart-1))",
                        }}
                      />
                      <span className="text-muted-foreground">
                        {entry.plan}
                      </span>
                      <span className="font-medium">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">カテゴリ分布</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.categoryDistribution ?? []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(0 0% 15%)"
                  />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(0 0% 60%)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 5%)",
                      border: "1px solid hsl(0 0% 15%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 98%)",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(stats?.categoryDistribution ?? []).map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Flagged Posts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">
              最近のフラグ付き投稿
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (stats?.recentFlaggedPosts ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                フラグ付き投稿はありません
              </p>
            ) : (
              <div className="space-y-3">
                {(stats?.recentFlaggedPosts ?? []).map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.author.name ?? post.author.email}
                      </p>
                    </div>
                    <Badge
                      variant="destructive"
                      className="ml-2 shrink-0 text-[10px]"
                    >
                      FLAGGED
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
