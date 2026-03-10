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
  SlidersHorizontal,
  FlaskConical,
  Bookmark,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostCard } from "@/components/forum/post-card";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", name: "すべて", icon: MessageCircle },
  { id: "ALGORITHM", name: "アルゴリズム解説", icon: BookOpen },
  { id: "VERIFICATION", name: "現場検証", icon: FlaskConical },
  { id: "STRATEGY", name: "戦略・Tips", icon: TrendingUp },
  { id: "UPDATES", name: "最新アップデート", icon: Flame },
  { id: "QUESTIONS", name: "質問・相談", icon: HelpCircle },
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
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

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
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
              <CardContent className="py-12 text-center">
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
        <div className="space-y-6">
          {/* Community Stats */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                コミュニティ統計
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">総トピック数</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {pagination?.total ?? "—"}
                </span>
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
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
