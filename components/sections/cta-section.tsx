"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="glass rounded-3xl p-12 text-center md:p-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            今すぐ<span className="text-gradient">Matri-X</span>を始めましょう
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Xの推薦アルゴリズムを完全に理解し、あなたのコンテンツ戦略を次のレベルへ。
            14日間の無料トライアルで、すべての機能をお試しいただけます。
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="glow-primary group">
              <Link href="/register">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group bg-transparent"
            >
              <Link href="#pricing">料金プランを見る</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            クレジットカード不要 ・ いつでもキャンセル可能
          </p>
        </div>
      </div>
    </section>
  );
}
