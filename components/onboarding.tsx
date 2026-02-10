"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { usePathname, useRouter } from "next/navigation";

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked) return;
    if (pathname !== "/dashboard") return;

    // Check if onboarding was already completed
    const completed = localStorage.getItem("matrix-onboarding-done");
    if (completed) {
      setHasChecked(true);
      return;
    }

    setHasChecked(true);

    // Small delay to let the dashboard render
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        progressText: "{{current}} / {{total}}",
        nextBtnText: "次へ →",
        prevBtnText: "← 戻る",
        doneBtnText: "始める！",
        popoverClass: "matri-x-tour",
        steps: [
          {
            popover: {
              title: "👋 ようこそ、Matri-Xへ！",
              description: "Xのアルゴリズムを解き明かす旅を始めましょう。3分で主要機能を案内します。",
              side: "over" as any,
              align: "center" as any,
            },
          },
          {
            element: "[data-tour='level-badge']",
            popover: {
              title: "🎮 あなたのレベル",
              description: "学習やフォーラム参加でXPが貯まり、レベルアップします。アチーブメントも解除できます。",
              side: "bottom" as any,
              align: "start" as any,
            },
          },
          {
            element: "[data-tour='stats-cards']",
            popover: {
              title: "📊 あなたの活動",
              description: "投稿数、コメント数、投票数がここに表示されます。活動するほどXPが貯まります。",
              side: "top" as any,
              align: "center" as any,
            },
          },
          {
            element: "[data-tour='learning-progress']",
            popover: {
              title: "📚 学習進捗",
              description: "各トピックをクリックすると対応するページに移動します。全トピックを学んでアルゴリズムマスターを目指しましょう！",
              side: "top" as any,
              align: "center" as any,
            },
          },
          {
            element: "[data-tour='quick-actions']",
            popover: {
              title: "⚡ おすすめアクション",
              description: "まずは「パイプライン探索」から始めるのがおすすめ。1,400件の候補が50件に絞られる過程を体感できます。",
              side: "top" as any,
              align: "center" as any,
            },
          },
          {
            popover: {
              title: "🚀 準備完了！",
              description: "さっそくパイプライン探索から始めてみましょう。左のメニューからいつでもアクセスできます。",
              side: "over" as any,
              align: "center" as any,
            },
          },
        ],
        onDestroyStarted: () => {
          localStorage.setItem("matrix-onboarding-done", "true");
          driverObj.destroy();
        },
      });

      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname, hasChecked, router]);

  return <>{children}</>;
}
