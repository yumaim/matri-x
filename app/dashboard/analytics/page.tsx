"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  TrendingUp,
  Activity,
  FlaskConical,
  GraduationCap,
  Trophy,
  Star,
  Zap,
  Eye,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  overview: {
    totalPosts: number;
    totalComments: number;
    receivedLikes: number;
    receivedBookmarks: number;
  };
  dailyActivity: {
    date: string;
    posts: number;
    comments: number;
  }[];
  popularPosts: {
    id: string;
    title: string;
    viewCount: number;
    voteScore: number;
    commentCount: number;
    bookmarkCount: number;
    createdAt: string;
  }[];
  engagement: {
    avgCommentsPerPost: number;
    avgVotesPerPost: number;
  };
  simulation: {
    count: number;
  };
  learning: {
    completedTopics: number;
    totalXP: number;
    level: number;
    achievementCount: number;
  };
}

const chartConfig = {
  posts: {
    label: "投稿",
    color: "#1d9bf0",
  },
  comments: {
    label: "コメント",
    color: "#7856ff",
  },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "今日";
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  return `${months}ヶ月前`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  subtext?: string;
}) {
  return (
    <Card className="glass">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color }}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {subtext && (
              <p className="text-[10px] text-muted-foreground">{subtext}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${p}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              <span className="text-gradient">アナリティクス</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              あなたの活動統計と成長を確認
            </p>
          </div>
        </div>

        {/* Period Filter */}
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList className="glass">
            <TabsTrigger value="7" className="text-xs sm:text-sm">
              7日間
            </TabsTrigger>
            <TabsTrigger value="30" className="text-xs sm:text-sm">
              30日間
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              全期間
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading || !data ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={FileText}
              label="総投稿数"
              value={data.overview.totalPosts}
              color="#1d9bf0"
            />
            <StatCard
              icon={MessageSquare}
              label="総コメント数"
              value={data.overview.totalComments}
              color="#7856ff"
            />
            <StatCard
              icon={ThumbsUp}
              label="獲得いいね"
              value={data.overview.receivedLikes}
              color="#00ba7c"
            />
            <StatCard
              icon={Bookmark}
              label="獲得ブックマーク"
              value={data.overview.receivedBookmarks}
              color="#f91880"
            />
          </div>

          {/* Activity Graph */}
          <Card className="glass overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                過去30日間の活動推移
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="h-[250px] sm:h-[300px] w-full"
                style={{ maxWidth: "100%", overflow: "hidden" }}
              >
                <AreaChart
                  data={data.dailyActivity}
                  margin={{ left: 0, right: 10, top: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#1d9bf0"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#1d9bf0"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="commentsGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#7856ff"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#7856ff"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted))"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    allowDecimals={false}
                    width={30}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "hsl(var(--muted-foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="posts"
                    stroke="#1d9bf0"
                    strokeWidth={2}
                    fill="url(#postsGrad)"
                    name="投稿"
                  />
                  <Area
                    type="monotone"
                    dataKey="comments"
                    stroke="#7856ff"
                    strokeWidth={2}
                    fill="url(#commentsGrad)"
                    name="コメント"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Popular Posts */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  人気投稿 Top 5
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.popularPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">まだ投稿がありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.popularPosts.map((post, i) => (
                      <Link
                        key={post.id}
                        href={`/dashboard/forum/${post.id}`}
                        className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium leading-tight line-clamp-1">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {post.voteScore}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.viewCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.commentCount}
                            </span>
                            <span>{timeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right column: Engagement + Simulation + Learning */}
            <div className="space-y-6">
              {/* Engagement Rate */}
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    エンゲージメント率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/50 p-4 text-center">
                      <p className="text-2xl font-bold text-primary tabular-nums">
                        {data.engagement.avgCommentsPerPost}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        平均コメント数/投稿
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4 text-center">
                      <p className="text-2xl font-bold text-accent tabular-nums">
                        {data.engagement.avgVotesPerPost}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        平均投票数/投稿
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Simulation */}
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-emerald-500" />
                    シミュレーション利用
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "rgba(0,186,124,0.1)" }}
                    >
                      <FlaskConical className="h-7 w-7 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-emerald-500 tabular-nums">
                        {data.simulation.count}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        シミュレーション実行回数
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-accent" />
                    学習進捗サマリー
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <p className="text-xl font-bold text-accent tabular-nums">
                        {data.learning.completedTopics}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        完了トピック
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <p className="text-xl font-bold text-primary tabular-nums">
                        {data.learning.totalXP.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        総XP
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <p className="text-xl font-bold text-yellow-500 tabular-nums">
                          Lv.{data.learning.level}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        現在レベル
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <p className="text-xl font-bold text-amber-500 tabular-nums">
                          {data.learning.achievementCount}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        アチーブメント
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-6 w-12 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="glass">
        <CardContent className="p-6">
          <div className="h-[250px] w-full rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardContent className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass">
              <CardContent className="p-6">
                <div className="h-20 rounded-lg bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
