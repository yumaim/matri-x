"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "アルゴリズムの基礎を学びたい方へ",
    features: [
      "基礎解説へのアクセス",
      "週1回のアルゴリズム更新情報",
      "コミュニティ閲覧（読み取り専用）",
      "基本的なパイプライン解説",
    ],
    cta: "無料で始める",
    popular: false,
    color: "border-border",
  },
  {
    name: "Standard",
    price: "2,980",
    description: "本格的に学びたいマーケター向け",
    features: [
      "すべての可視化ツール",
      "TweepCredシミュレーター",
      "フォーラム閲覧",
      "SimClusters解説",
      "更新タイムライン",
      "成功事例閲覧",
    ],
    cta: "Standardを始める",
    popular: true,
    color: "border-primary",
  },
  {
    name: "Pro",
    price: "5,980",
    description: "プロフェッショナル向けフル機能",
    features: [
      "Standardの全機能",
      "DeepWiki AI検索（無制限）",
      "週次レポート",
      "フォーラム投稿権限",
      "保護マトリックス",
      "優先サポート",
    ],
    cta: "Proを始める",
    popular: false,
    color: "border-accent",
  },
];

export function PricingSection() {
  return (
    <section className="relative py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">料金プラン</span>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            あなたに最適なプランを選択
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            すべてのプランで14日間の無料トライアルが利用可能
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative glass rounded-3xl p-8 transition-all hover:glow-primary ${plan.popular ? "border-2 border-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                  人気プラン
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-sm text-muted-foreground">¥</span>
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/月</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                  asChild
                  className={`mt-8 w-full ${plan.popular ? "glow-primary" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
            </div>
          ))}
        </div>

        {/* Enterprise callout */}
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="glass rounded-2xl p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Enterprise
            </h3>
            <p className="mt-2 text-muted-foreground">
              チーム機能、API アクセス、専属サポートが必要な企業様へ
            </p>
            <Button asChild variant="outline" className="mt-6 bg-transparent">
              <Link href="mailto:info@matri-x-algo.wiki">お問い合わせ</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
