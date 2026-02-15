"use client";

import { HelpCircle, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualExplainerProps {
  what: string;
  why: string;
  how?: string;
  example?: string;
  variant?: "blue" | "emerald" | "purple" | "amber";
}

const variantStyles = {
  blue: {
    bg: "bg-blue-500/5 border-blue-500/20",
    icon: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400",
  },
  emerald: {
    bg: "bg-emerald-500/5 border-emerald-500/20",
    icon: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400",
  },
  purple: {
    bg: "bg-purple-500/5 border-purple-500/20",
    icon: "text-purple-400",
    badge: "bg-purple-500/10 text-purple-400",
  },
  amber: {
    bg: "bg-amber-500/5 border-amber-500/20",
    icon: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400",
  },
};

/**
 * ビジュアル要素の補足解説コンポーネント
 * 非エンジニア向けに「これは何？」「なぜ重要？」「どう使う？」を説明
 */
export function VisualExplainer({
  what,
  why,
  how,
  example,
  variant = "blue",
}: VisualExplainerProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn("rounded-lg border p-4 mt-4 space-y-3", styles.bg)}>
      {/* これは何？ */}
      <div className="flex items-start gap-2.5">
        <div className={cn("flex h-6 w-6 items-center justify-center rounded-md shrink-0 mt-0.5", styles.badge)}>
          <HelpCircle className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className={cn("text-xs font-bold mb-1", styles.icon)}>🔍 これは何？</h5>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{what}</p>
        </div>
      </div>

      {/* なぜ重要？ */}
      <div className="flex items-start gap-2.5">
        <div className={cn("flex h-6 w-6 items-center justify-center rounded-md shrink-0 mt-0.5", styles.badge)}>
          <Lightbulb className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className={cn("text-xs font-bold mb-1", styles.icon)}>💡 なぜ重要？</h5>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{why}</p>
        </div>
      </div>

      {/* どう活かす？ */}
      {how && (
        <div className="flex items-start gap-2.5">
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-md shrink-0 mt-0.5", styles.badge)}>
            <Target className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className={cn("text-xs font-bold mb-1", styles.icon)}>🎯 どう活かす？</h5>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{how}</p>
          </div>
        </div>
      )}

      {/* 具体例 */}
      {example && (
        <div className="pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground/80 italic leading-relaxed">
            <span className="font-semibold not-italic">例: </span>
            {example}
          </p>
        </div>
      )}
    </div>
  );
}
