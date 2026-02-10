"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  MessageSquare,
  Eye,
  ThumbsUp,
  FlaskConical,
  Loader2,
  Users,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ---------- Types ----------

interface PostAuthor {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  company?: string | null;
  xHandle?: string | null;
}

interface RankedPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isVerified: boolean;
  viewCount: number;
  createdAt: string;
  voteScore: number;
  userVote: number | null;
  isBookmarked: boolean;
  author: PostAuthor;
  _count: {
    comments: number;
    votes: number;
    evidence: number;
    bookmarks: number;
  };
}

interface RankedUser {
  id: string;
  name: string | null;
  image: string | null;
  company: string | null;
  xHandle: string | null;
  _count: {
    posts: number;
    comments: number;
    votes: number;
  };
}

// ---------- Constants ----------

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  ALGORITHM: { label: "アルゴリズム解説", color: "border-blue-500/50 text-blue-400" },
  VERIFICATION: { label: "現場検証", color: "border-purple-500/50 text-purple-400" },
  HEAVY_RANKER: { label: "Heavy Ranker", color: "border-cyan-500/50 text-cyan-400" },
  SIMCLUSTERS: { label: "SimClusters", color: "border-indigo-500/50 text-indigo-400" },
  TWEEPCRED: { label: "TweepCred", color: "border-pink-500/50 text-pink-400" },
  STRATEGY: { label: "戦略・Tips", color: "border-emerald-500/50 text-emerald-400" },
  UPDATES: { label: "最新アップデート", color: "border-orange-500/50 text-orange-400" },
  QUESTIONS: { label: "質問・相談", color: "border-yellow-500/50 text-yellow-400" },
};

const POST_TABS = [
  { id: "popular", label: "人気投稿", icon: ThumbsUp, sort: "most_voted" },
  { id: "trending", label: "注目投稿", icon: Eye, sort: "popular" },
  { id: "verified", label: "最新検証", icon: FlaskConical, sort: "latest" },
  { id: "active", label: "アクティブ議論", icon: MessageSquare, sort: "most_commented" },
] as const;

// ---------- Helpers ----------

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return (
    <span className="flex h-5 w-5 items-center justify-center text-xs font-bold text-muted-foreground">
      {rank}
    </span>
  );
}

function getRankBadge(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  return `${months}ヶ月前`;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

// ---------- Sub-components ----------

function PostRankCard({ post, rank }: { post: RankedPost; rank: number }) {
  const cat = CATEGORY_LABELS[post.category];
  const isTop3 = rank <= 3;

  return (
    <Link href={`/dashboard/forum/${post.id}`}>
      <Card
        className={cn(
          "glass transition-all hover:scale-[1.01] hover:border-primary/30 cursor-pointer",
          isTop3 && "border-primary/20"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Rank */}
            <div className="flex flex-col items-center gap-1 pt-1 min-w-[32px]">
              {getRankIcon(rank)}
              {getRankBadge(rank) && (
                <span className="text-sm">{getRankBadge(rank)}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {cat && (
                  <Badge variant="outline" className={cn("text-xs", cat.color)}>
                    {cat.label}
                  </Badge>
                )}
                {post.isVerified && (
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs">
                    <FlaskConical className="h-3 w-3 mr-1" />
                    検証済み
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                {post.title}
              </h3>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={post.author.image ?? undefined} />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(post.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{post.author.name ?? "匿名"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{post.voteScore}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{post._count.comments}</span>
                </div>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>

            {/* Score highlight for top 3 */}
            {isTop3 && (
              <div className="hidden sm:flex flex-col items-center gap-0.5 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-bold">{post.voteScore}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function UserRankCard({ user, rank }: { user: RankedUser; rank: number }) {
  const isTop3 = rank <= 3;
  const totalContributions = user._count.posts + user._count.comments + user._count.votes;

  return (
    <Card
      className={cn(
        "glass transition-all hover:scale-[1.01] hover:border-primary/30",
        isTop3 && "border-primary/20"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Rank */}
          <div className="flex flex-col items-center gap-1 min-w-[32px]">
            {getRankIcon(rank)}
            {getRankBadge(rank) && (
              <span className="text-sm">{getRankBadge(rank)}</span>
            )}
          </div>

          {/* Avatar */}
          <Avatar className={cn("h-10 w-10", isTop3 && "ring-2 ring-primary/40")}>
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">
                {user.name ?? "匿名"}
              </span>
              {user.xHandle && (
                <span className="text-xs text-muted-foreground truncate">
                  @{user.xHandle}
                </span>
              )}
            </div>
            {user.company && (
              <p className="text-xs text-muted-foreground truncate">{user.company}</p>
            )}
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-0.5">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-medium">{user._count.posts}</span>
              <span className="text-[10px]">投稿</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-medium">{user._count.comments}</span>
              <span className="text-[10px]">コメント</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="font-medium">{user._count.votes}</span>
              <span className="text-[10px]">投票</span>
            </div>
          </div>

          {/* Mobile stats */}
          <div className="flex sm:hidden items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" />
            <span className="font-medium">{totalContributions}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostRankingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="glass">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UserRankingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-muted animate-pulse" />
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------- Main Page ----------

export default function RankingPage() {
  const [postTab, setPostTab] = useState("popular");
  const [posts, setPosts] = useState<RankedPost[]>([]);
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch posts based on active tab
  const fetchPosts = useCallback(async (tabId: string) => {
    setLoadingPosts(true);
    try {
      const tabConfig = POST_TABS.find((t) => t.id === tabId);
      if (!tabConfig) return;

      const params = new URLSearchParams();
      params.set("sort", tabConfig.sort);
      params.set("limit", "20");

      // For "verified" tab, we need to fetch latest and filter client-side
      // since the API doesn't have a verified filter
      if (tabId === "verified") {
        params.set("limit", "50");
      }

      const res = await fetch(`/api/forum/posts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      let fetchedPosts: RankedPost[] = data.posts ?? [];

      // Filter for verified-only tab
      if (tabId === "verified") {
        fetchedPosts = fetchedPosts
          .filter((p: RankedPost) => p.isVerified)
          .slice(0, 20);
      }

      setPosts(fetchedPosts);
    } catch (e) {
      console.error("Fetch ranking posts error:", e);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // Fetch user ranking
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/forum/ranking/users");
      if (!res.ok) throw new Error("Failed to fetch user ranking");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error("Fetch user ranking error:", e);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(postTab);
  }, [postTab, fetchPosts]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">ランキング</h1>
          <p className="text-sm text-muted-foreground">
            フォーラムの人気投稿と貢献ユーザー
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Rankings — 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                投稿ランキング
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={postTab} onValueChange={setPostTab}>
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  {POST_TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="text-xs sm:text-sm gap-1"
                    >
                      <tab.icon className="h-3.5 w-3.5 hidden sm:block" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {POST_TABS.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id}>
                    {loadingPosts ? (
                      <PostRankingSkeleton />
                    ) : posts.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>まだ投稿がありません</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {posts.map((post, i) => (
                          <PostRankCard key={post.id} post={post} rank={i + 1} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* User Rankings — 1/3 width on large screens */}
        <div className="space-y-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                貢献ユーザーランキング
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <UserRankingSkeleton />
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>ユーザーデータがありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user, i) => (
                    <UserRankCard key={user.id} user={user} rank={i + 1} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Stats & Ad Placeholder ─────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3 mt-8">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-gradient tabular-nums">—</div>
            <div className="text-sm text-muted-foreground mt-1">登録ユーザー数</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-gradient tabular-nums">—</div>
            <div className="text-sm text-muted-foreground mt-1">検証レポート数</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-gradient tabular-nums">—</div>
            <div className="text-sm text-muted-foreground mt-1">コメント数</div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Placeholder */}
      <Card className="bg-card/50 border-border/50 border-dashed mt-6">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="text-muted-foreground/40 text-sm mb-2">📢 広告枠</div>
          <p className="text-muted-foreground text-sm">
            matri-xに広告を掲載しませんか？
          </p>
          <a
            href="mailto:info@matri-x-algo.wiki"
            className="inline-block mt-3 text-sm text-primary hover:text-primary/80 underline underline-offset-4"
          >
            お問い合わせはこちら →
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
