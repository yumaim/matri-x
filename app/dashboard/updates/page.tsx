"use client";

import { useState, useEffect, useRef } from "react";
import {
  GitCommit,
  GitBranch,
  Calendar,
  ChevronRight,
  ExternalLink,
  Code,
  FileCode,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Bell,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Shield,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function useInView(ref: React.RefObject<HTMLElement | null>, options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
  return isInView;
}

function TimelineItem({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  return (
    <div
      ref={ref}
      className={`relative transition-all duration-500 ease-out ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {children}
    </div>
  );
}
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UpdateType = "feature" | "fix" | "improvement" | "breaking";

interface Update {
  id: string;
  date: string;
  title: string;
  description: string;
  type: UpdateType;
  commitHash: string;
  files: string[];
  impact: "high" | "medium" | "low";
  category: string;
}

const updates: Update[] = [
  {
    id: "1",
    date: "2026-02-01",
    title: "X API Pay-Per-Use移行",
    description:
      "月額サブスクリプションモデルを廃止し、従量課金（Pay-Per-Use）に完全移行。これに伴いAnalytics APIが一般開放され、すべての開発者がツイートのインプレッション・エンゲージメントデータにアクセス可能に。既存のAPI連携は課金体系の変更により影響を受ける可能性があります。",
    type: "breaking",
    commitHash: "f3a819e2",
    files: [
      "api/billing/pay-per-use-migration.scala",
      "api/analytics/AnalyticsEndpoint.scala",
      "api/config/rate-limits.yaml",
    ],
    impact: "high",
    category: "API",
  },
  {
    id: "2",
    date: "2025-12-15",
    title: "加速度（Velocity）重視の強化",
    description:
      "リアルタイム特徴量における30分ウィンドウの重要性が大幅に増加。投稿後30分間のエンゲージメント速度（いいね・RT・リプライの獲得ペース）がHeavy Rankerのスコアに与える影響を拡大しました。初速の重要性がこれまで以上に高まっています。",
    type: "feature",
    commitHash: "c7b42d1a",
    files: [
      "home-mixer/server/src/main/scala/com/twitter/home_mixer/functional_component/feature_hydrator/RealTimeFeatureHydrator.scala",
      "home-mixer/server/src/main/scala/com/twitter/home_mixer/param/ScoredTweetsParam.scala",
    ],
    impact: "high",
    category: "ランキング",
  },
  {
    id: "3",
    date: "2025-10-01",
    title: "Grok統合によるコンテンツ品質評価",
    description:
      "コンテンツ品質評価にGrok AIを導入。ツイートが投稿された時点でGrokによる品質スコアリングを実施し、スパム・低品質コンテンツの初期表示候補からの除外精度を向上。初期表示の母数調整により、高品質ツイートのリーチが改善されます。",
    type: "feature",
    commitHash: "9e1f5a38",
    files: [
      "home-mixer/server/src/main/scala/com/twitter/home_mixer/functional_component/scorer/GrokQualityScorer.scala",
      "home-mixer/server/src/main/scala/com/twitter/home_mixer/param/ScoredTweetsParam.scala",
    ],
    impact: "high",
    category: "AI",
  },
  {
    id: "4",
    date: "2025-08-20",
    title: "フォロー外リーチ拡大",
    description:
      "Out-of-Network候補（SimClusters経由）の比率を約50%に拡大。CrMixerの候補取得数を従来の200件から400件に増加し、フォロー外ユーザーへのコンテンツ到達機会を大幅に拡張。バイラルコンテンツがより広範囲に拡散されるようになります。",
    type: "improvement",
    commitHash: "4d6e82bf",
    files: [
      "cr-mixer/server/src/main/scala/com/twitter/cr_mixer/candidate_generation/CrMixerCandidateGenerator.scala",
      "home-mixer/server/src/main/scala/com/twitter/home_mixer/param/ScoredTweetsParam.scala",
    ],
    impact: "medium",
    category: "候補取得",
  },
  {
    id: "5",
    date: "2025-06-10",
    title: "Community Notes API開放",
    description:
      "Community Notesの作成・検索・評価がAPIから可能になりました。開発者はプログラマティックにノートの投稿やステータス確認ができるようになり、ファクトチェック関連のツール構築が容易に。",
    type: "feature",
    commitHash: "b2c7a4d9",
    files: [
      "api/community-notes/NotesEndpoint.scala",
      "api/community-notes/RatingsEndpoint.scala",
    ],
    impact: "medium",
    category: "API",
  },
  {
    id: "6",
    date: "2025-03-15",
    title: "SimClusters v2.1 改良",
    description:
      "SimClustersのコミュニティ数を約145,000に最適化。リアルタイムツイート埋め込み更新の精度が向上し、ユーザーの興味関心クラスタリングがより正確に。ニッチなトピックへの推薦精度が大幅に改善されました。",
    type: "improvement",
    commitHash: "71ea3fc5",
    files: [
      "src/scala/com/twitter/simclusters_v2/hdfs_sources/SimClustersV21Config.scala",
      "src/scala/com/twitter/simclusters_v2/scalding/embedding/EntityEmbeddingsJob.scala",
      "src/scala/com/twitter/simclusters_v2/scalding/KnownForSources.scala",
    ],
    impact: "high",
    category: "SimClusters",
  },
  {
    id: "7",
    date: "2024-11-01",
    title: "Heavy Ranker重み付け調整",
    description:
      "Heavy Rankerの重み付けが大幅に調整されました。reply_engaged_by_author（著者がリプライに反応）が75.0で最強の正シグナルに。negative_feedbackは-74.0、reportは-369.0と強いペナルティに設定。一方でいいね(fav)の重みは0.5に低下し、単純ないいね稼ぎの効果が激減しています。",
    type: "breaking",
    commitHash: "a8d30e17",
    files: [
      "home-mixer/server/src/main/scala/com/twitter/home_mixer/param/ScoredTweetsParam.scala",
      "home-mixer/server/src/main/scala/com/twitter/home_mixer/functional_component/scorer/HeavyRankerScorer.scala",
    ],
    impact: "high",
    category: "ランキング",
  },
  {
    id: "8",
    date: "2024-08-15",
    title: "TweepCred計算式改良",
    description:
      "フォロー/フォロワー比率によるペナルティ計算の精度が向上。Reputation.scalaのadjustReputationsPostCalculation関数が改善され、フォロー数が極端に多いアカウントへのスコアリングがより適切に。大量フォローによるクレデンシャルスコアの水増しが困難になりました。",
    type: "improvement",
    commitHash: "5c9b1f24",
    files: [
      "src/scala/com/twitter/graph/batch/job/tweepcred/Reputation.scala",
      "src/scala/com/twitter/graph/batch/job/tweepcred/TweepCred.scala",
    ],
    impact: "medium",
    category: "TweepCred",
  },
  {
    id: "9",
    date: "2024-05-01",
    title: "Trust & Safety強化",
    description:
      "Visibility Filteringの精度が向上。新たにAuthor Diversity（著者多様性）、Content Balance（コンテンツバランス）、Feedback Fatigue（フィードバック疲労）フィルターが追加され、タイムラインの健全性が改善。特定の著者やトピックへの偏りを抑制します。",
    type: "improvement",
    commitHash: "e6f28a93",
    files: [
      "visibilitylib/src/main/scala/com/twitter/visibility/rules/AuthorDiversityRule.scala",
      "visibilitylib/src/main/scala/com/twitter/visibility/rules/ContentBalanceRule.scala",
      "visibilitylib/src/main/scala/com/twitter/visibility/rules/FeedbackFatigueRule.scala",
    ],
    impact: "medium",
    category: "フィルタリング",
  },
  {
    id: "10",
    date: "2023-03-31",
    title: "アルゴリズムオープンソース化",
    description:
      "GitHubにてtwitter/the-algorithmリポジトリを公開。Heavy Ranker、TweepCred、SimClustersなどの主要コンポーネントのソースコードが閲覧可能になりました。推薦アルゴリズムの透明性が大幅に向上し、外部研究者や開発者によるアルゴリズムの分析・検証が可能に。",
    type: "feature",
    commitHash: "d0c1e2f3",
    files: [
      "home-mixer/server/src/main/scala/com/twitter/home_mixer/",
      "src/scala/com/twitter/graph/batch/job/tweepcred/Reputation.scala",
      "src/scala/com/twitter/simclusters_v2/",
      "visibilitylib/",
    ],
    impact: "high",
    category: "オープンソース",
  },
];

const categoryIcons: Record<string, typeof Zap> = {
  "API": Code,
  "ランキング": TrendingUp,
  "AI": Zap,
  "候補取得": GitBranch,
  "SimClusters": Users,
  "TweepCred": Zap,
  "フィルタリング": Shield,
  "オープンソース": FileCode,
};

const typeConfig: Record<UpdateType, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  feature: { label: "新機能", color: "bg-primary/20 text-primary border-primary/50", icon: Zap },
  fix: { label: "修正", color: "bg-orange-500/20 text-orange-500 border-orange-500/50", icon: AlertCircle },
  improvement: { label: "改善", color: "bg-[#00ba7c]/20 text-[#00ba7c] border-[#00ba7c]/50", icon: TrendingUp },
  breaking: { label: "破壊的変更", color: "bg-destructive/20 text-destructive border-destructive/50", icon: AlertCircle },
};

const impactConfig: Record<string, { label: string; color: string }> = {
  high: { label: "影響度: 高", color: "text-destructive" },
  medium: { label: "影響度: 中", color: "text-orange-500" },
  low: { label: "影響度: 低", color: "text-muted-foreground" },
};

export default function UpdatesPage() {
  const [selectedType, setSelectedType] = useState<UpdateType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredUpdates = updates.filter((update) => {
    const matchesType = selectedType === "all" || update.type === selectedType;
    const matchesSearch = update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const groupedUpdates = filteredUpdates.reduce((acc, update) => {
    const month = update.date.substring(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(update);
    return acc;
  }, {} as Record<string, Update[]>);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            アルゴリズム更新履歴
          </h1>
          <p className="mt-1 text-muted-foreground">
            GitHubリポジトリの変更を追跡し、最新のアップデートを確認
          </p>
        </div>
        <Button variant="outline" className="bg-transparent">
          <Bell className="h-4 w-4 mr-2" />
          更新通知を設定
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <GitCommit className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-xs text-muted-foreground">総コミット数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00ba7c]/20">
                <Zap className="h-5 w-5 text-[#00ba7c]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">23</p>
                <p className="text-xs text-muted-foreground">新機能</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground">破壊的変更</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3日前</p>
                <p className="text-xs text-muted-foreground">最終更新</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="更新を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            size="sm"
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
            className={selectedType === "all" ? "" : "bg-transparent"}
          >
            すべて
          </Button>
          {(Object.keys(typeConfig) as UpdateType[]).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? "" : "bg-transparent"}
            >
              {typeConfig[type].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedUpdates).map(([month, monthUpdates]) => (
          <div key={month}>
            {/* Month Header */}
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                {new Date(month + "-01").toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                })}
              </h2>
              <Badge variant="secondary" className="bg-muted">
                {monthUpdates.length}件
              </Badge>
            </div>

            {/* Updates */}
            <div className="relative ml-2 border-l-2 border-border pl-6 space-y-4">
              {monthUpdates.map((update) => {
                const TypeIcon = typeConfig[update.type].icon;
                const CategoryIcon = categoryIcons[update.category] || Code;
                const isExpanded = expandedId === update.id;

                return (
                  <TimelineItem key={update.id}>
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-background",
                      update.type === "breaking" ? "bg-destructive" :
                      update.type === "feature" ? "bg-primary" :
                      update.type === "fix" ? "bg-orange-500" : "bg-[#00ba7c]"
                    )}>
                      <GitCommit className="h-3 w-3 text-white" />
                    </div>

                    {/* Update Card */}
                    <Card
                      className={cn(
                        "glass transition-all cursor-pointer",
                        isExpanded && "ring-1 ring-primary/50"
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : update.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className={typeConfig[update.type].color}
                              >
                                <TypeIcon className="h-3 w-3 mr-1" />
                                {typeConfig[update.type].label}
                              </Badge>
                              <Badge variant="secondary" className="bg-muted">
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {update.category}
                              </Badge>
                              <span className={cn(
                                "text-xs font-medium",
                                impactConfig[update.impact].color
                              )}>
                                {impactConfig[update.impact].label}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-semibold text-foreground">
                              {update.title}
                            </h3>

                            {/* Date & Commit */}
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(update.date).toLocaleDateString("ja-JP")}
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <GitCommit className="h-3 w-3" />
                                {update.commitHash}
                              </span>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="mt-4 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  {update.description}
                                </p>

                                <div>
                                  <h4 className="text-sm font-medium text-foreground mb-2">
                                    変更ファイル:
                                  </h4>
                                  <div className="flex flex-wrap gap-2 overflow-hidden">
                                    {update.files.map((file) => (
                                      <Badge
                                        key={file}
                                        variant="outline"
                                        className="font-mono text-xs bg-muted/50 max-w-full sm:max-w-[300px] truncate block"
                                      >
                                        <FileCode className="h-3 w-3 mr-1 shrink-0 inline" />
                                        <span className="truncate">{file}</span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent"
                                  asChild
                                >
                                  <a href="https://github.com/twitter/the-algorithm" target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  GitHubで見る
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>

                          <ChevronRight
                            className={cn(
                              "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TimelineItem>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* GitHub Link */}
      <Card className="glass border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                オープンソースリポジトリ
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                X(Twitter)のアルゴリズムはGitHubで公開されています
              </p>
            </div>
            <Button className="glow-primary" asChild>
              <a href="https://github.com/twitter/the-algorithm" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              GitHubで確認
              <ArrowUpRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
