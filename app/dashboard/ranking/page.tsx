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
  Users,
  FileText,
  Sparkles,
  Star,
  ChevronUp,
  ChevronDown,
  Minus,
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

const RANK_STYLES = {
  1: {
    gradient: "from-yellow-400/20 via-amber-500/10 to-transparent",
    border: "border-yellow-500/40",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.15)]",
    text: "text-yellow-400",
    bg: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20",
    ring: "ring-yellow-400/50",
    label: "1st",
    emoji: "👑",
  },
  2: {
    gradient: "from-slate-300/15 via-gray-400/10 to-transparent",
    border: "border-slate-400/30",
    glow: "shadow-[0_0_15px_rgba(148,163,184,0.12)]",
    text: "text-slate-300",
    bg: "bg-gradient-to-r from-slate-400/15 to-gray-400/15",
    ring: "ring-slate-300/50",
    label: "2nd",
    emoji: "🥈",
  },
  3: {
    gradient: "from-amber-700/15 via-orange-600/10 to-transparent",
    border: "border-amber-600/30",
    glow: "shadow-[0_0_15px_rgba(180,83,9,0.12)]",
    text: "text-amber-500",
    bg: "bg-gradient-to-r from-amber-600/15 to-orange-600/15",
    ring: "ring-amber-500/50",
    label: "3rd",
    emoji: "🥉",
  },
} as const;

// ---------- Helpers ----------

function getRankDisplay(rank: number) {
  const style = RANK_STYLES[rank as keyof typeof RANK_STYLES];
  if (rank === 1)
    return (
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse" />
        <Crown className="h-6 w-6 text-yellow-400 relative z-10" />
      </div>
    );
  if (rank === 2)
    return <Medal className="h-5 w-5 text-slate-300" />;
  if (rank === 3)
    return <Medal className="h-5 w-5 text-amber-500" />;
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 text-xs font-bold text-muted-foreground tabular-nums">
      {rank}
    </span>
  );
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

function formatNumber(n: number) {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// ---------- Sub-components ----------

/** Top 3 podium for posts */
function TopPostsPodium({ posts }: { posts: RankedPost[] }) {
  const top3 = posts.slice(0, 3);
  if (top3.length === 0) return null;

  // Display order: 2nd, 1st, 3rd for podium effect
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumRanks = top3.length >= 3 ? [2, 1, 3] : top3.length >= 2 ? [2, 1] : [1];

  return (
    <div className="mb-6">
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {podiumOrder.map((post, idx) => {
          const rank = podiumRanks[idx];
          const style = RANK_STYLES[rank as keyof typeof RANK_STYLES];
          const isFirst = rank === 1;
          return (
            <Link
              key={post.id}
              href={`/dashboard/forum/${post.id}`}
              className={cn(
                "group relative flex flex-col items-center rounded-xl border p-3 sm:p-4 transition-all duration-300",
                "hover:scale-[1.03] cursor-pointer backdrop-blur-sm",
                style.border,
                style.glow,
                "bg-gradient-to-b",
                style.gradient,
                isFirst ? "w-[42%] sm:w-[36%]" : "w-[30%] sm:w-[28%]",
                isFirst ? "min-h-[160px] sm:min-h-[200px]" : "min-h-[130px] sm:min-h-[170px]"
              )}
            >
              {/* Rank badge */}
              <div
                className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                  style.bg,
                  style.text,
                  "border",
                  style.border
                )}
              >
                <span className="mr-1">{style.emoji}</span>
                {style.label}
              </div>

              {/* Author avatar */}
              <Avatar
                className={cn(
                  "mt-2 ring-2",
                  style.ring,
                  isFirst ? "h-12 w-12 sm:h-14 sm:w-14" : "h-9 w-9 sm:h-11 sm:w-11"
                )}
              >
                <AvatarImage src={post.author.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(post.author.name)}
                </AvatarFallback>
              </Avatar>

              {/* Post title */}
              <h4
                className={cn(
                  "mt-2 text-center font-semibold leading-tight line-clamp-2",
                  isFirst ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs"
                )}
              >
                {post.title}
              </h4>

              {/* Score */}
              <div className={cn("mt-auto pt-2 flex items-center gap-1", style.text)}>
                <ThumbsUp className="h-3 w-3" />
                <span className="text-xs font-bold tabular-nums">
                  {post.voteScore}
                </span>
              </div>

              {/* Author name */}
              <span className="text-[10px] text-muted-foreground truncate max-w-full mt-1">
                {post.author.name ?? "匿名"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PostRankCard({
  post,
  rank,
  animDelay,
}: {
  post: RankedPost;
  rank: number;
  animDelay: number;
}) {
  const cat = CATEGORY_LABELS[post.category];
  const isTop3 = rank <= 3;
  const style = isTop3
    ? RANK_STYLES[rank as keyof typeof RANK_STYLES]
    : null;

  return (
    <Link href={`/dashboard/forum/${post.id}`}>
      <div
        className={cn(
          "group relative flex items-start gap-3 rounded-xl border p-3 sm:p-4 transition-all duration-300",
          "hover:border-primary/40 hover:bg-card/80 cursor-pointer",
          "animate-[fadeInUp_0.3s_ease-out_both]",
          isTop3
            ? [style!.border, style!.glow, "bg-gradient-to-r", style!.gradient]
            : "border-border/30 bg-card/40 hover:shadow-[0_0_10px_rgba(29,155,240,0.08)]"
        )}
        style={{ animationDelay: `${animDelay}ms` }}
      >
        {/* Rank */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5 min-w-[32px]">
          {getRankDisplay(rank)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {cat && (
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", cat.color)}>
                {cat.label}
              </Badge>
            )}
            {post.isVerified && (
              <Badge
                variant="outline"
                className="border-emerald-500/50 text-emerald-400 text-[10px] px-1.5 py-0"
              >
                <FlaskConical className="h-2.5 w-2.5 mr-0.5" />
                検証済み
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarImage src={post.author.image ?? undefined} />
                <AvatarFallback className="text-[7px]">
                  {getInitials(post.author.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[80px]">{post.author.name ?? "匿名"}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              <span className="tabular-nums">{post.voteScore}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span className="tabular-nums">{formatNumber(post.viewCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span className="tabular-nums">{post._count.comments}</span>
            </div>
            <span className="ml-auto text-[10px]">{timeAgo(post.createdAt)}</span>
          </div>
        </div>

        {/* Score highlight for top 3 */}
        {isTop3 && (
          <div className={cn("hidden sm:flex flex-col items-center gap-0.5", style!.text)}>
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-bold tabular-nums">{post.voteScore}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

/** Top 3 users podium */
function TopUsersPodium({ users }: { users: RankedUser[] }) {
  const top3 = users.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-4 mb-4">
      {[top3[1], top3[0], top3[2]].filter(Boolean).map((user, idx) => {
        const ranks = top3.length >= 3 ? [2, 1, 3] : top3.length >= 2 ? [2, 1] : [1];
        const rank = ranks[idx];
        const style = RANK_STYLES[rank as keyof typeof RANK_STYLES];
        const isFirst = rank === 1;
        const total = user._count.posts + user._count.comments + user._count.votes;

        return (
          <div
            key={user.id}
            className={cn(
              "relative flex flex-col items-center rounded-xl border p-3 transition-all duration-300",
              style.border,
              "bg-gradient-to-b",
              style.gradient,
              isFirst ? "w-[38%] py-4" : "w-[28%] py-3"
            )}
          >
            {/* Rank emoji */}
            <span className={cn("text-lg mb-1", isFirst && "text-2xl")}>
              {style.emoji}
            </span>

            <Avatar
              className={cn(
                "ring-2",
                style.ring,
                isFirst ? "h-12 w-12 sm:h-14 sm:w-14" : "h-9 w-9 sm:h-10 sm:w-10"
              )}
            >
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <span
              className={cn(
                "mt-1.5 font-semibold truncate max-w-full text-center",
                isFirst ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs"
              )}
            >
              {user.name ?? "匿名"}
            </span>

            <div className={cn("flex items-center gap-1 mt-1", style.text)}>
              <Star className="h-3 w-3" />
              <span className="text-[10px] font-bold tabular-nums">{total}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UserRankCard({
  user,
  rank,
  animDelay,
}: {
  user: RankedUser;
  rank: number;
  animDelay: number;
}) {
  const isTop3 = rank <= 3;
  const style = isTop3 ? RANK_STYLES[rank as keyof typeof RANK_STYLES] : null;
  const totalContributions = user._count.posts + user._count.comments + user._count.votes;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-3 transition-all duration-300",
        "hover:border-primary/30 hover:bg-card/80",
        "animate-[fadeInUp_0.3s_ease-out_both]",
        isTop3
          ? [style!.border, "bg-gradient-to-r", style!.gradient]
          : "border-border/30 bg-card/40"
      )}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Rank */}
      <div className="flex flex-col items-center gap-0.5 min-w-[32px]">
        {getRankDisplay(rank)}
      </div>

      {/* Avatar */}
      <Avatar
        className={cn(
          "h-9 w-9 sm:h-10 sm:w-10",
          isTop3 && ["ring-2", style!.ring]
        )}
      >
        <AvatarImage src={user.image ?? undefined} />
        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate">
            {user.name ?? "匿名"}
          </span>
          {user.xHandle && (
            <span className="text-[10px] text-muted-foreground truncate">
              @{user.xHandle}
            </span>
          )}
        </div>
        {user.company && (
          <p className="text-[10px] text-muted-foreground truncate">{user.company}</p>
        )}
      </div>

      {/* Stats (desktop) */}
      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-0.5 min-w-[36px]">
          <FileText className="h-3 w-3" />
          <span className="font-semibold tabular-nums">{user._count.posts}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 min-w-[36px]">
          <MessageSquare className="h-3 w-3" />
          <span className="font-semibold tabular-nums">{user._count.comments}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 min-w-[36px]">
          <ThumbsUp className="h-3 w-3" />
          <span className="font-semibold tabular-nums">{user._count.votes}</span>
        </div>
      </div>

      {/* Stats (mobile) */}
      <div className="flex sm:hidden items-center gap-1 text-xs text-muted-foreground">
        <Trophy className="h-3.5 w-3.5" />
        <span className="font-semibold tabular-nums">{totalContributions}</span>
      </div>
    </div>
  );
}

function PostRankingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/30 bg-card/40 p-4">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-muted/60 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 rounded-md bg-muted/60 animate-pulse" />
              <div className="h-4 w-3/4 rounded-md bg-muted/60 animate-pulse" />
              <div className="h-3 w-1/2 rounded-md bg-muted/60 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserRankingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/30 bg-card/40 p-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-muted/60 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-muted/60 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-md bg-muted/60 animate-pulse" />
              <div className="h-3 w-20 rounded-md bg-muted/60 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Trophy;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Icon className="h-7 w-7 text-primary/60" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-foreground/80 mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-[240px]">{description}</p>
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

      if (tabId === "verified") {
        params.set("limit", "50");
      }

      const res = await fetch(`/api/forum/posts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      let fetchedPosts: RankedPost[] = data.posts ?? [];

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
    <div className="container mx-auto max-w-6xl space-y-6 sm:space-y-8 py-4 sm:py-6 px-4 overflow-x-hidden">
      {/* ─── Header ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(29,155,240,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(120,86,255,0.06),transparent_60%)]" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shadow-[0_0_20px_rgba(29,155,240,0.2)]">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">ランキング</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              フォーラムの人気投稿と貢献ユーザー
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Post Rankings — 2/3 width on lg ──── */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                投稿ランキング
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs value={postTab} onValueChange={setPostTab}>
                {/* Tab list with horizontal scroll on mobile */}
                <div
                  className="overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:mx-0 sm:px-0 mb-4"
                  style={{ touchAction: "pan-x" }}
                >
                  <TabsList className="inline-flex w-auto sm:grid sm:w-full sm:grid-cols-4 h-auto bg-muted/30 p-1 rounded-lg gap-1">
                    {POST_TABS.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="text-[11px] sm:text-sm gap-1.5 px-3 py-2 whitespace-nowrap data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md transition-all"
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {POST_TABS.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id}>
                    {loadingPosts ? (
                      <PostRankingSkeleton />
                    ) : posts.length === 0 ? (
                      <EmptyState
                        icon={Trophy}
                        title="まだ投稿がありません"
                        description="最初の投稿をして、ランキングのトップを目指しましょう！"
                      />
                    ) : (
                      <>
                        {/* Top 3 podium (only on popular tab) */}
                        {tab.id === "popular" && posts.length >= 3 && (
                          <TopPostsPodium posts={posts} />
                        )}

                        {/* List (skip top 3 on popular tab if podium is shown) */}
                        <div className="space-y-2">
                          {posts
                            .slice(
                              tab.id === "popular" && posts.length >= 3 ? 3 : 0
                            )
                            .map((post, i) => {
                              const rank =
                                tab.id === "popular" && posts.length >= 3
                                  ? i + 4
                                  : i + 1;
                              return (
                                <PostRankCard
                                  key={post.id}
                                  post={post}
                                  rank={rank}
                                  animDelay={i * 50}
                                />
                              );
                            })}
                        </div>
                      </>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* ─── User Rankings — 1/3 width on lg ──── */}
        <div className="space-y-4">
          <Card className="glass overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                貢献ユーザー
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingUsers ? (
                <UserRankingSkeleton />
              ) : users.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="ユーザーデータがありません"
                  description="フォーラムに参加して、ランキングに名前を刻もう！"
                />
              ) : (
                <>
                  {/* Top 3 podium */}
                  {users.length >= 3 && <TopUsersPodium users={users} />}

                  {/* Rest of list */}
                  <div className="space-y-2">
                    {users.slice(users.length >= 3 ? 3 : 0).map((user, i) => {
                      const rank = users.length >= 3 ? i + 4 : i + 1;
                      return (
                        <UserRankCard
                          key={user.id}
                          user={user}
                          rank={rank}
                          animDelay={i * 50}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Stats ─────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "登録ユーザー数", icon: Users, value: users.length > 0 ? users.length.toString() : "—" },
          { label: "ランキング投稿数", icon: FileText, value: posts.length > 0 ? posts.length.toString() : "—" },
          { label: "総コメント数", icon: MessageSquare, value: posts.length > 0 ? posts.reduce((sum, p) => sum + p._count.comments, 0).toString() : "—" },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="group relative overflow-hidden border-border/30 bg-card/40 hover:border-primary/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 text-center relative">
              <stat.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground/50" />
              <div className="text-3xl font-bold text-gradient tabular-nums">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Ad Placeholder ─────────────────────── */}
      <Card className="border-border/20 border-dashed bg-card/30">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="text-muted-foreground/30 text-sm mb-2">📢 広告枠</div>
          <p className="text-muted-foreground text-sm">
            matri-xに広告を掲載しませんか？
          </p>
          <a
            href="mailto:info@matri-x-algo.wiki"
            className="inline-block mt-3 text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
          >
            お問い合わせはこちら →
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
