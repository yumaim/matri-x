"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [profileTab, setProfileTab] = useState<"posts" | "bookmarks">("posts");
  const [myUser, setMyUser] = useState<{ name: string | null; image: string | null; community: string | null; level: number; xp: number; postCount: number; commentCount: number; headerColor: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => setMyUser({
        name: data.name ?? "匿名",
        image: data.image ?? null,
        community: data.community ?? null,
        level: data.level ?? 1,
        xp: data.xp ?? 0,
        postCount: data._count?.posts ?? 0,
        commentCount: data._count?.comments ?? 0,
        headerColor: data.headerColor ?? "blue",
      }))
      .catch(() => {});
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
    [selectedCategory, searchQuery, sortBy, showBookmarked]
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            フォーラム
          </h1>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            アルゴリズムについてコミュニティと議論しましょう
          </p>
        </div>
        <Link href="/dashboard/forum/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            新規投稿
          </Button>
        </Link>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="トピックを検索..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10 bg-muted/30 border-border/50"
          />
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
                  className={cn(sortBy === opt.id && "bg-accent")}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={showBookmarked ? "default" : "outline"}
            size="icon"
            onClick={() => setShowBookmarked(!showBookmarked)}
            className={cn(!showBookmarked && "bg-transparent")}
            title="ブックマーク済み"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-4 min-w-0">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6 min-w-0">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <category.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {category.name}
              </button>
            ))}
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="hidden sm:flex flex-col items-center gap-2">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-8 sm:py-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== "all" || showBookmarked
                    ? "条件に一致する投稿が見つかりませんでした"
                    : "まだ投稿がありません。最初の投稿を作成しましょう！"}
                </p>
                {!searchQuery && selectedCategory === "all" && !showBookmarked && (
                  <Link href="/dashboard/forum/new">
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      最初の投稿を作成
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Load More */}
          {pagination && pagination.page < pagination.totalPages && (
            <div className="text-center">
              <Button
                variant="outline"
                className="bg-transparent gap-2"
                onClick={handleLoadMore}
                disabled={isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                もっと見る
                <span className="text-xs text-muted-foreground">
                  ({pagination.page}/{pagination.totalPages})
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Profile Preview (X-style) */}
          <Card className="bg-card/50 border-border/50 overflow-hidden">
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
                  <Link href="/dashboard/forum?filter=my">
                    <Button variant="outline" size="sm" className="w-full bg-transparent text-xs gap-1.5 justify-start">
                      <MessageSquare className="h-3.5 w-3.5" />
                      自分の投稿を見る
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard/forum?filter=bookmarks">
                    <Button variant="outline" size="sm" className="w-full bg-transparent text-xs gap-1.5 justify-start">
                      <Bookmark className="h-3.5 w-3.5" />
                      ブックマーク一覧
                    </Button>
                  </Link>
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

          {/* 投稿テンプレート (Accordion) */}
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2 mb-3">
                <FileEdit className="h-4 w-4 text-accent" />
                投稿テンプレート
              </h4>
              <Accordion type="single" collapsible className="w-full">
                {[
                  { id: "ALGORITHM", name: "アルゴリズム解説", template: "このアルゴリズムの仕組みと、運用への影響をまとめます。" },
                  { id: "STRATEGY", name: "戦略・Tips", template: "この戦略を試した結果と、おすすめのやり方を共有します。" },
                  { id: "UPDATES", name: "最新アップデート", template: "最新の変更内容と、運用への影響をまとめます。" },
                  { id: "BUGS", name: "不具合・エラー", template: "発生した不具合の状況と、対処法を共有します。" },
                  { id: "QUESTIONS", name: "質問・相談", template: "〇〇について質問です。" },
                  { id: "VERIFICATION", name: "現場検証", template: "【仮説】\n\n【期間】\n\n【Before】\n\n【After】\n\n【変化率】\n\n【結論】" },
                  { id: "HEAVY_RANKER", name: "Heavy Ranker", template: "Heavy Rankerの〇〇について検証・解説します。" },
                  { id: "SIMCLUSTERS", name: "SimClusters", template: "SimClustersの〇〇について検証・解説します。" },
                  { id: "TWEEPCRED", name: "TweepCred", template: "TweepCredの〇〇について検証・解説します。" },
                ].map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border-border/30">
                    <AccordionTrigger className="py-2.5 text-xs font-medium hover:no-underline hover:text-primary">
                      {item.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground whitespace-pre-line mb-2.5">
                        「{item.template}」
                      </p>
                      <Link href={`/dashboard/forum/new?category=${item.id}&template=${encodeURIComponent(item.template)}`}>
                        <Button variant="outline" size="sm" className="w-full bg-transparent text-xs gap-1">
                          <Plus className="h-3 w-3" />
                          テンプレで投稿する
                        </Button>
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Trending Tags */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                トレンドタグ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
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
                    className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
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
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground text-sm">
                コミュニティガイドライン
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  建設的な議論を心がけましょう
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  情報源を明記しましょう
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  他のユーザーを尊重しましょう
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  検証データを添えると信頼性が上がります
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Before/Afterデータ付きレポートが最も評価されます
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
