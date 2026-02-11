"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  postId?: string;
  commentId?: string;
  initialScore: number;
  initialUserVote: number | null;
  size?: "sm" | "default";
  orientation?: "vertical" | "horizontal";
}

export function VoteButton({
  postId,
  commentId,
  initialScore,
  initialUserVote,
  size = "default",
  orientation = "vertical",
}: VoteButtonProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [isPending, startTransition] = useTransition();

  const handleVote = (value: 1 | -1) => {
    // Optimistic update
    const prevScore = score;
    const prevVote = userVote;

    if (userVote === value) {
      // Toggle off
      setScore(score - value);
      setUserVote(null);
    } else if (userVote !== null) {
      // Switch vote
      setScore(score - userVote + value);
      setUserVote(value);
    } else {
      // New vote
      setScore(score + value);
      setUserVote(value);
    }

    startTransition(async () => {
      try {
        const endpoint = commentId
          ? `/api/forum/comments/${commentId}/vote`
          : `/api/forum/posts/${postId}/vote`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });

        if (!res.ok) {
          // Revert on error
          setScore(prevScore);
          setUserVote(prevVote);
          return;
        }

        const data = await res.json();
        setScore(data.voteScore);
        setUserVote(data.userVote);
      } catch {
        // Revert on error
        setScore(prevScore);
        setUserVote(prevVote);
      }
    });
  };

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const btnSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          btnSize,
          "rounded-full transition-all",
          userVote === 1
            ? "text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20"
            : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10"
        )}
        onClick={() => handleVote(1)}
        disabled={isPending}
      >
        <ThumbsUp className={iconSize} />
      </Button>

      <span
        className={cn(
          "font-semibold tabular-nums",
          size === "sm" ? "text-xs min-w-[1.5rem]" : "text-sm min-w-[2rem]",
          "text-center",
          score > 0
            ? "text-emerald-400"
            : score < 0
            ? "text-red-400"
            : "text-muted-foreground"
        )}
      >
        {score}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          btnSize,
          "rounded-full transition-all",
          userVote === -1
            ? "text-red-400 bg-red-400/10 hover:bg-red-400/20"
            : "text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
        )}
        onClick={() => handleVote(-1)}
        disabled={isPending}
      >
        <ThumbsDown className={iconSize} />
      </Button>
    </div>
  );
}
