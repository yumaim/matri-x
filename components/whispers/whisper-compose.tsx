"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

const MAX_LENGTH = 280;

interface WhisperComposeProps {
  user: {
    name: string | null;
    image: string | null;
  } | null;
  onSubmit: (content: string) => Promise<boolean>;
  disabled?: boolean;
}

export default function WhisperCompose({ user, onSubmit, disabled }: WhisperComposeProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_LENGTH - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty = content.trim().length === 0;

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const success = await onSubmit(content.trim());
      if (success) {
        setContent("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const progressPercentage = Math.min((content.length / MAX_LENGTH) * 100, 100);
  const circleRadius = 10;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div
      className={cn(
        "border-b border-border/50 transition-colors",
        isFocused ? "bg-card/80" : "bg-transparent"
      )}
    >
      <div className="flex gap-3 p-4">
        {/* User Avatar */}
        <div className="shrink-0 pt-1">
          <Avatar className="h-10 w-10 ring-1 ring-border/50">
            {user?.image && <AvatarImage src={user.image} alt={user.name || ""} />}
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {user?.name?.slice(0, 2)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Input Area */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="いま何を考えていますか？ 囁いてみましょう..."
            disabled={disabled || isSubmitting}
            rows={1}
            className={cn(
              "w-full bg-transparent border-none outline-none resize-none",
              "text-sm text-foreground placeholder:text-muted-foreground/50",
              "leading-relaxed pt-2 pb-1",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />

          {/* Actions bar */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
            <p className="text-[11px] text-muted-foreground/50">
              Ctrl + Enter で送信
            </p>

            <div className="flex items-center gap-3">
              {/* Character counter */}
              {content.length > 0 && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 -rotate-90"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r={circleRadius}
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r={circleRadius}
                      fill="none"
                      stroke={
                        isOverLimit
                          ? "hsl(var(--destructive))"
                          : remaining <= 20
                          ? "hsl(30 100% 50%)"
                          : "hsl(var(--primary))"
                      }
                      strokeWidth="2"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-200"
                    />
                  </svg>
                  {remaining <= 20 && (
                    <span
                      className={cn(
                        "text-xs tabular-nums font-medium",
                        isOverLimit ? "text-destructive" : "text-orange-400"
                      )}
                    >
                      {remaining}
                    </span>
                  )}
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={isEmpty || isOverLimit || isSubmitting || disabled}
                size="sm"
                className="rounded-full px-4 gap-1.5 h-8"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">囁く</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
