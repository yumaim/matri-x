"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  MessageSquare,
  Shield,
  BookOpen,
  Loader2,
  RefreshCcw,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Zap,
  FileQuestion,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TabId = "topics" | "threads" | "moderation" | "knowledge";

interface TopicSuggestion {
  title: string;
  category: string;
  reason: string;
  template?: string;
}

interface StaleThread {
  id: string;
  title: string;
  category: string;
  author: string;
  voteScore: number;
  commentCount: number;
}

interface ThreadSuggestion {
  threadId: string;
  comment: string;
  approach: string;
}

interface FlaggedItem {
  index: number;
  type: string;
  id: string;
  title: string;
  text: string;
  author: string;
  spam: number;
  toxicity: number;
  quality: number;
  reason: string;
}

interface KnowledgeItem {
  title: string;
  summary: string;
  category: string;
  importance: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  ALGORITHM: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  VERIFICATION: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  STRATEGY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  UPDATES: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  QUESTIONS: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};

export default function AISuggestionsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("topics");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Topics tab data
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [communityInsights, setCommunityInsights] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    postsLast7Days: number;
    unansweredQuestions: number;
    topCategories: { category: string; count: number }[];
  } | null>(null);
  const [unansweredQuestions, setUnansweredQuestions] = useState<{ id: string; title: string }[]>([]);

  // Thread activator data
  const [staleThreads, setStaleThreads] = useState<StaleThread[]>([]);
  const [threadSuggestions, setThreadSuggestions] = useState<ThreadSuggestion[]>([]);

  // Moderation data
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([]);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);

  // Knowledge data
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);

  const [aiEnabled, setAiEnabled] = useState(true);

  const fetchData = useCallback(async (tab: TabId) => {
    setLoading(true);
    setError(null);

    try {
      const endpoints: Record<TabId, string> = {
        topics: "/api/admin/ai/topic-suggestions",
        threads: "/api/admin/ai/thread-activator",
        moderation: "/api/admin/ai/moderation",
        knowledge: "/api/admin/ai/knowledge-extract",
      };

      const res = await fetch(endpoints[tab]);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setAiEnabled(data.aiEnabled !== false);

      switch (tab) {
        case "topics":
          setSuggestions(data.suggestions || []);
          setTrendingTopics(data.trendingTopics || []);
          setCommunityInsights(data.communityInsights || "");
          setActionItems(data.actionItems || []);
          setStats(data.stats || null);
          setUnansweredQuestions(data.unansweredQuestions || []);
          break;
        case "threads":
          setStaleThreads(data.staleThreads || []);
          setThreadSuggestions(data.suggestions || []);
          break;
        case "moderation":
          setFlaggedItems(data.flagged || []);
          setTotalAnalyzed(data.totalAnalyzed || 0);
          break;
        case "knowledge":
          setKnowledgeItems(data.knowledgeItems || []);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  return (
    <div className="p-4 lg:p-8 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-violet-500/10 via-card/60 to-primary/10 p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Sparkles className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">AI アシスタント</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AIによるフォーラム成長分析・モデレーション支援
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() => fetchData(activeTab)}
            disabled={loading}
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            更新
          </Button>
        </div>
      </div>

      {!aiEnabled && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">Gemini API キーが未設定です</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                .env に GEMINI_API_KEY を設定すると AI 分析が有効になります。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto sm:grid sm:w-full sm:grid-cols-4 bg-muted/30 p-1 rounded-lg gap-1">
            {[
              { id: "topics" as const, label: "トピック提案", icon: TrendingUp },
              { id: "threads" as const, label: "スレ活性化", icon: MessageSquare },
              { id: "moderation" as const, label: "モデレーション", icon: Shield },
              { id: "knowledge" as const, label: "ナレッジ化", icon: BookOpen },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="text-[11px] sm:text-sm gap-1.5 px-3 py-2 whitespace-nowrap data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-400 rounded-md"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              <p className="text-sm text-muted-foreground">AI が分析中...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="mt-4 border-destructive/30">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => fetchData(activeTab)}
              >
                再試行
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ─── Topics Tab ─── */}
            <TabsContent value="topics" className="mt-4 space-y-4">
              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="glass">
                    <CardContent className="p-3 text-center">
                      <p className="text-xl font-bold text-primary tabular-nums">{stats.postsLast7Days}</p>
                      <p className="text-xs text-muted-foreground">7日間の投稿</p>
                    </CardContent>
                  </Card>
                  <Card className="glass">
                    <CardContent className="p-3 text-center">
                      <p className="text-xl font-bold text-amber-400 tabular-nums">{stats.unansweredQuestions}</p>
                      <p className="text-xs text-muted-foreground">未回答質問</p>
                    </CardContent>
                  </Card>
                  {stats.topCategories.slice(0, 2).map((cat) => (
                    <Card key={cat.category} className="glass">
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold tabular-nums">{cat.count}</p>
                        <p className="text-xs text-muted-foreground">{cat.category}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Community Insights */}
              {communityInsights && (
                <Card className="glass border-violet-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm mb-1">コミュニティ分析</h3>
                        <p className="text-sm text-muted-foreground">{communityInsights}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trending Topics */}
              {trendingTopics.length > 0 && (
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      トレンドトピック
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.map((topic) => (
                        <Badge key={topic} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggested Posts */}
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-violet-400" />
                    推奨投稿
                  </h3>
                  {suggestions.map((s, i) => (
                    <Card key={i} className="glass hover:border-primary/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={cn("text-xs", CATEGORY_COLORS[s.category])}>
                                {s.category}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm">{s.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                          </div>
                          {s.template && (
                            <Link
                              href={`/dashboard/forum/new?category=${s.category}&title=${encodeURIComponent(s.title)}&template=${encodeURIComponent(s.template)}`}
                            >
                              <Button size="sm" variant="outline" className="gap-1 shrink-0">
                                <ArrowRight className="h-3.5 w-3.5" />
                                投稿
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Unanswered Questions */}
              {unansweredQuestions.length > 0 && (
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-amber-400" />
                      未回答の質問
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {unansweredQuestions.map((q) => (
                      <Link key={q.id} href={`/dashboard/forum/${q.id}`} className="block">
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                          <span className="text-sm text-foreground hover:text-primary transition-colors line-clamp-1">
                            {q.title}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 ml-auto" />
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Action Items */}
              {actionItems.length > 0 && (
                <Card className="glass border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">推奨アクション</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1.5">
                      {actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ─── Threads Tab ─── */}
            <TabsContent value="threads" className="mt-4 space-y-4">
              {staleThreads.length === 0 ? (
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">放置スレッドはありません</p>
                    <p className="text-xs text-muted-foreground mt-1">フォーラムは活発に運営されています！</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {staleThreads.map((thread, i) => {
                    const suggestion = threadSuggestions[i];
                    return (
                      <Card key={thread.id} className="glass hover:border-primary/30 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <Badge variant="outline" className={cn("text-xs mb-1", CATEGORY_COLORS[thread.category])}>
                                {thread.category}
                              </Badge>
                              <h4 className="font-medium text-sm">{thread.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                by {thread.author} · {thread.commentCount}コメント · {thread.voteScore}票
                              </p>
                              {suggestion && (
                                <div className="mt-2 p-2 rounded-md bg-muted/30 border border-border/30">
                                  <p className="text-xs text-muted-foreground">
                                    💡 AI提案: {suggestion.comment}
                                  </p>
                                </div>
                              )}
                            </div>
                            <Link href={`/dashboard/forum/${thread.id}`}>
                              <Button size="sm" variant="outline" className="gap-1 shrink-0">
                                <ArrowRight className="h-3.5 w-3.5" />
                                確認
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ─── Moderation Tab ─── */}
            <TabsContent value="moderation" className="mt-4 space-y-4">
              <Card className="glass">
                <CardContent className="p-4 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-400 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {totalAnalyzed}件のコンテンツを分析 · {flaggedItems.length}件がフラグ付き
                  </p>
                </CardContent>
              </Card>
              {flaggedItems.length === 0 ? (
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <Shield className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">問題のあるコンテンツは検出されませんでした</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {flaggedItems.map((item, i) => (
                    <Card key={i} className="glass border-amber-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">{item.type}</Badge>
                              <span className="text-xs text-muted-foreground">by {item.author}</span>
                            </div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.text}</p>
                            <div className="flex gap-3 mt-2 text-xs">
                              <span className={cn(item.spam > 5 ? "text-red-400" : "text-muted-foreground")}>
                                スパム: {item.spam}/10
                              </span>
                              <span className={cn(item.toxicity > 5 ? "text-red-400" : "text-muted-foreground")}>
                                有害性: {item.toxicity}/10
                              </span>
                              <span className={cn(item.quality < 3 ? "text-amber-400" : "text-muted-foreground")}>
                                品質: {item.quality}/10
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── Knowledge Tab ─── */}
            <TabsContent value="knowledge" className="mt-4 space-y-4">
              {knowledgeItems.length === 0 ? (
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">ナレッジ候補がありません</p>
                    <p className="text-xs text-muted-foreground mt-1">高評価スレッドが増えると、自動的にナレッジ候補が提案されます。</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {knowledgeItems.map((item, i) => (
                    <Card key={i} className="glass hover:border-primary/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{item.title}</h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  item.importance === "high"
                                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                                    : item.importance === "medium"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                      : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                )}
                              >
                                {item.importance}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.summary}</p>
                            <Badge variant="outline" className={cn("text-[10px] mt-2", CATEGORY_COLORS[item.category])}>
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
