"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { extractUrls } from "@/lib/url-utils";
import { UrlPreviews } from "@/components/shared/url-preview-card";

const REACTION_EMOJIS = ["🔥", "👏", "💡", "🎯"] as const;

interface WhisperAuthor {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  xHandle: string | null;
}

interface WhisperData {
  id: string;
  content: string;
  createdAt: string;
  author: WhisperAuthor;
  reactionCounts: Record<string, number>;
  userReactions: string[];
  totalReactions: number;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}秒前`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}時間前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}日前`;
  return `${Math.floor(diffDay / 30)}ヶ月前`;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
        管理者
      </span>
    );
  }
  if (role === "MODERATOR") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
        運営
      </span>
    );
  }
  return null;
}

export default function WhisperCard({
  whisper,
  onReaction,
}: {
  whisper: WhisperData;
  onReaction: (whisperId: string, emoji: string) => void;
}) {
  const [reactionCounts, setReactionCounts] = useState(whisper.reactionCounts);
  const [userReactions, setUserReactions] = useState(whisper.userReactions);
  const [isAnimating, setIsAnimating] = useState<string | null>(null);
  const urls = useMemo(() => extractUrls(whisper.content), [whisper.content]);

  const handleReaction = async (emoji: string) => {
    setIsAnimating(emoji);
    setTimeout(() => setIsAnimating(null), 300);

    const isActive = userReactions.includes(emoji);

    // Optimistic update
    if (isActive) {
      setUserReactions((prev) => prev.filter((e) => e !== emoji));
      setReactionCounts((prev) => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 0) - 1),
      }));
    } else {
      setUserReactions((prev) => [...prev, emoji]);
      setReactionCounts((prev) => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + 1,
      }));
    }

    onReaction(whisper.id, emoji);
  };

  return (
    <article className="group relative px-4 py-4 border-b border-border/50 transition-colors hover:bg-muted/20">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar className="h-10 w-10 ring-1 ring-border/50">
            {whisper.author.image && (
              <AvatarImage src={whisper.author.image} alt={whisper.author.name || ""} />
            )}
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {getInitials(whisper.author.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-foreground truncate">
              {whisper.author.name || "匿名ユーザー"}
            </span>
            <RoleBadge role={whisper.author.role} />
            {whisper.author.xHandle && (
              <span className="text-xs text-muted-foreground truncate">
                @{whisper.author.xHandle}
              </span>
            )}
            <span className="text-xs text-muted-foreground">·</span>
            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {timeAgo(whisper.createdAt)}
            </time>
          </div>

          {/* Body */}
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
            {whisper.content}
          </p>

          {/* URL Previews */}
          <UrlPreviews urls={urls} compact />

          {/* Reactions */}
          <div className="flex items-center gap-1.5 mt-3">
            {REACTION_EMOJIS.map((emoji) => {
              const count = reactionCounts[emoji] || 0;
              const isActive = userReactions.includes(emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all",
                    "border hover:scale-105 active:scale-95",
                    isActive
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    isAnimating === emoji && "animate-bounce"
                  )}
                >
                  <span className={cn(
                    "transition-transform",
                    isAnimating === emoji && "scale-125"
                  )}>
                    {emoji}
                  </span>
                  {count > 0 && (
                    <span className="font-medium tabular-nums">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
