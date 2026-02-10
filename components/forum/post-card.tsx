"use client";

import Link from "next/link";
import {
  MessageSquare,
  Eye,
  Pin,
  Flame,
  Tag,
  Clock,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VoteButton } from "@/components/forum/vote-button";
import { PostReactions } from "@/components/forum/post-reactions";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";

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

interface PostCardProps {
  post: {
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
      company?: string | null;
      xHandle?: string | null;
    };
    _count: {
      comments: number;
      votes: number;
      evidence: number;
    };
  };
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}ヶ月前`;
  return `${Math.floor(diffMonth / 12)}年前`;
}

export function PostCard({ post }: PostCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [isPending, startTransition] = useTransition();
  const cat = CATEGORY_LABELS[post.category];

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prev = isBookmarked;
    setIsBookmarked(!isBookmarked);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/forum/posts/${post.id}/bookmark`, {
          method: "POST",
        });
        if (!res.ok) {
          setIsBookmarked(prev);
          return;
        }
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
      } catch {
        setIsBookmarked(prev);
      }
    });
  };

  const preview = post.content.length > 150
    ? post.content.slice(0, 150) + "..."
    : post.content;

  return (
    <Card
      className={cn(
        "bg-card/50 border-border/50 transition-all duration-200 hover:border-primary/30 hover:bg-card/80",
        post.isPinned && "ring-1 ring-primary/30 bg-primary/[0.02]"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-3">
          {/* Avatar column (X-style) */}
          <div className="shrink-0">
            <Avatar className="h-10 w-10 sm:h-11 sm:w-11">
              {post.author.image && <AvatarImage src={post.author.image} />}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Author line + time */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">
                {post.author.name ?? "匿名"}
              </span>
              {post.author.company && (
                <span className="text-xs text-muted-foreground/60">@{post.author.company}</span>
              )}
              {post.author.xHandle && (
                <span className="text-xs text-muted-foreground/60">@{post.author.xHandle}</span>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(post.createdAt)}
              </span>

              {/* Pinned / Verified inline badges */}
              {post.isPinned && (
                <Badge variant="outline" className="shrink-0 border-primary/50 text-primary text-[10px] gap-0.5 px-1.5 py-0">
                  <Pin className="h-2.5 w-2.5" />
                  固定
                </Badge>
              )}
              {post.isVerified && (
                <Badge variant="outline" className="shrink-0 border-emerald-500/50 text-emerald-400 text-[10px] gap-0.5 px-1.5 py-0">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  検証済み
                </Badge>
              )}
            </div>

            {/* Category + Tags line */}
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {cat && (
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", cat.color)}>
                  {cat.label}
                </Badge>
              )}
              {post._count.evidence > 0 && (
                <Badge variant="outline" className="shrink-0 border-purple-500/50 text-purple-400 text-[10px] gap-0.5 px-1.5 py-0">
                  <FlaskConical className="h-2.5 w-2.5" />
                  {post._count.evidence}件
                </Badge>
              )}
              {post.voteScore >= 10 && (
                <Badge className="shrink-0 bg-orange-500/10 text-orange-400 border-orange-500/30 text-[10px] gap-0.5 px-1.5 py-0">
                  <Flame className="h-2.5 w-2.5" />
                  人気
                </Badge>
              )}
              {post.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-muted/60 text-muted-foreground text-[10px] font-normal gap-0.5 px-1.5 py-0"
                >
                  <Tag className="h-2 w-2" />
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{post.tags.length - 3}</span>
              )}
            </div>

            {/* Title */}
            <Link href={`/dashboard/forum/${post.id}`} className="block group mt-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base">
                {post.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {preview}
              </p>
            </Link>

            {/* Action bar (X-style bottom row) */}
            <div className="mt-3 flex items-center gap-1 flex-wrap" onClick={(e) => e.preventDefault()}>
              {/* Vote buttons */}
              <VoteButton
                postId={post.id}
                initialScore={post.voteScore}
                initialUserVote={post.userVote}
                size="sm"
                orientation="horizontal"
              />

              <div className="w-px h-5 bg-border/40 mx-1 hidden sm:block" />

              {/* Reactions */}
              <PostReactions postId={post.id} compact />

              <div className="w-px h-5 bg-border/40 mx-1 hidden sm:block" />

              {/* Stats */}
              <span className="flex items-center gap-1 text-xs text-muted-foreground px-1.5 py-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {post._count.comments}
              </span>

              <span className="flex items-center gap-1 text-xs text-muted-foreground px-1.5 py-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount.toLocaleString()}
              </span>

              {/* Bookmark (right-aligned) */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-full ml-auto transition-all",
                  isBookmarked
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary"
                )}
                onClick={handleBookmark}
                disabled={isPending}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-3.5 w-3.5" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
