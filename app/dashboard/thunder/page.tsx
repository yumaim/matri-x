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
import { GlossarySection } from "@/components/learning/glossary-section";
import { KafkaSimulatorSimple } from "@/components/learning/kafka-simulator-simple";
import { PracticalTips, thunderTips } from "@/components/learning/practical-tips";
import { LearningProgressTracker } from "@/components/learning/learning-progress-tracker";
import { VisualExplainer } from "@/components/learning/visual-explainer";

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


export default function ThunderPage() {
  return (
      <LearningProgressTracker topicId="thunder" topicName="Thunder (In-Network)" />
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



        <VisualExplainer
          what="Thunderは投稿を3種類（Original Posts / Replies + Reposts / Video Posts）に分けて管理します。それぞれ独立したストア（保存場所）を持ち、超高速にアクセスできます。"
          why="動画投稿は通常投稿よりデータ量が大きく、処理方法も異なるため、専用ストアで管理することで効率が上がります。また、Replies（返信）とReposts（リポスト）も、Original Postsとは取得タイミングやキャッシュ戦略が異なるため、分けて管理されています。"
          how="あなたの運用では、動画投稿は専用の高速ストアから配信されるため、旧システムより速く表示されます。また、返信やリポストも即座にフォロワーのタイムラインに反映されます。"
          example="例: あなたがフォローしている人が動画を投稿すると、Video Posts専用ストアから瞬時に取得され、タイムラインに表示されます。通常投稿と混在していた旧システムより10倍以上速くなっています。"
          variant="blue"
        />
      {/* 用語ガイド */}
      <GlossarySection
        terms={[
          {
            term: "Thunder (サンダー)",
            definition: "フォローしているアカウントからのツイートを超高速で取得する新システム（Rust製）。",
            example: "従来の10倍以上速く、フォロー中の人の最新ツイートを取ってきます。レイテンシは1ミリ秒以下（瞬き1回より速い）。",
            category: "システム全体",
          },
          {
            term: "In-Network",
            definition: "あなたがフォローしているアカウントからのツイート。",
            example: "友達の投稿やフォローしている有名人のツイートです。",
            category: "データの種類",
          },
          {
            term: "Kafka",
            definition: "リアルタイムでデータを流すシステム。ツイートやいいねなどのイベントを瞬時に配信します。",
            example: "YouTubeのライブストリームのように、今起きていることを即座に他のシステムに伝えます。",
            category: "インフラ",
          },
          {
            term: "Latency (レイテンシ)",
            definition: "処理にかかる時間。低いほど高速です。",
            example: "Thunderはレイテンシが1ミリ秒以下（瞬き1回より速い）です。旧システムは10ミリ秒以上かかっていました。",
            category: "パフォーマンス",
          },
          {
            term: "In-Memory Store (インメモリストア)",
            definition: "データをメモリ（RAM）に保存して超高速にアクセスできる仕組み。",
            example: "ハードディスクではなく、PCのRAMに保存するのと同じ。100倍以上速くなります。",
            category: "技術",
          },
          {
            term: "Batch Processing (バッチ処理)",
            definition: "データをまとめて一度に処理すること。リアルタイムではありません。",
            example: "旧システムは削除されたツイートを夜中に一括で消していました。Thunderは削除イベントを即座に反映します。",
            category: "技術",
          },
          {
            term: "Rust",
            definition: "高速で安全なプログラミング言語。Thunderはこれで書かれています。",
            example: "JavaやScalaより速く、メモリエラーも少ない言語です。",
            category: "技術",
          },
        ]}
        title="📖 用語ガイド"
        description="Thunderで使われる専門用語を分かりやすく解説します（クリックして展開）"
      />
      {/* Architecture Overview */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          アーキテクチャ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center">
            <span className="text-2xl">📨</span>
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
      <KafkaSimulatorSimple />

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
      {/* 実践的なTips */}
      <PracticalTips tips={thunderTips} />

      </div>

    </div>


  );
}
