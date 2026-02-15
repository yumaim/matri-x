"use client";

import { useEffect, useState } from "react";
import { Trophy, Zap, Target, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LearningProgressTrackerProps {
  topicId: "phoenix" | "thunder" | "comparison";
  topicName: string;
  onComplete?: () => void;
}

interface ProgressData {
  level: number;
  totalXp: number;
  nextLevelXp: number;
  newAchievements?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    xp: number;
    tier: string;
  }>;
}

/**
 * 学習進捗トラッカー
 * ページ閲覧時に自動的にXPを記録し、レベル・アチーブメントを表示
 */
export function LearningProgressTracker({
  topicId,
  topicName,
  onComplete,
}: LearningProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);

  // 初回閲覧時に進捗を記録
  useEffect(() => {
    const trackProgress = async () => {
      if (isTracking) return;
      setIsTracking(true);

      try {
        // 進捗を記録
        await fetch("/api/users/progress/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId }),
        });

        // 最新の進捗を取得
        const res = await fetch("/api/users/progress");
        if (res.ok) {
          const data = await res.json();
          setProgress(data);

          // 新しいアチーブメントがあれば表示
          if (data.newAchievements && data.newAchievements.length > 0) {
            const newAchievement = data.newAchievements[0];
            setCurrentAchievement(newAchievement);
            setShowAchievement(true);
            setTimeout(() => setShowAchievement(false), 5000);
          }
        }
      } catch (error) {
        console.error("Failed to track progress:", error);
      }
    };

    trackProgress();
  }, [topicId, isTracking]);

  if (!progress) return null;

  const xpProgress = ((progress.totalXp % 50) / 50) * 100;
  const tierColors: Record<string, string> = {
    bronze: "text-amber-600",
    silver: "text-slate-400",
    gold: "text-yellow-400",
    platinum: "text-cyan-400",
  };

  return (
    <>
      {/* 学習進捗バー */}
      <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-2xl p-4">
          {/* レベル & XP */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">Lv. {progress.level}</div>
                <div className="text-xs text-muted-foreground">学習レベル</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-primary">{progress.totalXp} XP</div>
              <div className="text-[10px] text-muted-foreground">次Lv: {progress.nextLevelXp}</div>
            </div>
          </div>

          {/* 進捗バー */}
          <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 text-center">
            {topicName}を学習中 🎓
          </div>
        </div>
      </div>

      {/* アチーブメント解除通知 */}
      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
          >
            <div className="rounded-xl border-2 border-primary bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm shadow-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/30 text-3xl shrink-0 animate-bounce">
                  {currentAchievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase">Achievement Unlocked!</span>
                  </div>
                  <div className="font-bold text-foreground text-sm">{currentAchievement.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {currentAchievement.description}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Zap className="h-3 w-3 text-amber-400" />
                      <span className="font-bold text-amber-400">+{currentAchievement.xp} XP</span>
                    </div>
                    <div
                      className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                        tierColors[currentAchievement.tier],
                        "bg-background/50"
                      )}
                    >
                      {currentAchievement.tier}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
