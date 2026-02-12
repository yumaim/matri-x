"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, TicketPlus, Activity, FileText, ThumbsUp } from "lucide-react";

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
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
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
    { label: "アクティブユーザー", value: stats.activeUsers, icon: Activity, color: "text-emerald-400" },
    { label: "BAN済み", value: stats.bannedUsers, icon: Users, color: "text-red-400" },
    { label: "投稿数", value: stats.totalPosts, icon: FileText, color: "text-purple-400" },
    { label: "コメント数", value: stats.totalComments, icon: MessageCircle, color: "text-yellow-400" },
    { label: "投票数", value: stats.totalVotes, icon: ThumbsUp, color: "text-pink-400" },
    { label: "未対応チケット", value: stats.openTickets, icon: TicketPlus, color: "text-orange-400" },
    { label: "総チケット数", value: stats.totalTickets, icon: TicketPlus, color: "text-muted-foreground" },
  ];

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
              <p className="text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">最近の登録ユーザー</CardTitle>
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
                    <p className="text-xs text-muted-foreground">{u.email}</p>
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
  );
}
