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
  relatedQuestions?: string[];
}

const suggestedQuestions = [
  "TweepCredスコアはどのように計算されますか？",
  "SimClustersの仕組みを教えてください",
  "エンゲージメント重み付けについて教えてください",
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

    try {
      const allMessages = [...messages, userMessage];
      const res = await fetch("/api/deepwiki/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: Date.now().toString() + "-response",
        role: "assistant",
        content: data.message.content,
        codeBlocks: data.message.codeBlocks,
        sources: data.message.sources,
        relatedQuestions: data.message.relatedQuestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        role: "assistant",
        content: "エラーが発生しました。もう一度お試しください。",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
                  ナレッジベース検索
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

                      {/* Related Questions */}
                      {message.relatedQuestions && message.relatedQuestions.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground font-medium">
                            関連する質問:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.relatedQuestions.map((q, index) => (
                              <button
                                key={index}
                                onClick={() => handleSubmit(q)}
                                disabled={isLoading}
                                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
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
                        検索中...
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
