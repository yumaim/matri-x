"use client";

import { Heart, MessageCircle, Repeat2, Share, Bookmark } from "lucide-react";

const engagementWeights = [
  {
    action: "リプライ + 著者リプライ",
    weight: "150x",
    icon: MessageCircle,
    color: "text-primary",
    bgColor: "bg-primary/20",
  },
  {
    action: "リツイート",
    weight: "20x",
    icon: Repeat2,
    color: "text-[#00ba7c]",
    bgColor: "bg-[#00ba7c]/20",
  },
  {
    action: "いいね",
    weight: "30x",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/20",
  },
  {
    action: "シェア",
    weight: "15x",
    icon: Share,
    color: "text-accent",
    bgColor: "bg-accent/20",
  },
  {
    action: "ブックマーク",
    weight: "40x",
    icon: Bookmark,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20",
  },
];

const mediaBoosts = [
  { type: "動画", boost: "3.0x", bar: 100 },
  { type: "画像", boost: "1.8x", bar: 60 },
  { type: "リンク", boost: "1.2x", bar: 40 },
  { type: "テキストのみ", boost: "1.0x", bar: 33 },
];

export function EngagementSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">
            エンゲージメント重み付け
          </span>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            アルゴリズムの<span className="text-gradient">スコアリング</span>を
            理解する
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            各アクションがタイムラインランキングにどう影響するかを可視化
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* Engagement Weights */}
          <div className="glass rounded-3xl p-8">
            <h3 className="text-lg font-semibold text-foreground">
              エンゲージメント重み
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              各アクションのアルゴリズムへの影響度
            </p>
            <div className="mt-8 space-y-4">
              {engagementWeights.map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition-all hover:bg-muted"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}
                    >
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <span className="font-medium text-foreground">
                      {item.action}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gradient">
                    {item.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Media Boosts */}
          <div className="glass rounded-3xl p-8">
            <h3 className="text-lg font-semibold text-foreground">
              メディアブースト係数
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              コンテンツタイプによるブースト倍率
            </p>
            <div className="mt-8 space-y-6">
              {mediaBoosts.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {item.type}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {item.boost}
                    </span>
                  </div>
                  <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${item.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 90-Day Rule Warning */}
            <div className="mt-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
                  !
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-500">
                    90日ルール警告
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    新規アカウントは作成後90日間、アルゴリズムによるペナルティを受ける可能性があります。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
