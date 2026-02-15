"use client";

import {
  GitCompareArrows,
  ArrowRight,
  Code,
  Cpu,
  Brain,
  Flame,
  Database,
  Zap,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlossarySection } from "@/components/learning/glossary-section";
import { PracticalTips, comparisonTips } from "@/components/learning/practical-tips";

// ── Data ──

const techComparison = [
  { label: "主要言語", old: "Java 48%, Scala 34%", new: "Rust 62.9%, Python 37.1%" },
  { label: "MLフレームワーク", old: "TensorFlow (Navi)", new: "Grok-1 (PyTorch/JAX)" },
  { label: "ビルドシステム", old: "Bazel", new: "Cargo + uv" },
  { label: "ライセンス", old: "AGPL-3.0", new: "Apache-2.0" },
  { label: "組織", old: "twitter", new: "xai-org" },
  { label: "RPC", old: "Thrift", new: "gRPC" },
];

const componentMapping = [
  {
    old: "Product Mixer (Scala)",
    new: "Home Mixer (Rust)",
    desc: "オーケストレーション",
    icon: Cpu,
  },
  {
    old: "Earlybird (Java)",
    new: "Thunder (Rust)",
    desc: "In-Network候補取得",
    icon: Database,
  },
  {
    old: "SimClusters + CrMixer",
    new: "Phoenix Retrieval (Two-Tower)",
    desc: "Out-of-Network候補取得",
    icon: Brain,
  },
  {
    old: "Heavy Ranker (MaskNet)",
    new: "Phoenix Scorer (Transformer)",
    desc: "ランキング",
    icon: Flame,
  },
  {
    old: "TwHIN, RealGraph, 6000特徴量",
    new: "Transformer 自動学習",
    desc: "特徴量",
    icon: Zap,
  },
];

const designChanges = [
  {
    title: "手動特徴量 → 自動学習",
    old: "6,000特徴量を手動設計",
    new: "Grok Transformerが自動学習",
    impact: "エンジニアリング工数の大幅削減とランキング精度向上",
  },
  {
    title: "固定重み → 動的予測",
    old: "reply: 75.0, fav: 0.5 等の固定値",
    new: "15アクション確率をTransformerが文脈動的に予測",
    impact: "状況に応じた柔軟なスコアリング、全体最適化",
  },
  {
    title: "SimClusters → Two-Tower",
    old: "145Kコミュニティ + グラフベース検出",
    new: "ニューラル類似度検索（Dot Product）",
    impact: "よりパーソナライズされた候補取得",
  },
  {
    title: "Light+Heavy 2段 → Two-Tower+Scoring",
    old: "Light Ranker → Heavy Ranker",
    new: "Retrieval (Two-Tower) → Transformer Scoring",
    impact: "直感的でスケーラブルなアーキテクチャ",
  },
  {
    title: "バッチ依存スコア → Candidate Isolation",
    old: "候補間で相互参照（バッチ依存）",
    new: "候補同士がattendしない（独立スコア）",
    impact: "キャッシュ可能、スコアの一貫性",
  },
];

const engagementComparison = {
  old: [
    { action: "reply_engaged_by_author", weight: "75.0" },
    { action: "reply", weight: "13.5" },
    { action: "good_profile_click", weight: "12.0" },
    { action: "good_click", weight: "11.0" },
    { action: "good_click_v2", weight: "10.0" },
    { action: "retweet", weight: "1.0" },
    { action: "fav", weight: "0.5" },
    { action: "video_playback50", weight: "0.005" },
    { action: "negative_feedback_v2", weight: "-74.0" },
    { action: "report", weight: "-369.0" },
  ],
  new: [
    "P(favorite)", "P(reply)", "P(repost)", "P(quote)",
    "P(click)", "P(profile_click)",
    "P(video_view)", "P(photo_expand)", "P(share)", "P(dwell)",
    "P(follow_author)",
    "P(not_interested)", "P(block_author)", "P(mute_author)", "P(report)",
  ],
};

// ── Page ──

export default function ComparisonPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20">
            <GitCompareArrows className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">新旧アルゴリズム比較</h1>
            <p className="text-muted-foreground">twitter/the-algorithm (2023) vs xai-org/x-algorithm (2026)</p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          2023年に公開された旧アルゴリズムと、2026年にxAIが公開した新アルゴリズムの包括的な比較です。
          言語、アーキテクチャ、設計思想の全てが大きく変わりました。
        </p>
      </div>


      {/* 用語ガイド */}
      <GlossarySection
        terms={[
          {
            term: "旧アルゴリズム vs 新アルゴリズム",
            definition: "2023年のオープンソース版（Java/Scala）と2024年の新バージョン（Rust/Python/Grok）の比較。",
            example: "旧: 手動で6,000個の特徴量を設計。新: Transformerが自動学習。",
            category: "全体",
          },
          {
            term: "手動特徴量 → 自動学習",
            definition: "以前はエンジニアが「リプライ=重要」などのルールを手動で作っていましたが、今はAIが自動で学習します。",
            example: "旧: reply_weightを75.0と手動設定。新: Transformerが文脈から動的に判断。",
            category: "設計思想",
          },
          {
            term: "SimClusters",
            definition: "ユーザーを145,000のコミュニティに分類する旧システム。",
            example: "「猫好きクラスタ」「テック系クラスタ」のように、似た興味を持つ人をグループ化していました。",
            category: "旧システム",
          },
          {
            term: "MaskNet (Heavy Ranker)",
            definition: "旧アルゴリズムのランキングモデル。6,000個の特徴量を使っていました。",
            example: "ツイートの文字数、画像の有無、リプライ数など、1つ1つ手動で設計した特徴を見ていました。",
            category: "旧システム",
          },
          {
            term: "Grok-1",
            definition: "xAIが開発した大規模言語モデル。新アルゴリズムのベースになっています。",
            example: "ChatGPTのような会話AIと同じ技術を、ツイートのランキングに応用しています。",
            category: "新システム",
          },
          {
            term: "バッチ依存 → Candidate Isolation",
            definition: "旧システムは複数のツイートを同時に見てスコアを出していたので、比較対象が変わるとスコアも変わりました。新システムは1つ1つ独立して評価します。",
            example: "旧: AとBを比較してA=80点。CとDを比較してA=75点（矛盾）。新: Aは常に80点。",
            category: "設計思想",
          },
          {
            term: "Rust",
            definition: "高速で安全なプログラミング言語。新システムの多くがこれで書かれています。",
            example: "JavaやScalaより速く、メモリエラーも少ない言語です。Thunderなどに使われています。",
            category: "技術スタック",
          },
        ]}
        title="📖 用語ガイド"
        description="旧→新の変化で使われる専門用語を分かりやすく解説します（クリックして展開）"
      />
      {/* Version Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-muted bg-muted/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Code className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-muted-foreground">旧アルゴリズム (2023)</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">twitter/the-algorithm</span>
            </div>
            <p className="text-muted-foreground">
              Java/Scala ベース。SimClusters + Heavy Ranker (MaskNet) で6,000の手動設計特徴量を使用。
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded">Java 48%</span>
              <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded">Scala 34%</span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Python 10%</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">新アルゴリズム (2026)</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">xai-org/x-algorithm</span>
            </div>
            <p className="text-muted-foreground">
              Rust/Python ベース。Grok Transformerで15アクションを動的に予測。手動特徴量は完全排除。
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded">Rust 62.9%</span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Python 37.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Comparison Table */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4">テクノロジー比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium">項目</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">旧 (2023)</th>
                <th className="text-left py-2 px-3 font-medium text-primary">新 (2026)</th>
              </tr>
            </thead>
            <tbody>
              {techComparison.map((row) => (
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

      {/* Component Mapping */}
      <div>
        <h2 className="text-xl font-semibold mb-4">コンポーネント対応表</h2>
        <div className="space-y-3">
          {componentMapping.map((cm) => (
            <div
              key={cm.desc}
              className="rounded-lg border border-border bg-card/50 p-4 flex flex-col md:flex-row md:items-center gap-3"
            >
              <div className="flex items-center gap-2 shrink-0 w-10">
                <cm.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase shrink-0 w-36">
                {cm.desc}
              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex-1 rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  {cm.old}
                </div>
                <ArrowRight className="h-4 w-4 text-primary shrink-0 hidden md:block" />
                <ArrowRight className="h-4 w-4 text-primary shrink-0 md:hidden rotate-90 mx-auto" />
                <div className="flex-1 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm text-primary font-medium">
                  {cm.new}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Design Philosophy Changes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">設計思想の5大変化</h2>
        <div className="space-y-4">
          {designChanges.map((dc, i) => (
            <div key={i} className="rounded-xl border border-border bg-card/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{dc.title}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium mb-1">
                    <X className="h-3 w-3" /> 旧
                  </div>
                  <div className="text-sm text-muted-foreground">{dc.old}</div>
                </div>
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
                    <Check className="h-3 w-3" /> 新
                  </div>
                  <div className="text-sm text-foreground">{dc.new}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Zap className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                <strong>Impact:</strong> {dc.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Scoring: Old vs New */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4">エンゲージメントスコアリングの進化</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <X className="h-3.5 w-3.5 text-red-400" />
              旧: 固定重み (10種)
            </h3>
            <div className="space-y-1.5">
              {engagementComparison.old.map((e) => (
                <div
                  key={e.action}
                  className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-1.5 text-xs"
                >
                  <span className="font-mono text-muted-foreground">{e.action}</span>
                  <span
                    className={cn(
                      "font-mono font-bold",
                      parseFloat(e.weight) > 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {e.weight}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              score = Σ (固定weight × P(engagement))
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              新: 動的予測 (15種)
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {engagementComparison.new.map((p, i) => (
                <div
                  key={p}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-xs font-mono text-center border",
                    i < 4
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : i < 6
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : i < 10
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : i < 11
                            ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}
                >
                  {p}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              score = Σ (Transformerが動的に決定する重み × P(action))
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaway */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="text-lg font-semibold mb-3">💡 実践的な意味</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            旧アルゴリズムで有効だった戦略の「数値」（リプ75倍、報告-369等）は新アルゴリズムでは固定値として存在しませんが、
            <strong className="text-foreground">方向性は維持</strong>されています：
          </p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>双方向会話（リプライ + 著者返信）は依然として最も重要</li>
            <li>ネガティブフィードバック（ブロック/ミュート/報告）の抑制は引き続き重要</li>
            <li>投稿直後の初速（エンゲージメント速度）はPhoenixの入力として残る</li>
            <li>新たに滞在時間 P(dwell) がスコアに加わった — 質の高いコンテンツが有利</li>
          </ul>
        </div>
      </div>
    </div>

      {/* 実践的なTips */}
      <PracticalTips tips={comparisonTips} />
  );
}
