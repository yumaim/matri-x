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
} from "lucide-react";
import { GlossarySection } from "@/components/learning/glossary-section";
import { cn } from "@/lib/utils";
import { PracticalTips, phoenixTips } from "@/components/learning/practical-tips";

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
          Attention Mask (Candidate Isolation)
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
          Phoenixは新アルゴリズムの中核MLコンポーネントです。xAIのGrok-1アーキテクチャをベースに、2ステージ（Retrieval + Ranking）で動作します。
        </p>
      </div>


      {/* 用語ガイド */}
      <GlossarySection
        terms={[
          {
            term: "Phoenix (フェニックス)",
            definition: "Grok AIを使った新しいランキングシステム。より文脈を理解してツイートをスコアリングします。",
            example: "あなたの興味や過去の行動を深く理解して、「今のあなたに最適なツイート」を選びます。",
            category: "システム全体",
          },
          {
            term: "Transformer (トランスフォーマー)",
            definition: "文脈を理解して情報を処理するAIモデルの仕組み。文章の前後関係を把握して、より正確な予測ができます。",
            example: "ChatGPTもTransformerを使っています。あなたの過去の会話を覚えているのと同じように、Xもあなたの過去のいいねやリプライを記憶しています。",
            category: "AI技術",
          },
          {
            term: "Two-Tower Model (ツータワーモデル)",
            definition: "ユーザーと投稿を別々に処理してから、マッチング度を計算する仕組み。",
            example: "マッチングアプリで「あなた」と「相手」のプロフィールを別々に分析してから、相性スコアを出すイメージです。",
            category: "検索ステージ",
          },
          {
            term: "Embedding (埋め込み)",
            definition: "テキストやユーザーを数値のリストに変換したもの。似ている内容は似た数値になります。",
            example: "「猫が好き」と「ネコが好き」は同じembeddingになります。",
            category: "AI技術",
          },
          {
            term: "Dot Product (内積)",
            definition: "2つの数値リストの類似度を計算する方法。値が大きいほど似ています。",
            example: "あなたの好みベクトルと投稿の特徴ベクトルをかけ合わせて、マッチ度を出します。",
            category: "検索ステージ",
          },
          {
            term: "Candidate Isolation (候補分離)",
            definition: "各候補ツイートを独立して評価する仕組み。他のツイートの影響を受けません。",
            example: "複数の商品を見る時、1つ1つ独立して評価するので、比較する商品が変わってもスコアは変わりません。",
            category: "ランキングステージ",
          },
          {
            term: "Attention Mask (アテンションマスク)",
            definition: "AIが「どの情報を見ていいか」を制御するルール。",
            example: "試験中に「この問題は教科書のこのページだけ見ていい」と指定されるのと同じです。",
            category: "ランキングステージ",
          },
          {
            term: "Out-of-Network",
            definition: "フォローしていないアカウントからのツイート。アルゴリズムがおすすめするもの。",
            example: "「おすすめ」タブに出てくる、知らない人の投稿です。",
            category: "システム全体",
          },
        ]}
        title="📖 用語ガイド"
        description="Phoenixで使われる専門用語を分かりやすく解説します（クリックして展開）"
      />
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
            Stage 1: Retrieval (Two-Tower Model)
          </h2>
          <p className="text-muted-foreground">
            全コーパスからOut-of-Networkの関連投稿を効率的に検索するモデルです。
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
                <li>• Dot Product 類似度で検索</li>
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
            Stage 2: Ranking (Transformer + Candidate Isolation)
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
      {/* 実践的なTips */}
      <PracticalTips tips={phoenixTips} />


    </div>


  );
}
