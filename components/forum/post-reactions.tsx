"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const REACTION_TYPES = [
  { type: "WANT_MORE", icon: "🤔", label: "もっと聞きたい", color: "text-blue-400 bg-blue-400/10 hover:bg-blue-400/20" },
  { type: "DISCOVERY", icon: "🔥", label: "これは発見だ", color: "text-orange-400 bg-orange-400/10 hover:bg-orange-400/20" },
  { type: "CONSULT", icon: "💬", label: "直接相談したい", color: "text-violet-400 bg-violet-400/10 hover:bg-violet-400/20" },
] as const;

interface ReactionCounts {
  WANT_MORE: number;
  DISCOVERY: number;
  CONSULT: number;
}

interface PostReactionsProps {
  postId: string;
  initialReactions?: ReactionCounts;
  initialUserReactions?: string[];
  compact?: boolean;
}

export function PostReactions({
  postId,
  initialReactions,
  initialUserReactions = [],
  compact = false,
}: PostReactionsProps) {
  const [reactions, setReactions] = useState<ReactionCounts>(
    initialReactions ?? { WANT_MORE: 0, DISCOVERY: 0, CONSULT: 0 }
  );
  const [userReactions, setUserReactions] = useState<string[]>(initialUserReactions);
  const [isPending, startTransition] = useTransition();

  const handleReaction = (type: string) => {
    const isActive = userReactions.includes(type);
    const prevReactions = { ...reactions };
    const prevUserReactions = [...userReactions];

    // Optimistic update
    if (isActive) {
      setReactions({ ...reactions, [type]: Math.max(0, (reactions[type as keyof ReactionCounts] ?? 0) - 1) });
      setUserReactions(userReactions.filter((r) => r !== type));
    } else {
      setReactions({ ...reactions, [type]: (reactions[type as keyof ReactionCounts] ?? 0) + 1 });
      setUserReactions([...userReactions, type]);
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/forum/posts/${postId}/react`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        if (!res.ok) {
          setReactions(prevReactions);
          setUserReactions(prevUserReactions);
          return;
        }
        const data = await res.json();
        setReactions(data.reactions);
        setUserReactions(data.userReactions);
      } catch {
        setReactions(prevReactions);
        setUserReactions(prevUserReactions);
      }
    });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex items-center", compact ? "gap-1" : "gap-1.5")}>
        {REACTION_TYPES.map((reaction) => {
          const count = reactions[reaction.type as keyof ReactionCounts] ?? 0;
          const isActive = userReactions.includes(reaction.type);
          return (
            <Tooltip key={reaction.type}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all",
                    isActive
                      ? reaction.color
                      : "text-muted-foreground/60 hover:text-muted-foreground bg-transparent hover:bg-muted/50",
                    isPending && "opacity-50 pointer-events-none"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleReaction(reaction.type);
                  }}
                  disabled={isPending}
                >
                  <span className={compact ? "text-xs" : "text-sm"}>{reaction.icon}</span>
                  {count > 0 && (
                    <span className="font-medium tabular-nums">{count}</span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {reaction.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
