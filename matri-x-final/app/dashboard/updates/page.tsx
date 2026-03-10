"use client";

import { useState } from "react";
import {
  History,
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
  Filter,
  Search,
  Bell,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Shield,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    date: "2026-02-03",
    title: "SimClustersのクラスタリング精度向上",
    description: "興味関心クラスタリングアルゴリズムの精度が改善され、より正確なおすすめが表示されるようになりました。特にニッチな興味関心への対応が強化されています。",
    type: "improvement",
    commitHash: "a1b2c3d",
    files: ["simclusters/clustering.py", "simclusters/embeddings.py"],
    impact: "high",
    category: "SimClusters",
  },
  {
    id: "2",
    date: "2026-01-28",
    title: "リプライの重み付け調整",
    description: "リプライ+著者リプライの重み付けが140xから150xに引き上げられました。より双方向のコミュニケーションが評価されます。",
    type: "feature",
    commitHash: "e4f5g6h",
    files: ["ranking/heavy_ranker.py", "config/weights.yaml"],
    impact: "high",
    category: "ランキング",
  },
  {
    id: "3",
    date: "2026-01-20",
    title: "TweepCredの計算ロジック修正",
    description: "フォロワー/フォロー比率の計算において、新規アカウントに対するペナルティが緩和されました。",
    type: "fix",
    commitHash: "i7j8k9l",
    files: ["tweepcred/score.py"],
    impact: "medium",
    category: "TweepCred",
  },
  {
    id: "4",
    date: "2026-01-15",
    title: "Out-of-Network比率の調整",
    description: "タイムラインにおけるOut-of-Networkコンテンツの比率が48%から50%に引き上げられました。",
    type: "improvement",
    commitHash: "m0n1o2p",
    files: ["pipeline/mixer.py", "config/timeline.yaml"],
    impact: "medium",
    category: "パイプライン",
  },
  {
    id: "5",
    date: "2026-01-10",
    title: "スパムフィルターの強化",
    description: "Trust & Safetyフィルターが更新され、新しいスパムパターンへの対応が追加されました。",
    type: "feature",
    commitHash: "q3r4s5t",
    files: ["trust_safety/spam_filter.py", "trust_safety/patterns.yaml"],
    impact: "low",
    category: "Trust & Safety",
  },
  {
    id: "6",
    date: "2026-01-05",
    title: "動画コンテンツのブースト係数変更",
    description: "動画コンテンツに対するブースト係数が1.8xから2.0xに変更されました。【破壊的変更】既存の動画戦略に影響する可能性があります。",
    type: "breaking",
    commitHash: "u6v7w8x",
    files: ["ranking/media_boost.py", "config/media.yaml"],
    impact: "high",
    category: "メディア",
  },
  {
    id: "7",
    date: "2025-12-28",
    title: "90日ルールの厳格化",
    description: "非アクティブアカウントの判定が85日から90日に統一されました。",
    type: "improvement",
    commitHash: "y9z0a1b",
    files: ["engagement/activity.py"],
    impact: "medium",
    category: "エンゲージメント",
  },
];

const categoryIcons: Record<string, typeof Zap> = {
  "SimClusters": Users,
  "ランキング": TrendingUp,
  "TweepCred": Zap,
  "パイプライン": GitBranch,
  "Trust & Safety": Shield,
  "メディア": FileCode,
  "エンゲージメント": TrendingUp,
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
    <div className="p-6 lg:p-8 space-y-8">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <div key={update.id} className="relative">
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
                                  <div className="flex flex-wrap gap-2">
                                    {update.files.map((file) => (
                                      <Badge
                                        key={file}
                                        variant="outline"
                                        className="font-mono text-xs bg-muted/50"
                                      >
                                        <FileCode className="h-3 w-3 mr-1" />
                                        {file}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  GitHubで見る
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
                  </div>
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
            <Button className="glow-primary">
              <ExternalLink className="h-4 w-4 mr-2" />
              GitHubで確認
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
