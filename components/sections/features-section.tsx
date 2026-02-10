"use client";

import {
  Search,
  BarChart3,
  Network,
  Bot,
  MessageSquare,
  Clock,
  Shield,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "パイプライン探索",
    description:
      "候補取得→ランキング→フィルタリング→配信の4段階を視覚化。ライブアニメーションでパイプラインを体験。",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "TweepCredシミュレーター",
    description:
      "ユーザー入力に基づくスコア計算。ゲージ表示による直感的なフィードバック。",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Network,
    title: "SimClusters解説",
    description:
      "クラスター配置の可視化。Out-of-Network推薦の仕組みを理解。",
    color: "text-[#00ba7c]",
    bgColor: "bg-[#00ba7c]/10",
  },
  {
    icon: Bot,
    title: "ディープAI検索",
    description:
      "Xアルゴリズムのソースコードに対するチャット形式の検索。クイックサジェスト機能付き。",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: MessageSquare,
    title: "コミュニティフォーラム",
    description:
      "カテゴリ別投稿・ティア別バッジ。アルゴリズム更新、事例、質問を共有。",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Clock,
    title: "更新タイムライン",
    description:
      "2024-2025年の変更履歴。インパクトレベル表示でトレンドを把握。",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: TrendingUp,
    title: "成功事例",
    description:
      "Before/Afterメトリクス付き。具体的な戦略とKey Insightを学習。",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Shield,
    title: "保護マトリックス",
    description:
      "Trust & Safetyの仕組みを理解。アカウント保護のベストプラクティス。",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">主要機能</span>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            アルゴリズムを{" "}
            <span className="text-gradient">完全に可視化</span>
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Xの推薦アルゴリズムのすべてを理解するための包括的なツールセット
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group glass rounded-2xl p-6 transition-all hover:glow-primary"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
