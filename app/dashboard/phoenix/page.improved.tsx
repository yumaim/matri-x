"use client";

import { useState, useMemo } from "react";
import {
  Flame,
  ArrowRight,
  Layers,
  Search,
  Brain,
  Target,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Lightbulb,
  Users,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TechTerm } from "@/components/shared/tech-term";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ── Data ──

const predictions = [
  { name: "P(favorite)", label: "いいね", category: "positive", emoji: "❤️" },
  { name: "P(reply)", label: "リプライ", category: "positive", emoji: "💬" },
  { name: "P(repost)", label: "リポスト", category: "positive", emoji: "🔁" },
  { name: "P(quote)", label: "引用", category: "positive", emoji: "✍️" },
  { name: "P(click)", label: "クリック", category: "interest", emoji: "👆" },
  { name: "P(profile_click)", label: "プロフィール", category: "interest", emoji: "👤" },
  { name: "P(video_view)", label: "動画視聴", category: "consumption", emoji: "🎥" },
  { name: "P(photo_expand)", label: "画像拡大", category: "consumption", emoji: "🖼️" },
  { name: "P(share)", label: "共有", category: "consumption", emoji: "📤" },
  { name: "P(dwell)", label: "滞在", category: "consumption", emoji: "⏱️" },
  { name: "P(follow_author)", label: "フォロー", category: "social", emoji: "➕" },
  { name: "P(not_interested)", label: "興味なし", category: "negative", emoji: "😐" },
  { name: "P(block_author)", label: "ブロック", category: "negative", emoji: "🚫" },
  { name: "P(mute_author)", label: "ミュート", category: "negative", emoji: "🔇" },
  { name: "P(report)", label: "報告", category: "negative", emoji: "🚨" },
];

const categoryColors: Record<string, string> = {
  positive: "text-emerald-400",
  interest: "text-blue-400",
  consumption: "text-amber-400",
  social: "text-purple-400",
  negative: "text-red-400",
};

const categoryBg: Record<string, string> = {
  positive: "bg-emerald-500/10 border-emerald-500/20",
  interest: "bg-blue-500/10 border-blue-500/20",
  consumption: "bg-amber-500/10 border-amber-500/20",
  social: "bg-purple-500/10 border-purple-500/20",
  negative: "bg-red-500/10 border-red-500/20",
};

const categoryLabels: Record<string, string> = {
  positive: "ポジティブ",
  interest: "インタレスト",
  consumption: "コンテンツ消費",
  social: "ソーシャル",
  negative: "ネガティブ",
};

// ── Components ──

function AttentionMaskVisualizer() {
  const [numCandidates, setNumCandidates] = useState(4);
  const historyLen = 5;
  const total = 1 + historyLen + numCandidates;

  const labels = useMemo<{ text: string; type: "user" | "history" | "candidate" }[]>(
    () => [
      { text: "U", type: "user" },
      ...Array.from({ length: historyLen }, (_, i) => ({
        text: `H${i + 1}`,
        type: "history" as const,
      })),
      ...Array.from({ length: numCandidates }, (_, i) => ({
        text: `C${i + 1}`,
        type: "candidate" as const,
      })),
    ],
    [numCandidates]
  );

  const canAttend = (query: number, key: number): boolean => {
    const qLabel = labels[query];
    const kLabel = labels[key];
    if (qLabel.type === "user" || qLabel.type === "history") {
      return kLabel.type === "user" || kLabel.type === "history";
    }
    // candidate
    if (kLabel.type === "user" || kLabel.type === "history") return true;
    return query === key; // only self
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <TechTerm
            term="Attention Mask"
            definition="Transformerがどの情報を参照できるかを制御する仕組み"
            example="採点時に他の答案を見ないように、候補同士は互いを参照しない"
          />
          {" "}(Candidate Isolation)
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">候補数:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNumCandidates(Math.max(2, numCandidates - 1))}
              className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-mono font-bold">{numCandidates}</span>
            <button
              onClick={() => setNumCandidates(Math.min(7, numCandidates + 1))}
              className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `40px repeat(${total}, 1fr)` }}>
          {/* Header row */}
          <div />
          {labels.map((l, i) => (
            <div
              key={`h-${i}`}
              className={cn(
                "w-10 h-8 flex items-center justify-center text-xs font-mono rounded",
                l.type === "user" && "text-purple-400",
                l.type === "history" && "text-blue-400",
                l.type === "candidate" && "text-amber-400"
              )}
            >
              {l.text}
            </div>
          ))}

          {/* Rows */}
          {labels.map((rowLabel, row) => (
            <>
              <div
                key={`rl-${row}`}
                className={cn(
                  "w-10 h-10 flex items-center justify-center text-xs font-mono rounded",
                  rowLabel.type === "user" && "text-purple-400",
                  rowLabel.type === "history" && "text-blue-400",
                  rowLabel.type === "candidate" && "text-amber-400"
                )}
              >
                {rowLabel.text}
              </div>
              {labels.map((_, col) => {
                const attend = canAttend(row, col);
                return (
                  <div
                    key={`c-${row}-${col}`}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded text-sm transition-all duration-300",
                      attend
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/5 text-red-400/30 border border-red-500/10"
                    )}
                  >
                    {attend ? "✓" : "✗"}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
          Attend可能 (✓)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-500/5 border border-red-500/10" />
          Attend不可 (✗)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-400 font-mono">U</span> User
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-blue-400 font-mono">H</span> History
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 font-mono">C</span> Candidate
        </div>
      </div>
    </div>
  );
}

function PredictionGrid() {
  const grouped = predictions.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<string, typeof predictions>
  );

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-sm font-semibold", categoryColors[category])}>
              {categoryLabels[category]}
            </span>
            <span className="text-xs text-muted-foreground">({items.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {items.map((p) => (
              <div
                key={p.name}
                className={cn(
                  "rounded-lg border px-3 py-2.5 transition-all hover:scale-[1.02]",
                  categoryBg[category]
                )}
              >
                <div className="text-lg mb-1">{p.emoji}</div>
                <div className="text-xs font-mono text-muted-foreground">{p.name}</div>
                <div className="text-sm font-medium">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──

export default function PhoenixPage() {
  const [activeTab, setActiveTab] = useState<"retrieval" | "ranking">("retrieval");

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Phoenix</h1>
            <p className="text-muted-foreground">Grok-based Recommendation System</p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Phoenixは新アルゴリズムの中核MLコンポーネントです。xAIの
          <TechTerm
            term="Grok-1アーキテクチャ"
            definition="xAIが開発した大規模言語モデルのアーキテクチャ"
            example="ChatGPTのような対話AIの基盤技術"
          />
          をベースに、2ステージ（Retrieval + Ranking）で動作します。
        </p>
      </div>

      {/* Real-World Benefits */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          あなたのタイムラインがどう変わるか
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <strong>より精度の高いレコメンド:</strong> あなたの興味に合った投稿が上位に表示されます
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <strong>新しい発見:</strong> フォロー外の良質なコンテンツも見つかります
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong>ノイズの削減:</strong> 不快なコンテンツや興味のない投稿が減ります
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <strong>リアルタイム最適化:</strong> あなたの反応をすぐに学習し、改善し続けます
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          ステップバイステップガイド
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="beginner">
            <AccordionTrigger className="text-left">
              <span className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">初級</span>
                2ステージって何？なぜ必要なの？
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>🔍 Stage 1 (Retrieval):</strong> 「検索エンジン」のようなもの。全ての投稿（数百万件）から、あなたに関連しそうな投稿を数千件に絞り込みます。
              </p>
              <p>
                <strong>🎯 Stage 2 (Ranking):</strong> 「採点」のようなもの。絞り込んだ数千件を精密に評価し、最も良い順番に並べ替えます。
              </p>
              <p className="bg-primary/5 p-3 rounded-lg">
                💡 <strong>例え:</strong> レストラン探しに例えると、Stage 1 = Googleで「近くのイタリアン」検索、Stage 2 = 口コミと評価を見て最終決定
              </p>
              <p>
                <strong>なぜ2段階？</strong> 数百万件を全て精密評価すると時間がかかりすぎます。まず候補を絞ってから精査する方が効率的です。
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="intermediate">
            <AccordionTrigger className="text-left">
              <span className="flex items-center gap-2">
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">中級</span>
                Two-Towerモデルの仕組み
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Two-Tower (2つの塔)</strong> は、ユーザーと投稿を別々に処理する仕組みです。
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>User Tower:</strong> あなたの興味や過去の行動を数値化（"埋め込み"）</li>
                <li><strong>Candidate Tower:</strong> 各投稿の内容を数値化（"埋め込み"）</li>
                <li>両方の数値を比較（Dot Product）して類似度を計算</li>
              </ul>
              <p className="bg-primary/5 p-3 rounded-lg">
                💡 <strong>例え:</strong> 図書館の検索システム。あなたの「好みカード」と本の「特徴カード」を照合して、マッチ度を計算
              </p>
              <p>
                <strong>メリット:</strong> 投稿を事前に処理しておけるので、リアルタイムで高速検索が可能です。
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="advanced">
            <AccordionTrigger className="text-left">
              <span className="flex items-center gap-2">
                <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">上級</span>
                Candidate Isolationとは？
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Candidate Isolation</strong> は、候補同士が互いに影響しないようにスコアリングする技術です。
              </p>
              <p className="bg-primary/5 p-3 rounded-lg">
                💡 <strong>例え:</strong> テストの採点で、他の生徒の答案を見ずに各自を独立評価。公平で一貫性のある採点が可能になります。
              </p>
              <div className="space-y-1">
                <p><strong>技術的な実現方法:</strong></p>
                <ul className="list-disc list-inside ml-2">
                  <li>Attention Maskで候補間の相互参照を禁止</li>
                  <li>各候補は User + History のみを参照</li>
                  <li>結果: バッチ構成に依存しないスコア</li>
                </ul>
              </div>
              <p>
                <strong>実用的メリット:</strong> スコアをキャッシュできるので、同じ投稿を何度も評価する必要がなく、システム全体が高速化します。
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Two-Stage Pipeline */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          2ステージ推薦パイプライン
        </h2>

        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <div className="text-3xl mb-2">👤</div>
            <div className="font-mono text-sm text-muted-foreground">User Request</div>
            <div className="text-xs text-muted-foreground mt-1">あなたがタイムラインを開く</div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="md:hidden flex items-center justify-center py-2">
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab("retrieval")}
              className={cn(
                "rounded-lg border p-4 text-center transition-all cursor-pointer",
                activeTab === "retrieval"
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                  : "border-border hover:border-blue-500/50"
              )}
            >
              <Search className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <div className="text-sm font-semibold">Stage 1</div>
              <div className="text-xs text-muted-foreground">Retrieval</div>
              <div className="text-xs text-blue-400 font-mono mt-1">数百万→数千</div>
            </button>
            <button
              onClick={() => setActiveTab("ranking")}
              className={cn(
                "rounded-lg border p-4 text-center transition-all cursor-pointer",
                activeTab === "ranking"
                  ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10"
                  : "border-border hover:border-orange-500/50"
              )}
            >
              <Brain className="h-5 w-5 mx-auto mb-1 text-orange-400" />
              <div className="text-sm font-semibold">Stage 2</div>
              <div className="text-xs text-muted-foreground">Ranking</div>
              <div className="text-xs text-orange-400 font-mono mt-1">数千→ランク付き</div>
            </button>
          </div>
        </div>
      </div>

      {/* Stage Detail */}
      {activeTab === "retrieval" ? (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-400">
            <Search className="h-5 w-5" />
            Stage 1: Retrieval (
            <TechTerm
              term="Two-Tower Model"
              definition="ユーザーと投稿を別々に処理して類似度で検索するモデル"
              example="Google検索で関連ページを見つけるイメージ"
            />
            )
          </h2>
          <p className="text-muted-foreground">
            全コーパスから
            <TechTerm
              term="Out-of-Network"
              definition="フォローしていないアカウントの投稿"
              example="新しい発見のための推薦"
            />
            の関連投稿を効率的に検索するモデルです。
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-500/20 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-sm">🗼</span>
                </div>
                <div>
                  <div className="font-semibold">User Tower</div>
                  <div className="text-xs text-muted-foreground font-mono">[B, D]</div>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• ユーザー特徴量をエンコード</li>
                <li>• エンゲージメント履歴を入力</li>
                <li>• Transformerで正規化された埋め込みを出力</li>
                <li>• Ranking Modelと同じアーキテクチャ</li>
              </ul>
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-sm">🗼</span>
                </div>
                <div>
                  <div className="font-semibold">Candidate Tower</div>
                  <div className="text-xs text-muted-foreground font-mono">[N, D]</div>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 全投稿をエンコード</li>
                <li>• 正規化された埋め込みを生成</li>
                <li>• 
                  <TechTerm
                    term="Dot Product"
                    definition="2つのベクトルの内積。類似度の計算に使用"
                    example="2つの数値リストの対応要素を掛けて合計"
                  />
                  {" "}類似度で検索
                </li>
                <li>• Top-K候補を返す</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-blue-500/30 bg-blue-500/5 p-4 text-center">
            <span className="font-mono text-sm text-blue-400">
              similarity = dot(user_embedding, candidate_embedding)
            </span>
            <div className="text-xs text-muted-foreground mt-1">
              数百万件 → Top-K件に絞り込み
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-orange-400">
            <Brain className="h-5 w-5" />
            Stage 2: Ranking (
            <TechTerm
              term="Transformer"
              definition="文脈を理解する深層学習モデル。GPTやGrokの基盤技術"
              example="文章の意味を理解するAI"
            />
            {" "}+ Candidate Isolation)
          </h2>
          <p className="text-muted-foreground">
            候補をGrok-based Transformerで最終スコアリング。
            <strong className="text-orange-400"> Candidate Isolation</strong> により、候補同士が互いに影響しないスコアリングを実現。
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card/50 p-4 text-center">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold text-sm">User Embedding</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">[B, 1]</div>
              <div className="text-xs text-muted-foreground mt-1">User Hashes</div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4 text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold text-sm">History Embeddings</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">[B, S, D]</div>
              <div className="text-xs text-muted-foreground mt-1">Posts + Authors + Actions</div>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-sm">Candidate Embeddings</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">[B, C, D]</div>
              <div className="text-xs text-muted-foreground mt-1">Posts + Authors + Surface</div>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-orange-500/30 bg-orange-500/5 p-4 space-y-2">
            <div className="text-center font-mono text-sm text-orange-400">
              Output: [B, num_candidates, 15 actions]
            </div>
            <div className="text-center text-xs text-muted-foreground">
              → Final Score = Σ (weight_i × P(action_i))
            </div>
          </div>
        </div>
      )}

      {/* Attention Mask Visualization */}
      <AttentionMaskVisualizer />

      {/* 15 Predictions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          15種類のエンゲージメント予測
        </h2>
        <p className="text-muted-foreground text-sm">
          Phoenix Scorerは各候補に対して15種類のアクション確率を同時に予測します。
          ポジティブアクションは正の重み、ネガティブアクションは負の重みで最終スコアに反映されます。
        </p>
        <PredictionGrid />
      </div>

      {/* Key Insight: Why Candidate Isolation */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          なぜ Candidate Isolation が重要なのか
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <EyeOff className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <strong>バッチ非依存:</strong> 候補Aのスコアは、同じバッチの候補B,Cに影響されない
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Activity className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong>キャッシュ可能:</strong> スコアが一貫しているため、結果をキャッシュできる
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <strong>スケーラブル:</strong> 候補数に関わらず一貫したスコアリング品質
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingDown className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <strong>旧方式の問題:</strong> 相互参照によりバッチ構成でスコアが変動
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Source Code Reference */}
      <div className="rounded-xl border border-border bg-card/50 p-6">
        <h3 className="text-lg font-semibold mb-3">ソースコード参照</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">Python</span>
            <code className="text-muted-foreground">phoenix/</code>
            <span className="text-muted-foreground">— ML推薦エンジン全体</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">Python</span>
            <code className="text-muted-foreground">uv run run_ranker.py</code>
            <span className="text-muted-foreground">— ランカー実行</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">Python</span>
            <code className="text-muted-foreground">uv run run_retrieval.py</code>
            <span className="text-muted-foreground">— リトリーバル実行</span>
          </div>
          <a
            href="https://github.com/xai-org/x-algorithm/tree/main/phoenix"
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
