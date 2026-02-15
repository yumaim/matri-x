"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import Link from "next/link";
import {
  MessageCircle,
  BookOpen,
  TrendingUp,
  Flame,
  MessageSquare,
  HelpCircle,
  Search,
  Plus,
  Award,
  FlaskConical,
  Bookmark,
  ArrowUpDown,
  Loader2,
  Users,
  AlertCircle,
  FileEdit,
  Palette,
  Check,
  Sparkles,
  X,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { HEADER_COLORS, getBanner } from "@/lib/header-colors";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PostCard } from "@/components/forum/post-card";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", name: "すべて", icon: MessageCircle },
  { id: "ALGORITHM", name: "アルゴリズム解説", icon: BookOpen },
  { id: "STRATEGY", name: "戦略・Tips", icon: TrendingUp },
  { id: "UPDATES", name: "最新アップデート", icon: Flame },
  { id: "BUGS", name: "不具合・エラー", icon: AlertCircle },
  { id: "QUESTIONS", name: "質問・相談", icon: HelpCircle },
  { id: "VERIFICATION", name: "現場検証", icon: FlaskConical },
  { id: "HEAVY_RANKER", name: "Heavy Ranker", icon: TrendingUp },
  { id: "SIMCLUSTERS", name: "SimClusters", icon: Users },
  { id: "TWEEPCRED", name: "TweepCred", icon: Award },
  { id: "MURMUR", name: "つぶやき", icon: MessageSquare },
];

const sortOptions = [
  { id: "latest", label: "新着順" },
  { id: "popular", label: "人気順" },
  { id: "most_voted", label: "高評価順" },
  { id: "most_commented", label: "コメント順" },
];

interface Post {
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
  author: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
  _count: {
    comments: number;
    votes: number;
    evidence: number;
    bookmarks: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [profileTab, setProfileTab] = useState<"posts" | "bookmarks">("posts");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myUser, setMyUser] = useState<{ name: string | null; image: string | null; community: string | null; level: number; xp: number; postCount: number; commentCount: number; headerColor: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        setMyUserId(data.id ?? null);
        setMyUser({
          name: data.name ?? "匿名",
          image: data.image ?? null,
          community: data.community ?? null,
          level: data.level ?? 1,
          xp: data.xp ?? 0,
          postCount: data._count?.posts ?? 0,
          commentCount: data._count?.comments ?? 0,
          headerColor: data.headerColor ?? "blue",
        });
      })
      .catch(() => { });
  }, []);

  const fetchPosts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        params.set("sort", sortBy);
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (searchQuery) params.set("search", searchQuery);
        if (showBookmarked) params.set("bookmarked", "true");
        if (showMyPosts && myUserId) params.set("authorId", myUserId);

        const res = await fetch(`/api/forum/posts?${params}`);
        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch (e) {
        console.error("Fetch posts error:", e);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, searchQuery, sortBy, showBookmarked, showMyPosts, myUserId]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
  };

  const handleLoadMore = () => {
    if (!pagination || pagination.page >= pagination.totalPages) return;
    startTransition(async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", String(pagination.page + 1));
        params.set("limit", "20");
        params.set("sort", sortBy);
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (searchQuery) params.set("search", searchQuery);
        if (showBookmarked) params.set("bookmarked", "true");
        if (showMyPosts && myUserId) params.set("authorId", myUserId);

        const res = await fetch(`/api/forum/posts?${params}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPosts((prev) => [...prev, ...data.posts]);
        setPagination(data.pagination);
      } catch (e) {
        console.error("Load more error:", e);
      }
    });
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 overflow-x-hidden">
      {/* ─── Hero Header ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-5 sm:p-7 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(29,155,240,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(120,86,255,0.06),transparent_60%)]" />
        {/* Animated orbs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shadow-[0_0_20px_rgba(29,155,240,0.2)]">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
                フォーラム
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                アルゴリズムについてコミュニティと議論しましょう
              </p>
            </div>
          </div>
          <Link href="/dashboard/forum/new">
            <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200">
              <Plus className="h-4 w-4" />
              新規投稿
            </Button>
          </Link>
        </div>
        {/* Stats bar */}
        {pagination && (
          <div className="relative mt-4 pt-3 border-t border-border/20 flex items-center gap-6 text-xs text-muted-foreground animate-in fade-in duration-500">
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="font-semibold text-foreground tabular-nums">{pagination.total}</span> 件の投稿
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              コミュニティ
            </span>
          </div>
        )}
      </div>

      {/* ─── Search & Sort Bar ─────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className={cn(
          "relative flex-1 transition-all duration-200",
          searchFocused && "ring-1 ring-primary/40 rounded-md"
        )}>
          <Search className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
            searchFocused ? "text-primary" : "text-muted-foreground"
          )} />
          <Input
            ref={searchInputRef}
            placeholder="トピックを検索..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="pl-10 pr-10 bg-muted/30 border-border/50"
          />
          {searchInput && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-transparent gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4" />
                {sortOptions.find((s) => s.id === sortBy)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={cn(
                    "gap-2",
                    sortBy === opt.id && "bg-accent"
                  )}
                >
                  {sortBy === opt.id && <Check className="h-3 w-3 text-primary" />}
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={showBookmarked ? "default" : "outline"}
            size="icon"
            onClick={() => setShowBookmarked(!showBookmarked)}
            className={cn(
              "transition-all",
              showBookmarked
                ? "shadow-md shadow-primary/20"
                : "bg-transparent"
            )}
            title="ブックマーク済み"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active filters indicator */}
      {(searchQuery || selectedCategory !== "all" || showBookmarked || showMyPosts) && (
        <div className="flex items-center gap-2 flex-wrap text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-muted-foreground">フィルタ:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors" onClick={() => { setSearchInput(""); setSearchQuery(""); }}>
              検索: {searchQuery}
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors" onClick={() => setSelectedCategory("all")}>
              {categories.find(c => c.id === selectedCategory)?.name}
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          {showBookmarked && (
            <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors" onClick={() => setShowBookmarked(false)}>
              ブックマーク
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          {showMyPosts && (
            <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors" onClick={() => setShowMyPosts(false)}>
              自分の投稿
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          <button
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            onClick={() => { setSearchInput(""); setSearchQuery(""); setSelectedCategory("all"); setShowBookmarked(false); setShowMyPosts(false); }}
          >
            すべてクリア
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-4 min-w-0">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6 min-w-0">
          {/* Category Tabs — pill style with scroll indicator */}
          <div className="relative">
            <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide -mx-1 px-1" style={{ touchAction: "pan-x" }}>
              {categories.map((category) => {
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap shrink-0 border relative overflow-hidden",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary/50 scale-[1.02]"
                        : "bg-card/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground border-border/30 hover:border-border/60"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                    )}
                    <category.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 relative", isActive && "animate-in zoom-in-50 duration-200")} />
                    <span className="relative">{category.name}</span>
                  </button>
                );
              })}
            </div>
            {/* Scroll fade hint */}
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass border-border/30 overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                        <div className="flex gap-1.5">
                          <Skeleton className="h-5 w-20 rounded-lg" />
                          <Skeleton className="h-5 w-14 rounded-lg" />
                        </div>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-3 pt-1">
                          <Skeleton className="h-7 w-20 rounded-lg" />
                          <Skeleton className="h-7 w-16 rounded-lg" />
                          <Skeleton className="h-7 w-14 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="glass border-border/30 overflow-hidden">
              <CardContent className="py-16 sm:py-20 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(29,155,240,0.06),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,86,255,0.04),transparent_50%)]" />
                <div className="relative">
                  {searchQuery || selectedCategory !== "all" || showBookmarked ? (
                    <>
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/30 border border-border/30 mx-auto mb-5 animate-empty-bounce">
                        <Search className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        一致する投稿がありません
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        検索条件やフィルタを変更して、もう一度お試しください。
                        <br />別のカテゴリも覗いてみましょう。
                      </p>
                      <Button
                        variant="outline"
                        className="mt-5 gap-2 bg-transparent hover:bg-muted/30"
                        onClick={() => { setSearchInput(""); setSearchQuery(""); setSelectedCategory("all"); setShowBookmarked(false); }}
                      >
                        <X className="h-3.5 w-3.5" />
                        フィルタをリセット
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="relative mx-auto mb-6 w-fit">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 mx-auto shadow-[0_0_40px_rgba(29,155,240,0.15)] animate-empty-bounce">
                          <Sparkles className="h-9 w-9 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center animate-float" style={{ animationDelay: "0.5s" }}>
                          <MessageCircle className="h-3 w-3 text-accent" />
                        </div>
                        <div className="absolute -bottom-1 -left-3 h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                          <FlaskConical className="h-2.5 w-2.5 text-emerald-500" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        最初の投稿を作成しましょう！
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        コミュニティに参加して、アルゴリズムの知見を共有したり、
                        <br />質問を投げかけましょう。あなたの一歩が議論の始まりです。
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-6">
                        <Link href="/dashboard/forum/new">
                          <Button className="gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                            <Plus className="h-4 w-4" />
                            投稿を作成
                          </Button>
                        </Link>
                        <Link href={`/dashboard/forum/new?category=QUESTIONS&title=${encodeURIComponent("【質問】")}`}>
                          <Button variant="outline" className="gap-2 bg-transparent hover:bg-muted/30">
                            <HelpCircle className="h-4 w-4" />
                            質問する
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post, idx) => (
                <div
                  key={post.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {pagination && pagination.page < pagination.totalPages && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                className="bg-card/50 gap-2 hover:border-primary/40 hover:bg-card/80 transition-all group px-6"
                onClick={handleLoadMore}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4 rotate-90 group-hover:translate-y-0.5 transition-transform" />
                )}
                もっと見る
                <span className="text-xs text-muted-foreground tabular-nums ml-1">
                  ({pagination.page}/{pagination.totalPages})
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Profile Preview (X-style) */}
          <Card className="glass border-border/30 overflow-hidden">
            {/* Banner */}
            <div className={cn("h-16 bg-gradient-to-r", getBanner(myUser?.headerColor))} />
            <CardContent className="px-4 pb-4 -mt-6">
              {/* Avatar */}
              <Avatar className="h-14 w-14 border-4 border-background">
                {myUser?.image && <AvatarImage src={myUser.image} />}
                <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                  {myUser?.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-foreground text-sm">{myUser?.name ?? "匿名"}</div>
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Palette className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        {HEADER_COLORS.map((color) => (
                          <DropdownMenuItem
                            key={color.id}
                            onClick={async () => {
                              await fetch("/api/users/me", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ headerColor: color.id }),
                              });
                              setMyUser((prev) => prev ? { ...prev, headerColor: color.id } : prev);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <div className={cn("h-3 w-3 rounded-full shrink-0", color.preview)} />
                            <span className="text-xs flex-1">{color.label}</span>
                            {myUser?.headerColor === color.id && <Check className="h-3 w-3 text-primary" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Link href="/dashboard/profile">
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
                        編集
                      </Button>
                    </Link>
                  </div>
                </div>
                {myUser?.community && (
                  <div className="text-xs text-muted-foreground">@{myUser.community}</div>
                )}
              </div>
              {/* Stats */}
              <div className="mt-3 flex items-center gap-4 text-xs">
                <div>
                  <span className="font-bold text-foreground tabular-nums">{myUser?.postCount ?? 0}</span>
                  <span className="text-muted-foreground ml-1">投稿</span>
                </div>
                <div>
                  <span className="font-bold text-foreground tabular-nums">{myUser?.commentCount ?? 0}</span>
                  <span className="text-muted-foreground ml-1">コメント</span>
                </div>
                <div>
                  <span className="font-bold text-foreground tabular-nums">Lv.{myUser?.level ?? 1}</span>
                </div>
              </div>
              {/* Tabs */}
              <div className="mt-3 flex border-b border-border/50">
                <button
                  className={cn(
                    "flex-1 pb-2 text-xs font-medium transition-colors border-b-2",
                    profileTab === "posts"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                  onClick={() => setProfileTab("posts")}
                >
                  自分の投稿
                </button>
                <button
                  className={cn(
                    "flex-1 pb-2 text-xs font-medium transition-colors border-b-2",
                    profileTab === "bookmarks"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                  onClick={() => setProfileTab("bookmarks")}
                >
                  ブックマーク
                </button>
              </div>
              {/* Tab Content */}
              <div className="mt-3 space-y-2">
                {profileTab === "posts" ? (
                  <Button
                    variant={showMyPosts ? "default" : "outline"}
                    size="sm"
                    className={cn("w-full text-xs gap-1.5 justify-start", !showMyPosts && "bg-transparent")}
                    onClick={() => { setShowMyPosts(!showMyPosts); setShowBookmarked(false); }}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {showMyPosts ? "フィルタ解除" : "自分の投稿を見る"}
                  </Button>
                ) : (
                  <Button
                    variant={showBookmarked ? "default" : "outline"}
                    size="sm"
                    className={cn("w-full text-xs gap-1.5 justify-start", !showBookmarked && "bg-transparent")}
                    onClick={() => { setShowBookmarked(!showBookmarked); setShowMyPosts(false); }}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    {showBookmarked ? "フィルタ解除" : "ブックマーク一覧"}
                  </Button>
                )}
              </div>
              {/* New Post */}
              <Link href="/dashboard/forum/new" className="block mt-3">
                <Button size="sm" className="w-full text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  新規投稿を作成
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 投稿テンプレート */}
          <Card className="glass border-border/30 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border/30">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-primary" />
                テンプレートで投稿
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                カテゴリを選んですぐに書き始められます
              </p>
            </div>
            <CardContent className="p-3">
              {/* よく使うテンプレート */}
              <div className="space-y-1.5 mb-2">
                {[
                  {
                    id: "VERIFICATION", name: "現場検証", icon: FlaskConical, color: "text-emerald-500", desc: "Before/Afterデータ付き",
                    title: "【検証】",
                    template: "## 仮説\n\n\n## 検証期間\nYYYY/MM/DD 〜 YYYY/MM/DD（◯日間）\n\n## Before（変更前のデータ）\n- インプレッション: \n- エンゲージメント率: \n- フォロワー増減: \n\n## After（変更後のデータ）\n- インプレッション: \n- エンゲージメント率: \n- フォロワー増減: \n\n## 変化率\n\n\n## 考察・結論\n\n\n## 補足・注意点\n"
                  },
                  {
                    id: "QUESTIONS", name: "質問・相談", icon: HelpCircle, color: "text-blue-500", desc: "気軽に聞いてみよう",
                    title: "【質問】",
                    template: "## 質問内容\n\n\n## 背景・状況\n- アカウント歴: \n- フォロワー数: 約◯人\n- 普段の投稿ジャンル: \n\n## 試したこと\n\n\n## 期待していること\n"
                  },
                  {
                    id: "STRATEGY", name: "戦略・Tips", icon: TrendingUp, color: "text-amber-500", desc: "試した結果を共有",
                    title: "【Tips】",
                    template: "## 戦略の概要\n\n\n## 具体的なやり方\n1. \n2. \n3. \n\n## 実際の結果\n- 期間: \n- 効果: \n\n## おすすめ度\n★★★☆☆\n\n## 注意点・コツ\n"
                  },
                  {
                    id: "BUGS", name: "不具合・エラー", icon: AlertCircle, color: "text-red-500", desc: "問題を報告",
                    title: "【不具合】",
                    template: "## 発生した問題\n\n\n## 再現手順\n1. \n2. \n3. \n\n## 期待する動作\n\n\n## 実際の動作\n\n\n## 環境\n- デバイス: \n- ブラウザ: \n- 発生日時: \n"
                  },
                ].map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/forum/new?category=${item.id}&title=${encodeURIComponent(item.title)}&template=${encodeURIComponent(item.template)}`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors group border border-transparent hover:border-border/30"
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                    </div>
                    <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ))}
              </div>

              {/* その他のテンプレート (折りたたみ) */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="more" className="border-border/30 border-t border-b-0">
                  <AccordionTrigger className="py-2 text-[11px] text-muted-foreground font-medium hover:no-underline hover:text-foreground">
                    その他のカテゴリ
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <div className="space-y-1">
                      {[
                        {
                          id: "ALGORITHM", name: "アルゴリズム解説", icon: BookOpen, color: "text-violet-500",
                          title: "【解説】",
                          template: "## 対象アルゴリズム\n\n\n## 概要\n\n\n## 仕組みの詳細\n\n\n## 運用への影響\n- ポジティブ: \n- ネガティブ: \n\n## まとめ・推奨アクション\n"
                        },
                        {
                          id: "UPDATES", name: "最新アップデート", icon: Flame, color: "text-orange-500",
                          title: "【速報】",
                          template: "## アップデート概要\n\n\n## 変更点\n- \n- \n\n## 運用への影響\n\n\n## 推奨アクション\n\n\n## ソース・参考リンク\n"
                        },
                        {
                          id: "HEAVY_RANKER", name: "Heavy Ranker", icon: TrendingUp, color: "text-cyan-500",
                          title: "【Heavy Ranker】",
                          template: "## 対象パラメータ/機能\n\n\n## 検証内容\n\n\n## 結果・データ\n\n\n## 考察\n\n\n## 実運用への示唆\n"
                        },
                        {
                          id: "SIMCLUSTERS", name: "SimClusters", icon: Users, color: "text-indigo-500",
                          title: "【SimClusters】",
                          template: "## 対象トピック\n\n\n## 検証内容\n\n\n## 結果・データ\n\n\n## 考察\n\n\n## 実運用への示唆\n"
                        },
                        {
                          id: "TWEEPCRED", name: "TweepCred", icon: Award, color: "text-yellow-500",
                          title: "【TweepCred】",
                          template: "## 対象トピック\n\n\n## 検証内容\n\n\n## 結果・データ\n\n\n## 考察\n\n\n## 実運用への示唆\n"
                        },
                      ].map((item) => (
                        <Link
                          key={item.id}
                          href={`/dashboard/forum/new?category=${item.id}&title=${encodeURIComponent(item.title)}&template=${encodeURIComponent(item.template)}`}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors group"
                        >
                          <item.icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                          <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto" />
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Trending Tags */}
          <Card className="glass border-border/30 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/5 px-4 py-3 border-b border-border/30">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                トレンドタグ
              </h4>
            </div>
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Heavy Ranker",
                  "リプライ重み",
                  "初速30分",
                  "TweepCred",
                  "SimClusters",
                  "ネガティブFB",
                  "フォロー比率",
                  "Grok評価",
                  "加速度",
                  "Out-of-Network",
                ].map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={cn(
                      "cursor-pointer transition-all text-xs border border-transparent",
                      searchQuery === tag
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                    )}
                    onClick={() => {
                      setSearchInput(tag);
                      setSearchQuery(tag);
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="glass border-border/30 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-accent/5 px-4 py-3 border-b border-border/30">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                コミュニティガイドライン
              </h4>
            </div>
            <CardContent className="p-3">
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  "建設的な議論を心がけましょう",
                  "情報源を明記しましょう",
                  "他のユーザーを尊重しましょう",
                  "検証データを添えると信頼性UP",
                  "Before/Afterデータが最も高評価",
                ].map((guideline, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {guideline}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
