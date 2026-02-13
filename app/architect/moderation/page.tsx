"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
    Search,
    Trash2,
    AlertTriangle,
    MessageSquare,
    FileText,
    Loader2,
    ChevronLeft,
    ChevronRight,
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-utils";

interface PostRow {
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: string;
    author: { id: string; name: string | null; image: string | null; role: string };
    _count: { comments: number; votes: number };
}

interface CommentRow {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string | null; image: string | null; role: string };
    post: { id: string; title: string };
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
    DISCUSSION: { label: "ディスカッション", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    ANALYSIS: { label: "分析共有", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    QUESTION: { label: "質問", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    TIPS: { label: "Tips & テクニック", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
    NEWS: { label: "ニュース", color: "bg-red-500/10 text-red-400 border-red-500/30" },
    MURMUR: { label: "つぶやき", color: "bg-violet-500/10 text-violet-400 border-violet-500/30" },
};

export default function ModerationPage() {
    const [tab, setTab] = useState<"posts" | "comments">("posts");
    const [posts, setPosts] = useState<PostRow[]>([]);
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [userId, setUserId] = useState("");
    const [userIdInput, setUserIdInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        description: string;
        confirmLabel: string;
        variant?: "default" | "destructive";
        inputLabel?: string;
        onConfirm: (reason?: string) => void;
    } | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("type", tab);
            params.set("page", String(page));
            if (search) params.set("search", search);
            if (userId) params.set("userId", userId);

            const res = await fetch(`/api/architect/moderation?${params}`);
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();

            if (tab === "posts") {
                setPosts(data.posts ?? []);
            } else {
                setComments(data.comments ?? []);
            }
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch (e) {
            console.error("Fetch moderation data error:", e);
        } finally {
            setLoading(false);
        }
    }, [tab, page, search, userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [tab, search, userId]);

    const doAction = async (action: string, targetId: string, message?: string) => {
        setActionLoading(true);
        try {
            const res = await fetch("/api/architect/moderation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, targetId, message }),
            });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error ?? "エラーが発生しました");
                return;
            }
            fetchData();
        } catch {
            alert("エラーが発生しました");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletePost = (post: PostRow) => {
        setConfirmConfig({
            title: `投稿を削除しますか？`,
            description: `「${post.title}」を削除します。この操作は取り消せません。投稿者に通知が送信されます。`,
            confirmLabel: "削除する",
            variant: "destructive",
            inputLabel: "削除理由（任意・投稿者に通知されます）",
            onConfirm: (reason) => doAction("deletePost", post.id, reason),
        });
    };

    const handleDeleteComment = (comment: CommentRow) => {
        setConfirmConfig({
            title: `コメントを削除しますか？`,
            description: `「${comment.content.slice(0, 60)}...」を削除します。投稿者に通知が送信されます。`,
            confirmLabel: "削除する",
            variant: "destructive",
            inputLabel: "削除理由（任意）",
            onConfirm: (reason) => doAction("deleteComment", comment.id, reason),
        });
    };

    const handleAlert = (post: PostRow) => {
        setConfirmConfig({
            title: `投稿者にアラートを送信`,
            description: `「${post.title}」の投稿者（${post.author.name ?? "匿名"}）に通知を送信します。`,
            confirmLabel: "送信する",
            inputLabel: "通知メッセージ",
            onConfirm: (message) => doAction("alert", post.id, message),
        });
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gradient">コンテンツ管理</h1>
                <p className="text-sm text-muted-foreground mt-1">投稿・コメントの管理とモデレーション</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={tab === "posts" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTab("posts")}
                    className="gap-1.5"
                >
                    <FileText className="h-3.5 w-3.5" />
                    投稿 ({tab === "posts" ? total : "..."})
                </Button>
                <Button
                    variant={tab === "comments" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTab("comments")}
                    className="gap-1.5"
                >
                    <MessageSquare className="h-3.5 w-3.5" />
                    コメント ({tab === "comments" ? total : "..."})
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="検索..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
                        className="pl-9 bg-card/50"
                    />
                </div>
                <div className="relative w-full sm:w-64">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ユーザーIDでフィルタ"
                        value={userIdInput}
                        onChange={(e) => setUserIdInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && setUserId(userIdInput)}
                        className="pl-9 bg-card/50"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSearch(searchInput); setUserId(userIdInput); }}
                >
                    検索
                </Button>
                {(search || userId) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearch(""); setSearchInput(""); setUserId(""); setUserIdInput(""); }}
                    >
                        クリア
                    </Button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : tab === "posts" ? (
                <div className="space-y-3">
                    {posts.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">投稿がありません</p>
                    )}
                    {posts.map((post) => (
                        <Card key={post.id} className="bg-card/50">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <Badge variant="outline" className={cn("text-xs", CATEGORY_LABELS[post.category]?.color)}>
                                                {CATEGORY_LABELS[post.category]?.label ?? post.category}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {post.author.name ?? "匿名"}
                                                {post.author.role !== "USER" && (
                                                    <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">
                                                        {post.author.role}
                                                    </Badge>
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                                        </div>
                                        <h3 className="font-medium text-sm truncate">{post.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                            <span>💬 {post._count.comments}</span>
                                            <span>👍 {post._count.votes}</span>
                                            <span className="text-[10px] font-mono text-muted-foreground/60">ID: {post.author.id.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                            onClick={() => handleAlert(post)}
                                            disabled={actionLoading}
                                        >
                                            <AlertTriangle className="h-3 w-3" />
                                            通知
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            onClick={() => handleDeletePost(post)}
                                            disabled={actionLoading}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            削除
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {comments.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">コメントがありません</p>
                    )}
                    {comments.map((comment) => (
                        <Card key={comment.id} className="bg-card/50">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-xs text-muted-foreground">
                                                {comment.author.name ?? "匿名"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-[10px]">
                                                投稿: {comment.post.title.slice(0, 30)}
                                            </Badge>
                                            <span className="text-[10px] font-mono text-muted-foreground/60">ID: {comment.author.id.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                                        onClick={() => handleDeleteComment(comment)}
                                        disabled={actionLoading}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        削除
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmConfig && (
                <ConfirmDialog
                    open={!!confirmConfig}
                    onOpenChange={(open) => !open && setConfirmConfig(null)}
                    title={confirmConfig.title}
                    description={confirmConfig.description}
                    confirmLabel={confirmConfig.confirmLabel}
                    variant={confirmConfig.variant}
                    inputLabel={confirmConfig.inputLabel}
                    onConfirm={confirmConfig.onConfirm}
                />
            )}
        </div>
    );
}
