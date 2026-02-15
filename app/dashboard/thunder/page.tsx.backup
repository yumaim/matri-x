"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  ArrowRight,
  Activity,
  Clock,
  Database,
  Layers,
  MessageCircle,
  Video,
  FileText,
  Zap,
  Gauge,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Data ──

const postTypes = [
  {
    icon: FileText,
    label: "Original Posts",
    emoji: "📝",
    description: "通常投稿",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: MessageCircle,
    label: "Replies + Reposts",
    emoji: "💬",
    description: "返信とリポスト",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Video,
    label: "Video Posts",
    emoji: "🎥",
    description: "動画投稿（専用管理）",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
];

const comparisonRows = [
  { label: "言語", old: "Java", new: "Rust" },
  { label: "ストレージ", old: "転置インデックス", new: "インメモリストア" },
  { label: "レイテンシ", old: "ミリ秒〜10msクラス", new: "サブミリ秒 (<1ms)" },
  { label: "動画専用ストア", old: "なし", new: "✅ 対応" },
  { label: "リアルタイム削除", old: "バッチ処理", new: "Kafkaイベント即時反映" },
  { label: "外部DB依存", old: "あり", new: "なし（完全インメモリ）" },
];

// ── Components ──

function KafkaStreamSimulator() {
  const [state, setState] = useState<{
    events: { id: number; type: "create" | "delete"; user: string; postType: string; time: string }[];
    storeSize: { original: number; reply: number; video: number };
  }>({
    events: [],
    storeSize: { original: 0, reply: 0, video: 0 },
  });

  const { events, storeSize } = state;

  useEffect(() => {
    const users = ["@alice", "@bob", "@carol", "@dave", "@eve"];
    const types = ["original", "reply", "video"];
    let count = 0;

    const interval = setInterval(() => {
      const isDelete = Math.random() > 0.75 && count > 3;
      const user = users[Math.floor(Math.random() * users.length)];
      const postType = types[Math.floor(Math.random() * types.length)];
      const now = new Date();

      const newEvent = {
        id: ++count,
        type: isDelete ? ("delete" as const) : ("create" as const),
        user,
        postType,
        time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
      };

      setState((prev) => {
        const newEvents = [newEvent, ...prev.events].slice(0, 8);
        const newStoreSize = !isDelete
          ? {
              original: prev.storeSize.original + (postType === "original" ? 1 : 0),
              reply: prev.storeSize.reply + (postType === "reply" ? 1 : 0),
              video: prev.storeSize.video + (postType === "video" ? 1 : 0),
            }
          : {
              original: Math.max(0, prev.storeSize.original - (postType === "original" ? 1 : 0)),
              reply: Math.max(0, prev.storeSize.reply - (postType === "reply" ? 1 : 0)),
              video: Math.max(0, prev.storeSize.video - (postType === "video" ? 1 : 0)),
            };

        return {
          events: newEvents,
          storeSize: newStoreSize,
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card/50 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-emerald-400" />
        Kafka ストリーム シミュレーション
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Event Stream */}
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            リアルタイムイベント
          </div>
          <div className="space-y-1.5 max-h-[320px] overflow-hidden">
            {events.map((ev) => (
              <div
                key={ev.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all animate-in slide-in-from-top-1 duration-300",
                  ev.type === "create"
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5"
                )}
              >
                <span className="text-xs font-mono text-muted-foreground">{ev.time}</span>
                <span
                  className={cn(
                    "text-xs font-mono px-1.5 py-0.5 rounded",
                    ev.type === "create"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  )}
                >
                  {ev.type === "create" ? "CREATE" : "DELETE"}
                </span>
                <span className="font-mono text-primary text-xs">{ev.user}</span>
                <span className="text-muted-foreground text-xs">
                  {ev.postType === "original" ? "📝" : ev.postType === "reply" ? "💬" : "🎥"}
                </span>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                イベントを待機中...
              </div>
            )}
          </div>
        </div>

        {/* Store Sizes */}
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            インメモリストア状態
          </div>
          <div className="space-y-3">
            {postTypes.map((pt, i) => {
              const count =
                i === 0 ? storeSize.original : i === 1 ? storeSize.reply : storeSize.video;
              return (
                <div key={pt.label} className={cn("rounded-lg border p-4", pt.bgColor)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pt.emoji}</span>
                      <div>
                        <div className={cn("text-sm font-semibold", pt.color)}>{pt.label}</div>
                        <div className="text-xs text-muted-foreground">{pt.description}</div>
                      </div>
                    </div>
                    <div className={cn("text-2xl font-bold font-mono", pt.color)}>{count}</div>
                  </div>
                  <div className="h-2 rounded-full bg-background/50">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        i === 0 ? "bg-blue-500" : i === 1 ? "bg-emerald-500" : "bg-purple-500"
                      )}
                      style={{ width: `${Math.min(100, count * 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──

export default function ThunderPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Thunder</h1>
            <p className="text-muted-foreground">In-Memory Post Store & Realtime Ingestion</p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Thunderは新アルゴリズムで追加された完全新規コンポーネント。フォロー中のアカウントの投稿を
          <strong className="text-foreground"> サブミリ秒 </strong>
          でルックアップするRust製インメモリポストストアです。
        </p>
      </div>

      {/* Architecture Overview */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          アーキテクチャ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center">
            <span className="text-2xl">📨</span>
            <div className="text-sm font-semibold mt-1">Kafka</div>
            <div className="text-xs text-muted-foreground">イベントストリーム</div>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
            <ArrowRight className="h-5 w-5 text-muted-foreground md:hidden rotate-90" />
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
            <span className="text-2xl">⚡</span>
            <div className="text-sm font-semibold mt-1">Thunder</div>
            <div className="text-xs text-muted-foreground">インメモリ処理</div>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
            <ArrowRight className="h-5 w-5 text-muted-foreground md:hidden rotate-90" />
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
            <span className="text-2xl">🏠</span>
            <div className="text-sm font-semibold mt-1">Home Mixer</div>
            <div className="text-xs text-muted-foreground">パイプラインへ</div>
          </div>
        </div>
      </div>

      {/* 3 Post Types */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          3種のポストストア
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {postTypes.map((pt) => (
            <div key={pt.label} className={cn("rounded-xl border p-5", pt.bgColor)}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{pt.emoji}</span>
                <div>
                  <div className={cn("font-semibold", pt.color)}>{pt.label}</div>
                  <div className="text-xs text-muted-foreground">{pt.description}</div>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-amber-400" />
                  サブミリ秒アクセス
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-blue-400" />
                  自動TTLトリミング
                </li>
                <li className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-emerald-400" />
                  Kafkaイベント駆動
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400">パフォーマンス</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>⚡ <strong>サブミリ秒</strong>の読み取りレイテンシ</li>
            <li>🔌 外部データベースへのアクセス<strong>不要</strong></li>
            <li>📦 ユーザー × ポスト種別でパーティション</li>
            <li>🧹 保持期間超過で自動トリミング</li>
          </ul>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-blue-400">リアルタイム性</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>📨 Kafkaイベント（create/delete）を即時消費</li>
            <li>🔄 投稿の作成・削除がリアルタイムで反映</li>
            <li>🎥 動画投稿の専用管理（Video-First対応）</li>
            <li>🌐 In-Network候補をHome Mixerに提供</li>
          </ul>
        </div>
      </div>

      {/* Kafka Stream Simulation */}
      <KafkaStreamSimulator />

      {/* Earlybird Comparison */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          Earlybird → Thunder 移行
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium">項目</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">旧 (Earlybird)</th>
                <th className="text-left py-2 px-3 font-medium text-primary">新 (Thunder)</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-2.5 px-3 font-medium">{row.label}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{row.old}</td>
                  <td className="py-2.5 px-3 text-primary font-medium">{row.new}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source Code Reference */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h3 className="text-lg font-semibold mb-3">ソースコード参照</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded text-xs">Rust</span>
            <code className="text-muted-foreground">thunder/</code>
            <span className="text-muted-foreground">— インメモリポストストア全体</span>
          </div>
          <a
            href="https://github.com/xai-org/x-algorithm/tree/main/thunder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
          >
            GitHub で見る <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
