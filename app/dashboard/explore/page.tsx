"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Database,
  TrendingUp,
  Filter,
  Send,
  ChevronRight,
  Zap,
  Users,
  MessageSquare,
  Heart,
  Repeat2,
  Eye,
  Clock,
  Globe,
  UserPlus,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Inbox,
  Trophy,
  Shield,
  Smartphone,
  Network,
  Radio,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// ─── Funnel Data ─────────────────────────────────────────────────────────────

interface FunnelStage {
  id: string;
  stage: string;
  subtitle: string;
  count: number;
  icon: typeof Database;
  emoji: string;
  color: string;
  borderColor: string;
  bgActive: string;
  bgDone: string;
  textColor: string;
  items: string[];
  description: string;
  details: { title: string; items: string[] }[];
  metrics: { label: string; value: string }[];
}

const funnelStages: FunnelStage[] = [
  {
    id: "fetch",
    stage: "候補取得",
    subtitle: "Candidate Fetch",
    count: 1400,
    icon: Inbox,
    emoji: "📥",
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    bgActive: "bg-blue-500/15",
    bgDone: "bg-blue-500/5",
    textColor: "text-blue-500",
    items: [
      "フォロー中の投稿（Earlybird）",
      "あなたに似た人が見ている投稿（UTEG）",
      "興味が近い人のおすすめ（CrMixer）",
      "注目アカウントの投稿（FRS）",
    ],
    description:
      "あなたがフォローしている人の投稿と、フォロー外のおすすめ投稿を集めます。約1,400件の候補がここで生まれます。",
    details: [
      {
        title: "フォロー中（In-Network）",
        items: [
          "フォロー中の投稿（Earlybird） — 最大600件",
          "リストに登録したアカウントの投稿",
          "リプライ・拡張リプライも含む",
        ],
      },
      {
        title: "フォロー外のおすすめ（Out-of-Network）",
        items: [
          "あなたに似た人が見ている投稿（UTEG） — 300件",
          "興味が近い人のおすすめ（CrMixer / SimClusters） — 400件",
          "注目アカウントの投稿（FRS） — 100件",
        ],
      },
    ],
    metrics: [
      { label: "フォロー中の投稿", value: "600件" },
      { label: "似た人の投稿（UTEG）", value: "300件" },
      { label: "興味のおすすめ（CrMixer）", value: "400件" },
      { label: "注目アカウント（FRS）", value: "100件" },
      { label: "合計候補プール", value: "~1,400件" },
    ],
  },
  {
    id: "ranking",
    stage: "ランキング",
    subtitle: "Ranking & Scoring",
    count: 1000,
    icon: Trophy,
    emoji: "🏆",
    color: "bg-purple-500",
    borderColor: "border-purple-500",
    bgActive: "bg-purple-500/15",
    bgDone: "bg-purple-500/5",
    textColor: "text-purple-500",
    items: [
      "AIスコアリング（Heavy Ranker）",
      "アカウント信頼度スコア（TweepCred）",
      "エンゲージメント予測",
    ],
    description:
      "AIが各投稿に点数をつけます。「あなたがどれくらい興味を持ちそうか」を予測し、スコアの高い順に並べ替えます。",
    details: [
      {
        title: "AIスコアリング（Heavy Ranker / MaskNet）",
        items: [
          "ニューラルネットワーク（MaskNet）を使用",
          "約6,000個の特徴量を分析",
          "10種類のエンゲージメント確率を予測（いいね・リプライなど）",
        ],
      },
      {
        title: "アカウント信頼度（TweepCred / PageRank）",
        items: [
          "Googleの検索と同じ仕組み（PageRank）で信頼度を計算 (0-100)",
          "フォロー/フォロワー比率が不自然なアカウントはペナルティ",
          "アカウントの年齢・使用デバイス・安全ステータスも考慮",
        ],
      },
    ],
    metrics: [
      { label: "AI入力特徴量", value: "~6,000" },
      { label: "リプ+著者返信の重み", value: "75.0" },
      { label: "いいねの重み", value: "0.5" },
      { label: "スパム報告の重み", value: "-369" },
    ],
  },
  {
    id: "filter",
    stage: "フィルタリング",
    subtitle: "Trust & Safety",
    count: 700,
    icon: Shield,
    emoji: "🛡️",
    color: "bg-emerald-500",
    borderColor: "border-emerald-500",
    bgActive: "bg-emerald-500/15",
    bgDone: "bg-emerald-500/5",
    textColor: "text-emerald-500",
    items: [
      "安全性チェック（SafetyLevel）",
      "同じ人の投稿が続かないように（Author Diversity）",
      "重複・不適切コンテンツの除去",
    ],
    description:
      "スパムや不適切な投稿を取り除き、同じ人の投稿ばかり続かないようにバランスを調整します。",
    details: [
      {
        title: "安全性チェック（Visibility Filtering）",
        items: [
          "安全性チェック（SafetyLevel） — タイムライン・プロフィール等の表示先ごとにポリシー適用",
          "スパム・NSFW・法令違反の検出と除去",
          "ブロック/ミュートしたユーザーの投稿を除外",
        ],
      },
      {
        title: "バランス調整（Heuristic Filters）",
        items: [
          "同じ人の投稿が続かないように（Author Diversity）",
          "フォロー中とおすすめのバランス（Content Balance）",
          "同じ種類の反応の抑制（Feedback Fatigue）",
        ],
      },
    ],
    metrics: [
      { label: "除去率", value: "~30%" },
      { label: "多様性スコア", value: "0.7以上" },
      { label: "残り候補", value: "~700件" },
    ],
  },
  {
    id: "serve",
    stage: "配信",
    subtitle: "Timeline Serving",
    count: 50,
    icon: Smartphone,
    emoji: "📱",
    color: "bg-orange-500",
    borderColor: "border-orange-500",
    bgActive: "bg-orange-500/15",
    bgDone: "bg-orange-500/5",
    textColor: "text-orange-500",
    items: [
      "広告挿入",
      "おすすめユーザー表示",
      "最終表示件数（ServerMaxResults）",
    ],
    description:
      "最終的なタイムラインを組み立てます。広告やおすすめユーザーも挟み込んで、あなたのスマホに届けます。",
    details: [
      {
        title: "タイムライン構築（Home Mixer）",
        items: [
          "広告の挿入（ForYouAdsCandidatePipeline）",
          "おすすめユーザーの表示（WhoToFollowCandidatePipeline）",
          "会話スレッドのグループ化（ConversationService）",
        ],
      },
      {
        title: "配信設定",
        items: [
          "最終表示件数（ServerMaxResults） — 1回あたり50件",
          "キャッシュ保持時間 — 3分（CachedScoredTweets）",
          "リアルタイムイベントの優先挿入",
        ],
      },
    ],
    metrics: [
      { label: "最終表示件数", value: "50件/回" },
      { label: "キャッシュ保持", value: "3分" },
      { label: "最小キャッシュ", value: "30件" },
    ],
  },
];

const engagementWeights = [
  {
    action: "リプライ + 著者返信",
    icon: MessageSquare,
    weight: "75.0",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    action: "リプライ",
    icon: MessageSquare,
    weight: "13.5",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    action: "プロフィール→EG",
    icon: Users,
    weight: "12.0",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    action: "会話クリック→EG",
    icon: Eye,
    weight: "11.0",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    action: "2分以上滞在",
    icon: Clock,
    weight: "10.0",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    action: "リポスト",
    icon: Repeat2,
    weight: "1.0",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    action: "いいね",
    icon: Heart,
    weight: "0.5",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

const sourceTypes = [
  {
    name: "フォロー中（In-Network）",
    icon: Users,
    percentage: 50,
    description: "フォローしているアカウントからの投稿",
    color: "bg-blue-500",
  },
  {
    name: "おすすめ（Out-of-Network）",
    icon: Globe,
    percentage: 50,
    description: "フォロー外からのおすすめ投稿",
    color: "bg-purple-500",
  },
];

// ─── Animation Types ─────────────────────────────────────────────────────────

type AnimationPhase = "idle" | "fetch" | "ranking" | "filter" | "serve" | "complete";

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle");
  const [displayCounts, setDisplayCounts] = useState<number[]>([0, 0, 0, 0]);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  // Refs for stable closure access
  const isPlayingRef = useRef(isPlaying);
  const animationPhaseRef = useRef(animationPhase);
  const animFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  isPlayingRef.current = isPlaying;
  animationPhaseRef.current = animationPhase;

  const phaseIndex = (phase: AnimationPhase): number => {
    const map: Record<AnimationPhase, number> = {
      idle: -1,
      fetch: 0,
      ranking: 1,
      filter: 2,
      serve: 3,
      complete: 4,
    };
    return map[phase];
  };

  const isStageActive = (stageId: string): boolean => {
    const stageIdx = funnelStages.findIndex((s) => s.id === stageId);
    const currentIdx = phaseIndex(animationPhase);
    return stageIdx === currentIdx;
  };

  const isStageDone = (stageId: string): boolean => {
    const stageIdx = funnelStages.findIndex((s) => s.id === stageId);
    const currentIdx = phaseIndex(animationPhase);
    return stageIdx < currentIdx;
  };

  const overallProgress = (() => {
    const idx = phaseIndex(animationPhase);
    if (idx < 0) return 0;
    if (animationPhase === "complete") return 100;
    const stageTarget = funnelStages[idx]?.count ?? 0;
    const stageProgress = stageTarget > 0 ? displayCounts[idx] / stageTarget : 0;
    return Math.min(100, ((idx + stageProgress) / funnelStages.length) * 100);
  })();

  // Count-up animation for a single stage
  const animateCountUp = useCallback(
    (stageIdx: number, target: number, durationMs: number): Promise<void> => {
      return new Promise((resolve) => {
        const startTime = performance.now();
        const tick = (now: number) => {
          if (!isPlayingRef.current) {
            resolve();
            return;
          }
          const elapsed = now - startTime;
          const t = Math.min(elapsed / durationMs, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          const current = Math.round(eased * target);
          setDisplayCounts((prev) => {
            const next = [...prev];
            next[stageIdx] = current;
            return next;
          });
          if (t < 1) {
            animFrameRef.current = requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        animFrameRef.current = requestAnimationFrame(tick);
      });
    },
    []
  );

  const resetAnimation = useCallback(() => {
    setIsPlaying(false);
    setAnimationPhase("idle");
    setDisplayCounts([0, 0, 0, 0]);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const runAnimation = useCallback(async () => {
    resetAnimation();

    // Small delay so state clears
    await new Promise((r) => setTimeout(r, 50));

    setIsPlaying(true);
    isPlayingRef.current = true;

    for (let i = 0; i < funnelStages.length; i++) {
      if (!isPlayingRef.current) return;

      const stage = funnelStages[i];
      setAnimationPhase(stage.id as AnimationPhase);
      animationPhaseRef.current = stage.id as AnimationPhase;

      await animateCountUp(i, stage.count, 1800);

      if (!isPlayingRef.current) return;

      // Pause between stages
      await new Promise<void>((resolve) => {
        timeoutRef.current = setTimeout(resolve, 400);
      });
    }

    setAnimationPhase("complete");
    setIsPlaying(false);
  }, [resetAnimation, animateCountUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedStage((prev) => (prev === id ? null : id));
  };

  const maxCount = funnelStages[0].count;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          パイプライン探索
        </h1>
        <p className="mt-1 text-muted-foreground">
          あなたのタイムラインがどうやって作られるか、ステップごとに見てみましょう
        </p>
      </div>

      {/* ─── Funnel Bar ───────────────────────────────────────────────── */}
      <Card className="glass overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">データの流れ（ファネル）</CardTitle>
          <p className="text-sm text-muted-foreground">
            1,400件の候補から最終的に50件があなたのタイムラインに届きます
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {funnelStages.map((stage, idx) => {
            const widthPct = (stage.count / maxCount) * 100;
            const isActive = isStageActive(stage.id);
            const isDone = isStageDone(stage.id);
            const displayCount = displayCounts[idx];
            const showCount =
              animationPhase === "idle"
                ? stage.count
                : animationPhase === "complete"
                  ? stage.count
                  : isDone
                    ? stage.count
                    : isActive
                      ? displayCount
                      : 0;

            return (
              <div key={stage.id} className="flex items-center gap-4">
                <div className="w-28 shrink-0 flex items-center gap-2">
                  <span className="text-lg">{stage.emoji}</span>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive
                        ? stage.textColor
                        : isDone
                          ? "text-foreground"
                          : "text-muted-foreground"
                    )}
                  >
                    {stage.stage}
                  </span>
                </div>
                <div className="flex-1 relative">
                  <div className="h-8 w-full rounded-lg bg-muted/50 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-lg transition-all duration-300",
                        isActive || isDone || animationPhase === "idle" || animationPhase === "complete"
                          ? stage.color
                          : "bg-muted",
                        isActive && "animate-pulse"
                      )}
                      style={{
                        width:
                          animationPhase === "idle" || animationPhase === "complete"
                            ? `${widthPct}%`
                            : isDone
                              ? `${widthPct}%`
                              : isActive
                                ? `${(displayCount / maxCount) * 100}%`
                                : "0%",
                        opacity:
                          animationPhase === "idle" || animationPhase === "complete"
                            ? 0.7
                            : isDone
                              ? 0.5
                              : isActive
                                ? 0.9
                                : 0.2,
                      }}
                    />
                  </div>
                </div>
                <div className="w-20 shrink-0 text-right">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums transition-colors",
                      isActive ? stage.textColor : "text-muted-foreground"
                    )}
                  >
                    {showCount > 0
                      ? showCount.toLocaleString() + "件"
                      : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ─── Workflow Animation ───────────────────────────────────────── */}
      <Card className="glass overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              ワークフロー アニメーション
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              再生ボタンを押すと、データが左から右に流れていく様子が見えます
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={resetAnimation}
              disabled={animationPhase === "idle"}
              className="bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              リセット
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                  isPlayingRef.current = false;
                } else {
                  runAnimation();
                }
              }}
              className="glow-primary"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  一時停止
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  再生
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">進行状況</span>
              <span className="text-primary font-medium">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Workflow Nodes */}
          <div className="relative">
            {/* Desktop: horizontal layout */}
            <div className="hidden lg:flex items-stretch gap-0">
              {funnelStages.map((stage, idx) => {
                const isActive = isStageActive(stage.id);
                const isDone = isStageDone(stage.id);
                const displayCount = displayCounts[idx];
                const showCount =
                  animationPhase === "idle"
                    ? stage.count
                    : animationPhase === "complete"
                      ? stage.count
                      : isDone
                        ? stage.count
                        : isActive
                          ? displayCount
                          : 0;

                return (
                  <div key={stage.id} className="flex items-stretch flex-1">
                    {/* Node Card */}
                    <button
                      onClick={() => toggleExpanded(stage.id)}
                      className={cn(
                        "flex-1 rounded-xl border-2 p-5 transition-all duration-500 text-left",
                        isActive
                          ? `${stage.borderColor} ${stage.bgActive} shadow-lg scale-[1.02]`
                          : isDone
                            ? `${stage.borderColor}/50 ${stage.bgDone}`
                            : "border-border bg-muted/30",
                        "hover:shadow-md"
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300",
                            isActive || isDone
                              ? `${stage.color} text-white`
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <stage.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm block">
                            {stage.emoji} {stage.stage}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {stage.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Count */}
                      <div
                        className={cn(
                          "text-2xl font-bold tabular-nums mb-3 transition-colors",
                          isActive
                            ? stage.textColor
                            : isDone
                              ? "text-foreground"
                              : "text-muted-foreground"
                        )}
                      >
                        {showCount > 0
                          ? showCount.toLocaleString() + "件"
                          : "—"}
                      </div>

                      {/* Items list */}
                      <ul className="space-y-1">
                        {stage.items.map((item, i) => (
                          <li
                            key={i}
                            className={cn(
                              "text-xs flex items-start gap-1.5 transition-colors",
                              isActive || isDone
                                ? "text-foreground/80"
                                : "text-muted-foreground/60"
                            )}
                          >
                            <span className="mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Expand indicator */}
                      <div className="mt-3 flex items-center justify-center">
                        {expandedStage === stage.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Arrow connector */}
                    {idx < funnelStages.length - 1 && (
                      <div className="flex flex-col items-center justify-center px-2 shrink-0">
                        <div
                          className={cn(
                            "flex flex-col items-center gap-1 transition-all duration-500",
                            isDone || isActive
                              ? "opacity-100"
                              : "opacity-30"
                          )}
                        >
                          <ArrowRight
                            className={cn(
                              "h-5 w-5 transition-colors",
                              isDone
                                ? stage.textColor
                                : "text-muted-foreground"
                            )}
                          />
                          <span className="text-[10px] text-muted-foreground font-medium tabular-nums whitespace-nowrap">
                            {isDone
                              ? `→ ${funnelStages[idx + 1].count.toLocaleString()}`
                              : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile: vertical layout */}
            <div className="lg:hidden space-y-3">
              {funnelStages.map((stage, idx) => {
                const isActive = isStageActive(stage.id);
                const isDone = isStageDone(stage.id);
                const displayCount = displayCounts[idx];
                const showCount =
                  animationPhase === "idle"
                    ? stage.count
                    : animationPhase === "complete"
                      ? stage.count
                      : isDone
                        ? stage.count
                        : isActive
                          ? displayCount
                          : 0;

                return (
                  <div key={stage.id}>
                    <button
                      onClick={() => toggleExpanded(stage.id)}
                      className={cn(
                        "w-full rounded-xl border-2 p-4 transition-all duration-500 text-left",
                        isActive
                          ? `${stage.borderColor} ${stage.bgActive} shadow-lg`
                          : isDone
                            ? `${stage.borderColor}/50 ${stage.bgDone}`
                            : "border-border bg-muted/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                              isActive || isDone
                                ? `${stage.color} text-white`
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <stage.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-sm">
                              {stage.emoji} {stage.stage}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              {stage.subtitle}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xl font-bold tabular-nums",
                              isActive
                                ? stage.textColor
                                : isDone
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                            )}
                          >
                            {showCount > 0
                              ? showCount.toLocaleString() + "件"
                              : "—"}
                          </span>
                          {expandedStage === stage.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {stage.items.map((item, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </button>

                    {/* Vertical arrow */}
                    {idx < funnelStages.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ChevronRight
                          className={cn(
                            "h-5 w-5 rotate-90 transition-colors",
                            isDone
                              ? stage.textColor
                              : "text-muted-foreground/30"
                          )}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Animation Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border">
            {funnelStages.map((stage) => (
              <div key={stage.id} className="flex items-center gap-2 text-xs">
                <div className={cn("h-3 w-3 rounded", stage.color)} />
                <span className="text-muted-foreground">{stage.stage}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Expanded Stage Detail ─────────────────────────────────── */}
      {expandedStage && (() => {
        const stage = funnelStages.find((s) => s.id === expandedStage);
        if (!stage) return null;
        return (
          <Card className="glass overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-white",
                        stage.color
                      )}
                    >
                      <stage.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {stage.emoji} {stage.stage}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    {stage.description}
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {stage.details.map((detail) => (
                      <div key={detail.title}>
                        <h4 className="font-medium text-foreground">
                          {detail.title}
                        </h4>
                        <ul className="mt-2 space-y-1">
                          {detail.items.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:w-64">
                  <h4 className="font-medium text-foreground">メトリクス</h4>
                  <div className="mt-3 space-y-3">
                    {stage.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="flex items-center justify-between rounded-lg bg-background/50 p-3"
                      >
                        <span className="text-sm text-muted-foreground">
                          {metric.label}
                        </span>
                        <span className="font-semibold text-foreground">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* ─── Tabs: Engagement / Sources ────────────────────────────── */}
      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="engagement">
            エンゲージメント重み付け
          </TabsTrigger>
          <TabsTrigger value="sources">ソースタイプ</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">
                エンゲージメント重み付け係数
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AIがスコアを計算するとき、各アクションにどれだけ重みをつけるかの一覧です
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {engagementWeights.map((item) => (
                  <div
                    key={item.action}
                    className={cn(
                      "flex items-center gap-4 rounded-xl p-4",
                      item.bgColor
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                      <item.icon className={cn("h-6 w-6", item.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {item.action}
                      </div>
                      <div className={cn("text-2xl font-bold", item.color)}>
                        {item.weight}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                <div className="flex items-start gap-3">
                  <Zap className="mt-0.5 h-5 w-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium text-foreground">
                      重要なポイント
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      リプライに著者が返信すると75.0の重み。いいね(0.5)の<strong>150倍</strong>です。
                      つまり、双方向の会話がアルゴリズムにとって最も価値があります。
                      「いいね」を押すだけより、リプライして会話を生むことがタイムラインへの影響力を大きく高めます。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">
                投稿ソースの内訳
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                あなたのタイムラインの半分はフォロー中、残り半分はおすすめで構成されています
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {sourceTypes.map((source) => (
                  <div
                    key={source.name}
                    className="rounded-xl bg-muted/50 p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-xl text-white",
                          source.color
                        )}
                      >
                        <source.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {source.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {source.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          タイムライン占有率
                        </span>
                        <span className="text-2xl font-bold text-gradient">
                          {source.percentage}%
                        </span>
                      </div>
                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-background">
                        <div
                          className={cn("h-full rounded-full", source.color)}
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <UserPlus className="h-4 w-4" />
                おすすめ（Out-of-Network）の比率は2023年のオープンソース化以降、50%まで増加しました
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── SimClusters Visualization ─────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              SimClusters — あなたの投稿はどこへ届く？
            </h2>
            <p className="text-sm text-muted-foreground">
              興味コミュニティの仕組みとコンテンツ波及を可視化
            </p>
          </div>
        </div>

        {/* ── Community Venn Diagram ──────────────────────────────────── */}
        <Card className="glass overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              興味コミュニティの重なり
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Xの全ユーザーは145,000の「興味コミュニティ」に自動分類されます。あなたは複数のコミュニティに同時に所属しています。
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* SVG Venn Diagram with pulse animation */}
              <div className="relative w-full max-w-md mx-auto lg:mx-0 aspect-square">
                <style>{`
                  @keyframes simclusters-pulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.08); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 0.6; }
                  }
                  @keyframes simclusters-ripple {
                    0% { r: 6; opacity: 1; }
                    100% { r: 40; opacity: 0; }
                  }
                  @keyframes simclusters-ripple-outer {
                    0% { r: 6; opacity: 0.8; }
                    100% { r: 60; opacity: 0; }
                  }
                  @keyframes simclusters-ripple-max {
                    0% { r: 6; opacity: 0.6; }
                    100% { r: 80; opacity: 0; }
                  }
                  .sc-community-tech { animation: simclusters-pulse 3s ease-in-out infinite 0s; }
                  .sc-community-mkt  { animation: simclusters-pulse 3s ease-in-out infinite 0.6s; }
                  .sc-community-ent  { animation: simclusters-pulse 3s ease-in-out infinite 1.2s; }
                  .sc-community-biz  { animation: simclusters-pulse 3s ease-in-out infinite 1.8s; }
                  .sc-community-news { animation: simclusters-pulse 3s ease-in-out infinite 2.4s; }
                  .sc-ripple-1 { animation: simclusters-ripple 2.5s ease-out infinite; }
                  .sc-ripple-2 { animation: simclusters-ripple-outer 2.5s ease-out infinite 0.5s; }
                  .sc-ripple-3 { animation: simclusters-ripple-max 2.5s ease-out infinite 1.0s; }
                `}</style>
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  {/* Community circles (Venn-style overlapping) */}
                  {/* Technology - Blue (top-left) */}
                  <circle cx="120" cy="110" r="70" fill="#3B82F6" opacity="0.25" className="sc-community-tech" />
                  <circle cx="120" cy="110" r="70" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5" />
                  {/* Marketing - Green (top-right) */}
                  <circle cx="185" cy="110" r="65" fill="#22C55E" opacity="0.25" className="sc-community-mkt" />
                  <circle cx="185" cy="110" r="65" fill="none" stroke="#22C55E" strokeWidth="1.5" opacity="0.5" />
                  {/* Entertainment - Purple (bottom-left) */}
                  <circle cx="105" cy="185" r="62" fill="#A855F7" opacity="0.25" className="sc-community-ent" />
                  <circle cx="105" cy="185" r="62" fill="none" stroke="#A855F7" strokeWidth="1.5" opacity="0.5" />
                  {/* Business - Orange (bottom-right) */}
                  <circle cx="195" cy="180" r="60" fill="#F97316" opacity="0.25" className="sc-community-biz" />
                  <circle cx="195" cy="180" r="60" fill="none" stroke="#F97316" strokeWidth="1.5" opacity="0.5" />
                  {/* News - Red (center-bottom) */}
                  <circle cx="150" cy="200" r="55" fill="#EF4444" opacity="0.2" className="sc-community-news" />
                  <circle cx="150" cy="200" r="55" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.5" />

                  {/* Center: Your post (ripple origin) */}
                  <circle cx="150" cy="150" r="6" fill="#FBBF24" opacity="1" />
                  <circle cx="150" cy="150" r="6" fill="none" stroke="#FBBF24" strokeWidth="2" className="sc-ripple-1" />
                  <circle cx="150" cy="150" r="6" fill="none" stroke="#FBBF24" strokeWidth="1.5" className="sc-ripple-2" />
                  <circle cx="150" cy="150" r="6" fill="none" stroke="#FBBF24" strokeWidth="1" className="sc-ripple-3" />

                  {/* Labels */}
                  <text x="95" y="80" textAnchor="middle" fill="#3B82F6" fontSize="11" fontWeight="600">テクノロジー</text>
                  <text x="210" y="75" textAnchor="middle" fill="#22C55E" fontSize="11" fontWeight="600">マーケティング</text>
                  <text x="70" y="225" textAnchor="middle" fill="#A855F7" fontSize="11" fontWeight="600">エンタメ</text>
                  <text x="230" y="225" textAnchor="middle" fill="#F97316" fontSize="11" fontWeight="600">ビジネス</text>
                  <text x="150" y="265" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="600">ニュース</text>

                  {/* Center label */}
                  <text x="150" y="135" textAnchor="middle" fill="#FBBF24" fontSize="10" fontWeight="bold">あなたの投稿</text>
                </svg>
              </div>

              {/* Legend / explanation */}
              <div className="flex-1 space-y-3">
                <h4 className="font-semibold text-foreground">コミュニティの見方</h4>
                <p className="text-sm text-muted-foreground">
                  円が重なっている部分は、複数の興味を持つユーザーが集まるゾーン。あなたの投稿は、中心からパルスのように各コミュニティへ波及します。
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {[
                    { name: "テクノロジー", color: "bg-blue-500" },
                    { name: "マーケティング", color: "bg-green-500" },
                    { name: "エンタメ", color: "bg-purple-500" },
                    { name: "ビジネス", color: "bg-orange-500" },
                    { name: "ニュース", color: "bg-red-500" },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className={cn("h-3 w-3 rounded-full", c.color)} />
                      <span>{c.name}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span>あなたの投稿</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── How SimClusters Works (Explanation Cards) ───────────────── */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Card 1: SimClusters とは */}
          <Card className="glass overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20">
                  <Users className="h-5 w-5 text-indigo-400" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">
                  興味コミュニティとは？
                </h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SimClusters は、Xの全ユーザーを<strong className="text-foreground">145,000の興味コミュニティ</strong>に自動分類するシステムです。
                フォロー関係や「いいね」の傾向から、ユーザーの興味を多次元的に把握します。
              </p>
              <div className="mt-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
                <p className="text-xs text-muted-foreground">
                  💡 あなたは1つではなく、複数のコミュニティに同時に所属しています
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: How your post reaches beyond followers */}
          <Card className="glass overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Radio className="h-5 w-5 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">
                  フォロワー外に届く仕組み
                </h4>
              </div>
              <ol className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <li className="flex gap-2">
                  <Badge variant="secondary" className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full text-[10px] p-0">1</Badge>
                  <span>あなたが<strong className="text-foreground">「テクノロジー × マーケティング」</strong>のコミュニティに分類される</span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="secondary" className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full text-[10px] p-0">2</Badge>
                  <span>同じコミュニティの他ユーザーのタイムラインに<strong className="text-foreground">表示候補</strong>になる</span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="secondary" className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full text-[10px] p-0">3</Badge>
                  <span>コミュニティが<strong className="text-foreground">重なっている部分</strong>のユーザーほど表示されやすい</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Card 3: CrMixer */}
          <Card className="glass overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/20">
                  <Sparkles className="h-5 w-5 text-orange-400" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">
                  興味が近い人のおすすめ
                </h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CrMixer は、興味コミュニティの情報を使って、あなたがフォローしていない人の投稿からおすすめを<strong className="text-foreground">最大400件</strong>取得するエンジンです。
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-xs text-muted-foreground">取得上限</span>
                  <span className="text-sm font-bold text-foreground">400件</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-xs text-muted-foreground">データソース</span>
                  <span className="text-sm font-bold text-foreground">SimClusters</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-xs text-muted-foreground">対象</span>
                  <span className="text-sm font-bold text-foreground">フォロー外</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Ripple Propagation Animation ────────────────────────────── */}
        <Card className="glass overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className="h-5 w-5 text-yellow-400" />
              投稿の波及イメージ
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              あなたの投稿が興味コミュニティを通じてフォロワー外に広がっていく様子
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative w-full max-w-lg mx-auto aspect-[4/3]">
              <style>{`
                @keyframes sc-propagate-ring-1 {
                  0%   { transform: scale(0.15); opacity: 1; }
                  100% { transform: scale(1); opacity: 0; }
                }
                @keyframes sc-propagate-ring-2 {
                  0%   { transform: scale(0.15); opacity: 0.8; }
                  100% { transform: scale(1.2); opacity: 0; }
                }
                @keyframes sc-propagate-ring-3 {
                  0%   { transform: scale(0.15); opacity: 0.6; }
                  100% { transform: scale(1.4); opacity: 0; }
                }
                @keyframes sc-glow-center {
                  0%, 100% { box-shadow: 0 0 8px 2px rgba(251,191,36,0.4); }
                  50% { box-shadow: 0 0 20px 6px rgba(251,191,36,0.7); }
                }
                @keyframes sc-node-appear-1 {
                  0%, 30% { opacity: 0; transform: scale(0.5); }
                  50% { opacity: 1; transform: scale(1.1); }
                  60%, 100% { opacity: 1; transform: scale(1); }
                }
                @keyframes sc-node-appear-2 {
                  0%, 50% { opacity: 0; transform: scale(0.5); }
                  70% { opacity: 1; transform: scale(1.1); }
                  80%, 100% { opacity: 1; transform: scale(1); }
                }
                @keyframes sc-node-appear-3 {
                  0%, 65% { opacity: 0; transform: scale(0.5); }
                  85% { opacity: 1; transform: scale(1.1); }
                  95%, 100% { opacity: 1; transform: scale(1); }
                }
                .sc-ring-1 { animation: sc-propagate-ring-1 3s ease-out infinite; }
                .sc-ring-2 { animation: sc-propagate-ring-2 3s ease-out infinite 0.6s; }
                .sc-ring-3 { animation: sc-propagate-ring-3 3s ease-out infinite 1.2s; }
                .sc-center-glow { animation: sc-glow-center 2s ease-in-out infinite; }
                .sc-appear-1 { animation: sc-node-appear-1 3s ease-out infinite; }
                .sc-appear-2 { animation: sc-node-appear-2 3s ease-out infinite; }
                .sc-appear-3 { animation: sc-node-appear-3 3s ease-out infinite; }
              `}</style>

              {/* Propagation rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="sc-ring-1 absolute w-full h-full rounded-full border-2 border-yellow-400/50" />
                <div className="sc-ring-2 absolute w-full h-full rounded-full border border-blue-400/40" />
                <div className="sc-ring-3 absolute w-full h-full rounded-full border border-purple-400/30" />
              </div>

              {/* Community nodes around the center */}
              {/* Tech - top */}
              <div className="sc-appear-1 absolute top-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-full bg-blue-500/30 border border-blue-500/50 flex items-center justify-center">
                  <span className="text-xs">💻</span>
                </div>
                <span className="text-[10px] text-blue-400 font-medium">テクノロジー</span>
              </div>
              {/* Marketing - top-right */}
              <div className="sc-appear-1 absolute top-[20%] right-[8%] flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-full bg-green-500/30 border border-green-500/50 flex items-center justify-center">
                  <span className="text-xs">📢</span>
                </div>
                <span className="text-[10px] text-green-400 font-medium">マーケティング</span>
              </div>
              {/* Entertainment - bottom-right */}
              <div className="sc-appear-2 absolute bottom-[18%] right-[10%] flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-full bg-purple-500/30 border border-purple-500/50 flex items-center justify-center">
                  <span className="text-xs">🎬</span>
                </div>
                <span className="text-[10px] text-purple-400 font-medium">エンタメ</span>
              </div>
              {/* Business - bottom-left */}
              <div className="sc-appear-2 absolute bottom-[18%] left-[10%] flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-full bg-orange-500/30 border border-orange-500/50 flex items-center justify-center">
                  <span className="text-xs">💼</span>
                </div>
                <span className="text-[10px] text-orange-400 font-medium">ビジネス</span>
              </div>
              {/* News - top-left */}
              <div className="sc-appear-3 absolute top-[20%] left-[8%] flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-full bg-red-500/30 border border-red-500/50 flex items-center justify-center">
                  <span className="text-xs">📰</span>
                </div>
                <span className="text-[10px] text-red-400 font-medium">ニュース</span>
              </div>

              {/* Outer user nodes (reached users) */}
              {[
                { top: "2%", left: "30%", delay: "sc-appear-2" },
                { top: "2%", right: "25%", delay: "sc-appear-3" },
                { top: "40%", right: "2%", delay: "sc-appear-2" },
                { bottom: "5%", right: "30%", delay: "sc-appear-3" },
                { bottom: "5%", left: "30%", delay: "sc-appear-3" },
                { top: "40%", left: "2%", delay: "sc-appear-2" },
              ].map((pos, i) => (
                <div
                  key={i}
                  className={cn("absolute flex items-center justify-center", pos.delay)}
                  style={{ top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom }}
                >
                  <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Users className="h-3 w-3 text-white/50" />
                  </div>
                </div>
              ))}

              {/* Center: Your post */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                <div className="sc-center-glow h-14 w-14 rounded-full bg-yellow-500/40 border-2 border-yellow-400 flex items-center justify-center">
                  <Send className="h-6 w-6 text-yellow-300" />
                </div>
                <span className="text-xs font-bold text-yellow-300 whitespace-nowrap">あなたの投稿</span>
              </div>
            </div>

            {/* Caption */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                💡 あなたの投稿は、まず所属するコミュニティ内で候補になり、次に重なるコミュニティへ広がります
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  あなたの投稿（発信源）
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full border border-yellow-400/50" />
                  波及パルス
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10 border border-white/20" />
                  フォロワー外のユーザー
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
