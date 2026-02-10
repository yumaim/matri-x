"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pin,
  CheckCircle,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  category: string;
  status: string;
  isPinned: boolean;
  isVerified: boolean;
  viewCount: number;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
  _count: { votes: number; comments: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type TabFilter = "all" | "flagged" | "removed";

const categoryColors: Record<string, string> = {
  ALGORITHM: "bg-blue-900/50 text-blue-300",
  VERIFICATION: "bg-green-900/50 text-green-300",
  STRATEGY: "bg-purple-900/50 text-purple-300",
  UPDATES: "bg-orange-900/50 text-orange-300",
  QUESTIONS: "bg-cyan-900/50 text-cyan-300",
};

const statusBadge: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  PUBLISHED: { variant: "secondary", label: "公開中" },
  DRAFT: { variant: "outline", label: "下書き" },
  FLAGGED: { variant: "destructive", label: "フラグ付き" },
  REMOVED: { variant: "destructive", label: "削除済み" },
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [tab, setTab] = useState<TabFilter>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });
        if (tab === "flagged") params.set("status", "FLAGGED");
        if (tab === "removed") params.set("status", "REMOVED");

        const res = await fetch(`/api/admin/posts?${params}`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [tab]
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleAction = async (
    postId: string,
    updates: Record<string, unknown>
  ) => {
    setActionLoading(postId);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...updated } : p))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabFilter)}
      >
        <TabsList className="bg-secondary">
          <TabsTrigger value="all">全投稿</TabsTrigger>
          <TabsTrigger value="flagged">フラグ付き</TabsTrigger>
          <TabsTrigger value="removed">削除済み</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Posts Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>投稿一覧</span>
            <span className="text-sm font-normal text-muted-foreground">
              {pagination.total} 件
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">タイトル</TableHead>
                    <TableHead className="text-muted-foreground">著者</TableHead>
                    <TableHead className="text-muted-foreground">カテゴリ</TableHead>
                    <TableHead className="text-muted-foreground text-center">
                      投票
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      ステータス
                    </TableHead>
                    <TableHead className="text-muted-foreground">日付</TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      アクション
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        投稿が見つかりません
                      </TableCell>
                    </TableRow>
                  ) : (
                    posts.map((post) => (
                      <TableRow key={post.id} className="border-border">
                        <TableCell className="max-w-[250px]">
                          <div className="flex items-center gap-2">
                            {post.isPinned && (
                              <Pin className="h-3.5 w-3.5 shrink-0 text-primary" />
                            )}
                            {post.isVerified && (
                              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-400" />
                            )}
                            <span className="truncate text-sm font-medium">
                              {post.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {post.author.name ?? post.author.email}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              categoryColors[post.category] ??
                              "bg-zinc-700 text-zinc-300"
                            }`}
                          >
                            {post.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            {post._count.votes}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              statusBadge[post.status]?.variant ?? "secondary"
                            }
                            className="text-[10px]"
                          >
                            {statusBadge[post.status]?.label ?? post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title={
                                post.isPinned ? "ピン留め解除" : "ピン留め"
                              }
                              disabled={actionLoading === post.id}
                              onClick={() =>
                                handleAction(post.id, {
                                  isPinned: !post.isPinned,
                                })
                              }
                            >
                              <Pin
                                className={`h-3.5 w-3.5 ${
                                  post.isPinned
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title={
                                post.isVerified
                                  ? "検証済み解除"
                                  : "検証済みにする"
                              }
                              disabled={actionLoading === post.id}
                              onClick={() =>
                                handleAction(post.id, {
                                  isVerified: !post.isVerified,
                                })
                              }
                            >
                              <CheckCircle
                                className={`h-3.5 w-3.5 ${
                                  post.isVerified
                                    ? "text-green-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </Button>
                            {post.status === "REMOVED" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="復元"
                                disabled={actionLoading === post.id}
                                onClick={() =>
                                  handleAction(post.id, {
                                    status: "PUBLISHED",
                                  })
                                }
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-green-400" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="削除"
                                disabled={actionLoading === post.id}
                                onClick={() =>
                                  handleAction(post.id, {
                                    status: "REMOVED",
                                  })
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchPosts(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchPosts(pagination.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
