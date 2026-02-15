"use client";

import { useState, useEffect, useRef } from "react";
import { Activity, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 軽量版Kafkaストリームシミュレーター
 * - Intersection Observer APIで画面外では停止
 * - 更新頻度を下げて負荷軽減
 * - アニメーションを簡略化
 */
export function KafkaSimulatorSimple() {
  const [isVisible, setIsVisible] = useState(false);
  const [latestEvent, setLatestEvent] = useState<{
    type: "create" | "delete";
    user: string;
    postType: string;
    time: string;
  } | null>(null);
  const [storeSize, setStoreSize] = useState({ original: 12, reply: 8, video: 5 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer: 画面外では停止
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // シミュレーション（画面内でのみ動作）
  useEffect(() => {
    if (!isVisible) return;

    const users = ["@alice", "@bob", "@carol", "@dave"];
    const types = ["original", "reply", "video"] as const;

    const interval = setInterval(() => {
      const isDelete = Math.random() > 0.7;
      const user = users[Math.floor(Math.random() * users.length)];
      const postType = types[Math.floor(Math.random() * types.length)];
      const now = new Date();

      setLatestEvent({
        type: isDelete ? "delete" : "create",
        user,
        postType,
        time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
      });

      setStoreSize((prev) => {
        const delta = isDelete ? -1 : 1;
        return {
          original: Math.max(0, prev.original + (postType === "original" ? delta : 0)),
          reply: Math.max(0, prev.reply + (postType === "reply" ? delta : 0)),
          video: Math.max(0, prev.video + (postType === "video" ? delta : 0)),
        };
      });
    }, 3000); // 3秒間隔（旧: 1.5秒）

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div ref={containerRef} className="rounded-xl border border-border bg-card/50 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-emerald-400" />
        Kafka ストリーム シミュレーション
        <span className="text-xs text-muted-foreground font-normal ml-auto">
          {isVisible ? "稼働中" : "一時停止"}
        </span>
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Latest Event */}
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <RefreshCw className={cn("h-3.5 w-3.5", isVisible && "animate-spin")} />
            最新イベント
          </div>
          <div className="space-y-3">
            {latestEvent ? (
              <div
                className={cn(
                  "rounded-lg border px-4 py-3 animate-in fade-in duration-300",
                  latestEvent.type === "create"
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-red-500/30 bg-red-500/10"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase",
                      latestEvent.type === "create" ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {latestEvent.type === "create" ? "📥 CREATE" : "🗑️ DELETE"}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {latestEvent.time}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-foreground font-medium">{latestEvent.user}</span>
                  <span className="text-muted-foreground mx-2">·</span>
                  <span className="text-muted-foreground capitalize">{latestEvent.postType}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/50 px-4 py-8 text-center text-sm text-muted-foreground">
                イベント待機中...
              </div>
            )}
            <div className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
              💡 Kafkaから<strong>リアルタイム</strong>でイベントを受信し、即座にストアに反映されます。
            </div>
          </div>
        </div>

        {/* In-Memory Store */}
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            インメモリストア
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Original Posts", value: storeSize.original, color: "blue" },
              { label: "Replies + Reposts", value: storeSize.reply, color: "emerald" },
              { label: "Video Posts", value: storeSize.video, color: "purple" },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-lg border px-3 py-2.5 transition-all",
                  item.color === "blue" && "border-blue-500/30 bg-blue-500/5",
                  item.color === "emerald" && "border-emerald-500/30 bg-emerald-500/5",
                  item.color === "purple" && "border-purple-500/30 bg-purple-500/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span
                    className={cn(
                      "text-lg font-bold tabular-nums",
                      item.color === "blue" && "text-blue-400",
                      item.color === "emerald" && "text-emerald-400",
                      item.color === "purple" && "text-purple-400"
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
            ⚡ <strong>サブミリ秒</strong>でルックアップ可能な高速ストア
          </div>
        </div>
      </div>
    </div>
  );
}
