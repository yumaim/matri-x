"use client";

import { useState, useTransition, useCallback } from "react";
import { MessageSquare, Reply, Send, MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoteButton } from "@/components/forum/vote-button";
import { cn } from "@/lib/utils";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  voteScore: number;
  userVote: number | null;
  replies?: CommentData[];
}

interface CommentSectionProps {
  postId: string;
  initialComments: CommentData[];
  currentUserId?: string;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}時間前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}日前`;
  return `${Math.floor(diffDay / 30)}ヶ月前`;
}

function RoleBadge({ role }: { role: string }) {
  if (role === "USER") return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-1.5 py-0",
        role === "ADMIN"
          ? "border-red-500/50 text-red-400"
          : "border-yellow-500/50 text-yellow-400"
      )}
    >
      {role === "ADMIN" ? "管理者" : "モデレーター"}
    </Badge>
  );
}

function CommentItem({
  comment,
  postId,
  depth,
  currentUserId,
  onReplyAdded,
  onCommentDeleted,
}: {
  comment: CommentData;
  postId: string;
  depth: number;
  currentUserId?: string;
  onReplyAdded: (parentId: string, newComment: CommentData) => void;
  onCommentDeleted?: (commentId: string) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/forum/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: replyContent,
            parentId: comment.id,
          }),
        });

        if (res.ok) {
          const newComment = await res.json();
          onReplyAdded(comment.id, newComment);
          setReplyContent("");
          setShowReplyForm(false);
        }
      } catch (e) {
        console.error("Reply failed:", e);
      }
    });
  };

  return (
    <div
      className={cn(
        "group",
        depth > 0 && "ml-6 sm:ml-10 pl-4 border-l-2 border-border/30"
      )}
    >
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8 shrink-0">
          {comment.author.image && <AvatarImage src={comment.author.image} />}
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(comment.author.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">
              {comment.author.name ?? "匿名"}
            </span>
            <RoleBadge role={comment.author.role} />
            <span className="text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <div className="mt-1.5 text-sm text-foreground/90 whitespace-pre-wrap break-words">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-2">
            <div onClick={(e) => e.stopPropagation()}>
              <VoteButton
                commentId={comment.id}
                initialScore={comment.voteScore}
                initialUserVote={comment.userVote}
                size="sm"
                orientation="horizontal"
              />
            </div>

            {depth < 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-3 w-3" />
                返信
              </Button>
            )}

            {currentUserId === comment.author.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={async () => {
                      if (!confirm("このコメントを削除しますか？")) return;
                      try {
                        const res = await fetch(`/api/forum/posts/${postId}/comments?commentId=${comment.id}`, { method: "DELETE" });
                        if (res.ok) {
                          onCommentDeleted?.(comment.id);
                        }
                      } catch { /* ignore */ }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="返信を入力..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm bg-muted/30 border-border/50 resize-none"
                rows={2}
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleSubmitReply}
                  disabled={isPending || !replyContent.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowReplyForm(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              currentUserId={currentUserId}
              onReplyAdded={onReplyAdded}
              onCommentDeleted={onCommentDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const addReplyToTree = useCallback(
    (parentId: string, newReply: CommentData, commentList: CommentData[]): CommentData[] => {
      return commentList.map((c) => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies ?? []), newReply] };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: addReplyToTree(parentId, newReply, c.replies) };
        }
        return c;
      });
    },
    []
  );

  const handleReplyAdded = useCallback(
    (parentId: string, newReply: CommentData) => {
      setComments((prev) => addReplyToTree(parentId, newReply, prev));
    },
    [addReplyToTree]
  );

  const removeCommentFromTree = useCallback(
    (commentId: string, commentList: CommentData[]): CommentData[] => {
      return commentList
        .filter((c) => c.id !== commentId)
        .map((c) => ({
          ...c,
          replies: c.replies ? removeCommentFromTree(commentId, c.replies) : c.replies,
        }));
    },
    []
  );

  const handleCommentDeleted = useCallback(
    (commentId: string) => {
      setComments((prev) => removeCommentFromTree(commentId, prev));
    },
    [removeCommentFromTree]
  );

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/forum/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newComment }),
        });

        if (res.ok) {
          const comment = await res.json();
          setComments((prev) => [...prev, comment]);
          setNewComment("");
        }
      } catch (e) {
        console.error("Comment failed:", e);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">
          コメント ({comments.length})
        </h3>
      </div>

      {/* New comment form */}
      {currentUserId && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0 mt-1">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              You
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="コメントを入力..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] bg-muted/30 border-border/50 resize-none text-sm"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isPending || !newComment.trim()}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                コメントする
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="divide-y divide-border/30">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            まだコメントはありません。最初のコメントを投稿しましょう！
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              depth={0}
              currentUserId={currentUserId}
              onReplyAdded={handleReplyAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}
