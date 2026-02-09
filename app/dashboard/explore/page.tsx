"use client";

import { useState, useEffect, useCallback } from "react";
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
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const pipelineStages = [
  {
    id: "fetch",
    step: "01",
    title: "候補取得",
    subtitle: "Candidate Fetch",
    icon: Database,
    color: "bg-primary",
    description: "フォロー中のアカウントとOut-of-Networkから候補ツイートを収集",
    details: [
      {
        title: "In-Network Sources",
        items: [
          "フォロー中のアカウントのツイート",
          "リストに登録したアカウント",
          "過去にエンゲージしたアカウント",
        ],
      },
      {
        title: "Out-of-Network Sources",
        items: [
          "SimClustersによる類似興味ユーザー",
          "フォロワーのフォロワー(2次ネットワーク)",
          "トレンドトピック関連",
        ],
      },
    ],
    metrics: [
      { label: "In-Network比率", value: "50%" },
      { label: "Out-of-Network比率", value: "50%" },
      { label: "候補プール", value: "~1500件" },
    ],
  },
  {
    id: "ranking",
    step: "02",
    title: "ランキング",
    subtitle: "Ranking & Scoring",
    icon: TrendingUp,
    color: "bg-accent",
    description: "機械学習モデルとTweepCredスコアを使用してランキング",
    details: [
      {
        title: "Heavy Ranker",
        items: [
          "エンゲージメント予測モデル",
          "ユーザー興味との関連度",
          "コンテンツ品質スコア",
        ],
      },
      {
        title: "TweepCred",
        items: [
          "アカウント信頼度スコア",
          "PageRankベースのアルゴリズム",
          "フォロワー/フォロー比率考慮",
        ],
      },
    ],
    metrics: [
      { label: "Heavy Rankerパス", value: "~1000件" },
      { label: "TweepCred閾値", value: "0.4以上" },
      { label: "ランキング時間", value: "<100ms" },
    ],
  },
  {
    id: "filter",
    step: "03",
    title: "フィルタリング",
    subtitle: "Trust & Safety",
    icon: Filter,
    color: "bg-[#00ba7c]",
    description: "安全性、多様性、ユーザー設定に基づくフィルタリング",
    details: [
      {
        title: "Safety Filters",
        items: [
          "スパム・悪意あるコンテンツ除去",
          "センシティブコンテンツフラグ",
          "ブロック/ミュートユーザー除外",
        ],
      },
      {
        title: "Diversity Filters",
        items: [
          "同一著者の連続表示制限",
          "トピック多様性の確保",
          "フォーマット(画像/動画/テキスト)バランス",
        ],
      },
    ],
    metrics: [
      { label: "除去率", value: "~30%" },
      { label: "多様性スコア", value: "0.7以上" },
      { label: "最終候補", value: "~700件" },
    ],
  },
  {
    id: "serve",
    step: "04",
    title: "配信",
    subtitle: "Timeline Serving",
    icon: Send,
    color: "bg-orange-500",
    description: "最終的なタイムラインを構築してユーザーに配信",
    details: [
      {
        title: "Timeline Mixing",
        items: [
          "広告の適切な配置",
          "プロモートコンテンツ挿入",
          "リアルタイムイベント優先",
        ],
      },
      {
        title: "Personalization",
        items: [
          "ユーザー設定の反映",
          "時間帯による最適化",
          "デバイス別の調整",
        ],
      },
    ],
    metrics: [
      { label: "表示件数", value: "~50件/回" },
      { label: "更新頻度", value: "リアルタイム" },
      { label: "レイテンシ", value: "<200ms" },
    ],
  },
];

const engagementWeights = [
  { action: "リプライ + 著者リプライ", icon: MessageSquare, weight: "150x", color: "text-primary" },
  { action: "いいね", icon: Heart, weight: "30x", color: "text-pink-500" },
  { action: "リツイート", icon: Repeat2, weight: "20x", color: "text-[#00ba7c]" },
  { action: "プロフィールクリック", icon: Users, weight: "12x", color: "text-accent" },
  { action: "詳細表示", icon: Eye, weight: "11x", color: "text-orange-500" },
  { action: "2分以上滞在", icon: Clock, weight: "+加点", color: "text-cyan-500" },
];

const sourceTypes = [
  {
    name: "In-Network",
    icon: Users,
    percentage: 50,
    description: "フォロー中のアカウントからのツイート",
    color: "bg-primary",
  },
  {
    name: "Out-of-Network",
    icon: Globe,
    percentage: 50,
    description: "フォロー外からのおすすめツイート",
    color: "bg-accent",
  },
];

// Simulated tweet data flowing through pipeline
const sampleTweets = [
  { id: 1, author: "@tech_news", content: "AI breakthrough...", type: "in-network" },
  { id: 2, author: "@startup_jp", content: "New funding round...", type: "out-network" },
  { id: 3, author: "@dev_tips", content: "React 19 features...", type: "in-network" },
  { id: 4, author: "@crypto_watch", content: "Market update...", type: "out-network" },
  { id: 5, author: "@design_daily", content: "UI trends 2026...", type: "in-network" },
  { id: 6, author: "@spam_bot", content: "Buy now!!!", type: "spam" },
  { id: 7, author: "@news_flash", content: "Breaking news...", type: "out-network" },
  { id: 8, author: "@code_guru", content: "TypeScript tips...", type: "in-network" },
];

type AnimationPhase = "idle" | "fetch" | "ranking" | "filter" | "serve" | "complete";

export default function ExplorePage() {
  const [activeStage, setActiveStage] = useState("fetch");
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [visibleTweets, setVisibleTweets] = useState<typeof sampleTweets>([]);
  const [filteredTweets, setFilteredTweets] = useState<typeof sampleTweets>([]);
  const [rankedTweets, setRankedTweets] = useState<typeof sampleTweets>([]);
  const [finalTweets, setFinalTweets] = useState<typeof sampleTweets>([]);

  const currentStage = pipelineStages.find((s) => s.id === activeStage);

  const resetAnimation = useCallback(() => {
    setIsPlaying(false);
    setAnimationPhase("idle");
    setProgress(0);
    setVisibleTweets([]);
    setFilteredTweets([]);
    setRankedTweets([]);
    setFinalTweets([]);
    setActiveStage("fetch");
  }, []);

  const startAnimation = useCallback(() => {
    resetAnimation();
    setIsPlaying(true);
    setAnimationPhase("fetch");
  }, [resetAnimation]);

  useEffect(() => {
    if (!isPlaying) return;

    let timeout: NodeJS.Timeout;

    if (animationPhase === "fetch") {
      setActiveStage("fetch");
      // Gradually add tweets to visible
      let index = 0;
      const addTweet = () => {
        if (index < sampleTweets.length) {
          setVisibleTweets((prev) => [...prev, sampleTweets[index]]);
          setProgress((index + 1) / sampleTweets.length * 25);
          index++;
          timeout = setTimeout(addTweet, 300);
        } else {
          timeout = setTimeout(() => setAnimationPhase("ranking"), 800);
        }
      };
      addTweet();
    } else if (animationPhase === "ranking") {
      setActiveStage("ranking");
      // Sort tweets by "score" (simulate ranking)
      const ranked = [...sampleTweets]
        .filter(t => t.type !== "spam")
        .sort(() => Math.random() - 0.5);
      
      let index = 0;
      const rankTweet = () => {
        if (index < ranked.length) {
          setRankedTweets((prev) => [...prev, ranked[index]]);
          setProgress(25 + (index + 1) / ranked.length * 25);
          index++;
          timeout = setTimeout(rankTweet, 400);
        } else {
          timeout = setTimeout(() => setAnimationPhase("filter"), 800);
        }
      };
      rankTweet();
    } else if (animationPhase === "filter") {
      setActiveStage("filter");
      // Filter out some tweets
      const filtered = rankedTweets.filter((_, i) => i < 5);
      
      let index = 0;
      const filterTweet = () => {
        if (index < filtered.length) {
          setFilteredTweets((prev) => [...prev, filtered[index]]);
          setProgress(50 + (index + 1) / filtered.length * 25);
          index++;
          timeout = setTimeout(filterTweet, 350);
        } else {
          timeout = setTimeout(() => setAnimationPhase("serve"), 800);
        }
      };
      filterTweet();
    } else if (animationPhase === "serve") {
      setActiveStage("serve");
      // Show final timeline
      let index = 0;
      const serveTweet = () => {
        if (index < filteredTweets.length) {
          setFinalTweets((prev) => [...prev, filteredTweets[index]]);
          setProgress(75 + (index + 1) / filteredTweets.length * 25);
          index++;
          timeout = setTimeout(serveTweet, 300);
        } else {
          timeout = setTimeout(() => {
            setAnimationPhase("complete");
            setIsPlaying(false);
          }, 500);
        }
      };
      serveTweet();
    }

    return () => clearTimeout(timeout);
  }, [isPlaying, animationPhase, rankedTweets, filteredTweets]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          パイプライン探索
        </h1>
        <p className="mt-1 text-muted-foreground">
          Xの推薦アルゴリズムの全体像を段階的に理解しましょう
        </p>
      </div>

      {/* Animation Controls & Visualization */}
      <Card className="glass overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">パイプラインアニメーション</CardTitle>
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
              onClick={() => isPlaying ? setIsPlaying(false) : startAnimation()}
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
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">進行状況</span>
              <span className="text-primary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Animated Pipeline Flow */}
          <div className="grid grid-cols-4 gap-4">
            {/* Stage 1: Fetch */}
            <div className={cn(
              "rounded-xl border-2 p-4 transition-all duration-300",
              animationPhase === "fetch" ? "border-primary bg-primary/10" : 
              ["ranking", "filter", "serve", "complete"].includes(animationPhase) ? "border-primary/50 bg-primary/5" :
              "border-border bg-muted/30"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  animationPhase === "fetch" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Database className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">候補取得</span>
              </div>
              <div className="space-y-1 min-h-[120px]">
                {visibleTweets.map((tweet, i) => (
                  <div
                    key={tweet.id}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded text-xs transition-all duration-300",
                      tweet.type === "spam" ? "bg-destructive/20 text-destructive" :
                      tweet.type === "in-network" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                    )}
                    style={{ 
                      animationDelay: `${i * 100}ms`,
                      animation: "fadeInUp 0.3s ease-out forwards"
                    }}
                  >
                    <FileText className="h-3 w-3" />
                    <span className="truncate">{tweet.author}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                {visibleTweets.length} / {sampleTweets.length} ツイート
              </div>
            </div>

            {/* Stage 2: Ranking */}
            <div className={cn(
              "rounded-xl border-2 p-4 transition-all duration-300",
              animationPhase === "ranking" ? "border-accent bg-accent/10" : 
              ["filter", "serve", "complete"].includes(animationPhase) ? "border-accent/50 bg-accent/5" :
              "border-border bg-muted/30"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  animationPhase === "ranking" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                )}>
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">ランキング</span>
              </div>
              <div className="space-y-1 min-h-[120px]">
                {rankedTweets.map((tweet, i) => (
                  <div
                    key={tweet.id}
                    className="flex items-center gap-2 p-1.5 rounded text-xs bg-accent/20 text-accent transition-all"
                    style={{ 
                      animationDelay: `${i * 100}ms`,
                      animation: "fadeInUp 0.3s ease-out forwards"
                    }}
                  >
                    <span className="font-bold w-4">#{i + 1}</span>
                    <span className="truncate">{tweet.author}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                スコア順にソート
              </div>
            </div>

            {/* Stage 3: Filter */}
            <div className={cn(
              "rounded-xl border-2 p-4 transition-all duration-300",
              animationPhase === "filter" ? "border-[#00ba7c] bg-[#00ba7c]/10" : 
              ["serve", "complete"].includes(animationPhase) ? "border-[#00ba7c]/50 bg-[#00ba7c]/5" :
              "border-border bg-muted/30"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  animationPhase === "filter" ? "bg-[#00ba7c] text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Filter className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">フィルタ</span>
              </div>
              <div className="space-y-1 min-h-[120px]">
                {filteredTweets.map((tweet, i) => (
                  <div
                    key={tweet.id}
                    className="flex items-center gap-2 p-1.5 rounded text-xs bg-[#00ba7c]/20 text-[#00ba7c] transition-all"
                    style={{ 
                      animationDelay: `${i * 100}ms`,
                      animation: "fadeInUp 0.3s ease-out forwards"
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="truncate">{tweet.author}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                安全性チェック済み
              </div>
            </div>

            {/* Stage 4: Serve */}
            <div className={cn(
              "rounded-xl border-2 p-4 transition-all duration-300",
              animationPhase === "serve" || animationPhase === "complete" ? "border-orange-500 bg-orange-500/10" : 
              "border-border bg-muted/30"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  animationPhase === "serve" || animationPhase === "complete" ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Send className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">配信</span>
              </div>
              <div className="space-y-1 min-h-[120px]">
                {finalTweets.map((tweet, i) => (
                  <div
                    key={tweet.id}
                    className="flex items-center gap-2 p-1.5 rounded text-xs bg-orange-500/20 text-orange-500 transition-all"
                    style={{ 
                      animationDelay: `${i * 100}ms`,
                      animation: "fadeInUp 0.3s ease-out forwards"
                    }}
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span className="truncate">{tweet.author}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                タイムラインへ
              </div>
            </div>
          </div>

          {/* Animation Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded bg-primary" />
              <span className="text-muted-foreground">In-Network</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded bg-accent" />
              <span className="text-muted-foreground">Out-of-Network</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded bg-destructive" />
              <span className="text-muted-foreground">スパム(除去)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Visualization */}
      <Card className="glass overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">推薦パイプライン</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pipeline Steps */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {pipelineStages.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-4 lg:flex-1">
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={cn(
                    "flex flex-1 items-center gap-4 rounded-xl p-4 transition-all",
                    activeStage === stage.id
                      ? "bg-muted ring-2 ring-primary"
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white",
                      stage.color
                    )}
                  >
                    <stage.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">
                      Step {stage.step}
                    </div>
                    <div className="font-semibold text-foreground">
                      {stage.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stage.subtitle}
                    </div>
                  </div>
                </button>
                {index < pipelineStages.length - 1 && (
                  <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted-foreground lg:block" />
                )}
              </div>
            ))}
          </div>

          {/* Active Stage Details */}
          {currentStage && (
            <div className="mt-8 rounded-xl bg-muted/50 p-6">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-white",
                        currentStage.color
                      )}
                    >
                      <currentStage.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {currentStage.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {currentStage.subtitle}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    {currentStage.description}
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {currentStage.details.map((detail) => (
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
                    {currentStage.metrics.map((metric) => (
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Additional Content */}
      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="engagement">エンゲージメント重み付け</TabsTrigger>
          <TabsTrigger value="sources">ソースタイプ</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">
                エンゲージメント重み付け係数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {engagementWeights.map((item) => (
                  <div
                    key={item.action}
                    className="flex items-center gap-4 rounded-xl bg-muted/50 p-4"
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
                      リプライと著者リプライの組み合わせが最も高い重み付け(150x)を持ちます。
                      これは、双方向のコミュニケーションがアルゴリズムにとって最も価値があることを意味します。
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
                ツイートソースの内訳
              </CardTitle>
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
                Out-of-Networkの比率は2023年のオープンソース化以降、50%まで増加しました
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
