"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Send,
  Bot,
  User,
  Sparkles,
  Code,
  FileCode,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeBlocks?: { language: string; code: string; file?: string }[];
  sources?: { title: string; path: string }[];
}

const suggestedQuestions = [
  "TweepCredスコアはどのように計算されますか？",
  "SimClustersの仕組みを教えてください",
  "リプライの重み付け150xはどこで定義されていますか？",
  "Out-of-Network推薦の候補取得ロジックは？",
  "Heavy Rankerモデルの入力特徴量は何ですか？",
  "Trust & Safetyフィルターの実装を見せてください",
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "こんにちは！私はXアルゴリズムに特化したAIアシスタントです。オープンソース化されたX(旧Twitter)の推薦アルゴリズムについて何でも質問してください。ソースコードの解説、実装の詳細、最適化戦略についてお答えします。",
  },
];

const mockResponses: Record<string, Message> = {
  "TweepCredスコアはどのように計算されますか？": {
    id: "mock-1",
    role: "assistant",
    content: `TweepCredスコアは、ユーザーの信頼度を表すスコアで、PageRankアルゴリズムをベースに計算されます。主な要素は以下の通りです：

**1. フォロワー/フォロー比率**
- フォロワー数とフォロー数の比率が考慮されます
- 比率が高いほど信頼度が高いとみなされます

**2. エンゲージメント品質**
- 受け取るエンゲージメントの質と量
- 特にリプライが重視されます

**3. アカウント年齢**
- 90日未満のアカウントにはペナルティが適用されます
- 長期間アクティブなアカウントほど有利

**4. アクティブフォロワー比率**
- 90日以内にアクティブなフォロワーの割合
- 非アクティブなフォロワーは除外されます`,
    codeBlocks: [
      {
        language: "scala",
        file: "src/scala/com/twitter/simclusters_v2/tweepcred/TweepCred.scala",
        code: `object TweepCred {
  def computeScore(
    followers: Long,
    following: Long,
    engagementRate: Double,
    accountAgeDays: Int,
    activeFollowerRatio: Double
  ): Double = {
    val ffRatio = math.min(followers.toDouble / math.max(following, 1), 10.0) / 10.0
    val ageBonus = math.min(accountAgeDays / 365.0, 1.0) * 0.2
    val agePenalty = if (accountAgeDays < 90) 0.3 else 0.0
    
    (ffRatio * 0.3) + (engagementRate * 0.3) + ageBonus + (activeFollowerRatio * 0.2) - agePenalty
  }
}`,
      },
    ],
    sources: [
      { title: "TweepCred.scala", path: "src/scala/com/twitter/simclusters_v2/tweepcred/" },
      { title: "PageRank Implementation", path: "src/scala/com/twitter/graph/" },
    ],
  },
  "リプライの重み付け150xはどこで定義されていますか？": {
    id: "mock-2",
    role: "assistant",
    content: `リプライの重み付け係数は、Heavy Rankerの設定ファイルで定義されています。具体的には、著者とのリプライの組み合わせが150xという最高の重み付けを持ちます。

**重み付けの内訳：**
- リプライ単体: 約50x
- 著者からの返信: 約100x
- 合計: 150x

この設計は、双方向のコミュニケーションを促進するためのものです。`,
    codeBlocks: [
      {
        language: "python",
        file: "home-mixer/server/src/main/scala/com/twitter/home_mixer/functional_component/scorer/",
        code: `# Engagement weights configuration
ENGAGEMENT_WEIGHTS = {
    "reply": 50.0,
    "reply_engaged_by_author": 100.0,  # Combined = 150x
    "favorite": 30.0,
    "retweet": 20.0,
    "profile_click": 12.0,
    "detail_expand": 11.0,
    "dwell_time_gt_2min": 10.0,
}`,
      },
    ],
    sources: [
      { title: "Scoring Configuration", path: "home-mixer/server/src/main/scala/" },
      { title: "Heavy Ranker Model", path: "src/python/twitter/deepbird/" },
    ],
  },
};

export default function DeepWikiPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockResponse = mockResponses[question] || {
      id: Date.now().toString() + "-response",
      role: "assistant" as const,
      content: `「${question}」についてお答えします。

Xの推薦アルゴリズムは複雑なシステムですが、ご質問の内容に関連する主要なポイントをお伝えします。

詳細については、GitHubリポジトリのソースコードを直接確認することをお勧めします。また、シミュレーターページでインタラクティブに学ぶこともできます。

他にご質問があればお気軽にどうぞ！`,
    };

    setMessages((prev) => [...prev, mockResponse]);
    setIsLoading(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col p-6 lg:h-screen lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          DeepWiki AI検索
        </h1>
        <p className="mt-1 text-muted-foreground">
          Xアルゴリズムのソースコードについて何でも質問してください
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Card className="glass flex flex-1 flex-col overflow-hidden">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-primary" />
                AI アシスタント
                <Badge variant="secondary" className="ml-2">
                  Pro: 47/50 回
                </Badge>
              </CardTitle>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        message.role === "user"
                          ? "bg-primary"
                          : "bg-accent"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <Sparkles className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex-1 space-y-4",
                        message.role === "user" && "text-right"
                      )}
                    >
                      <div
                        className={cn(
                          "inline-block rounded-2xl px-4 py-3 text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>

                      {/* Code Blocks */}
                      {message.codeBlocks?.map((block, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-border bg-background overflow-hidden"
                        >
                          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {block.file || block.language}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyCode(block.code)}
                            >
                              {copiedCode === block.code ? (
                                <Check className="h-3 w-3 text-[#00ba7c]" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <pre className="overflow-x-auto p-4 text-xs">
                            <code className="text-muted-foreground">
                              {block.code}
                            </code>
                          </pre>
                        </div>
                      ))}

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.sources.map((source, index) => (
                            <a
                              key={index}
                              href="#"
                              className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                            >
                              <Code className="h-3 w-3" />
                              {source.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading State */}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        考え中...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(input);
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="アルゴリズムについて質問してください..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-full space-y-6 lg:w-80">
          {/* Suggested Questions */}
          <Card className="glass">
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                おすすめの質問
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(question)}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-muted/50 p-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Usage Info */}
          <Card className="glass border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Search className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    検索のヒント
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>・具体的な機能名で質問</li>
                    <li>・「〜のコードを見せて」形式が効果的</li>
                    <li>・比較質問も対応可能</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
