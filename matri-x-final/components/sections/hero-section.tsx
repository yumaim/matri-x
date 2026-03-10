"use client";

import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "10,000+", label: "アクティブユーザー" },
  { value: "95%", label: "アルゴリズム理解度向上" },
  { value: "150x", label: "エンゲージメント重み付け" },
  { value: "24時間", label: "最新情報を反映" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Xアルゴリズム完全解析
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-foreground">Xの推薦アルゴリズムを</span>
            <br />
            <span className="text-gradient">完全に理解する</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            オープンソース化されたX(旧Twitter)のアルゴリズムを視覚的・動的に学び、
            あなたのコンテンツ戦略を次のレベルへ引き上げましょう。
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="glow-primary group">
              無料で始める
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group bg-transparent"
            >
              <Play className="mr-2 h-4 w-4" />
              デモを見る
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-6 text-center transition-all hover:glow-primary"
            >
              <div className="text-3xl font-bold text-gradient">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline Preview */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="glass rounded-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                推薦パイプライン概要
              </h3>
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
                ライブプレビュー
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "候補取得",
                  desc: "フォロー中・Out-of-Networkから候補を収集",
                  color: "bg-primary",
                },
                {
                  step: "02",
                  title: "ランキング",
                  desc: "TweepCred・エンゲージメント予測でスコアリング",
                  color: "bg-accent",
                },
                {
                  step: "03",
                  title: "フィルタリング",
                  desc: "Trust & Safety、多様性フィルター適用",
                  color: "bg-[#00ba7c]",
                },
                {
                  step: "04",
                  title: "配信",
                  desc: "最適化されたタイムラインを表示",
                  color: "bg-orange-500",
                },
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="rounded-xl bg-muted/50 p-4 transition-all hover:bg-muted">
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.color} text-sm font-bold text-white`}
                    >
                      {item.step}
                    </div>
                    <h4 className="font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className="absolute top-1/2 -right-2 hidden h-0.5 w-4 -translate-y-1/2 bg-border md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
