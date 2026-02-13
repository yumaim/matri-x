"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, TicketPlus, Activity, FileText, ThumbsUp, TrendingUp } from "lucide-react";
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
} from "recharts";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalPosts: number;
  totalComments: number;
  totalVotes: number;
  openTickets: number;
  totalTickets: number;
  recentSignups: { id: string; name: string | null; email: string | null; createdAt: string }[];
  signupsByDay?: { date: string; count: number }[];
  postsByDay?: { date: string; count: number }[];
  planDistribution?: { plan: string; count: number }[];
}

const PLAN_COLORS: Record<string, string> = {
  FREE: "#64748b",
  STANDARD: "#3b82f6",
  PRO: "#a855f7",
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/architect/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-20">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-red-400">データの取得に失敗しました</div>
    );
  }

  const cards = [
    { label: "総ユーザー数", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
    { label: "アクティブ (30日)", value: stats.activeUsers, icon: Activity, color: "text-emerald-400" },
    { label: "BAN済み", value: stats.bannedUsers, icon: Users, color: "text-red-400" },
    { label: "投稿数", value: stats.totalPosts, icon: FileText, color: "text-purple-400" },
    { label: "コメント数", value: stats.totalComments, icon: MessageCircle, color: "text-yellow-400" },
    { label: "投票数", value: stats.totalVotes, icon: ThumbsUp, color: "text-pink-400" },
    { label: "未対応チケット", value: stats.openTickets, icon: TicketPlus, color: "text-orange-400" },
    { label: "総チケット数", value: stats.totalTickets, icon: TicketPlus, color: "text-muted-foreground" },
  ];

  // Calculate 7-day trend
  const last7 = stats.signupsByDay?.slice(-7) ?? [];
  const prev7 = stats.signupsByDay?.slice(-14, -7) ?? [];
  const last7Count = last7.reduce((s, d) => s + d.count, 0);
  const prev7Count = prev7.reduce((s, d) => s + d.count, 0);
  const signupTrend = prev7Count > 0 ? ((last7Count - prev7Count) / prev7Count * 100).toFixed(0) : "—";

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">管理者ダッシュボード</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <c.icon className={`h-4 w-4 ${c.color}`} />
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
              <p className="text-2xl font-bold">{c.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Signups Chart */}
        {stats.signupsByDay && stats.signupsByDay.length > 0 && (
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                新規登録 (30日)
                {signupTrend !== "—" && (
                  <span className={`text-xs ${Number(signupTrend) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {Number(signupTrend) >= 0 ? "↑" : "↓"}{Math.abs(Number(signupTrend))}% vs 前週
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.signupsByDay}>
                    <defs>
                      <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#signupGrad)" strokeWidth={2} name="登録数" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Chart */}
        {stats.postsByDay && stats.postsByDay.length > 0 && (
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                投稿数 (30日)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.postsByDay}>
                    <defs>
                      <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#a855f7" fill="url(#postGrad)" strokeWidth={2} name="投稿数" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Plan Distribution + Recent Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plan Distribution */}
        {stats.planDistribution && stats.planDistribution.length > 0 && (
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">プラン分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="count"
                      nameKey="plan"
                      label={({ plan, count }: { plan: string; count: number }) => `${plan}: ${count}`}
                      labelLine={false}
                    >
                      {stats.planDistribution.map((entry) => (
                        <Cell key={entry.plan} fill={PLAN_COLORS[entry.plan] ?? "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Signups */}
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">最近の登録ユーザー</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentSignups.length === 0 ? (
              <p className="text-sm text-muted-foreground">まだユーザーがいません</p>
            ) : (
              <div className="space-y-2">
                {stats.recentSignups.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{u.name ?? "名前未設定"}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.email ? u.email.replace(/^(.{2}).*@/, "$1•••@") : "—"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                    </span>
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
