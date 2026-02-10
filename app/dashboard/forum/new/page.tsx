"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Eye,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "ALGORITHM", label: "アルゴリズム解説" },
  { value: "VERIFICATION", label: "現場検証" },
  { value: "STRATEGY", label: "戦略・Tips" },
  { value: "UPDATES", label: "最新アップデート" },
  { value: "QUESTIONS", label: "質問・相談" },
];

export default function NewPostPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("edit");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (title.trim().length < 3) errs.title = "タイトルは3文字以上で入力してください";
    if (title.length > 200) errs.title = "タイトルは200文字以内で入力してください";
    if (content.trim().length < 10) errs.content = "内容は10文字以上で入力してください";
    if (!category) errs.category = "カテゴリを選択してください";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content,
            category,
            tags: [],
            status: "PUBLISHED",
          }),
        });

        if (res.ok) {
          const post = await res.json();
          router.push(`/dashboard/forum/${post.id}`);
        } else {
          const data = await res.json();
          setErrors({ submit: data.error || "投稿の作成に失敗しました" });
        }
      } catch {
        setErrors({ submit: "投稿の作成に失敗しました" });
      }
    });
  };

  const handleSaveDraft = () => {
    if (title.trim().length < 3) {
      setErrors({ title: "タイトルは3文字以上で入力してください" });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content || " ",
            category: category || "QUESTIONS",
            tags: [],
            status: "DRAFT",
          }),
        });

        if (res.ok) {
          router.push("/dashboard/forum");
        }
      } catch {
        setErrors({ submit: "下書き保存に失敗しました" });
      }
    });
  };

  // Simple markdown preview
  const renderPreview = () => {
    if (!content.trim()) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          プレビューする内容がありません
        </div>
      );
    }

    const lines = content.split("\n");
    return (
      <div className="prose prose-sm prose-invert max-w-none space-y-2">
        {lines.map((line, i) => {
          if (line.startsWith("### "))
            return <h4 key={i} className="font-semibold text-foreground mt-4 mb-2">{line.slice(4)}</h4>;
          if (line.startsWith("## "))
            return <h3 key={i} className="font-bold text-lg text-foreground mt-6 mb-2">{line.slice(3)}</h3>;
          if (line.startsWith("# "))
            return <h2 key={i} className="font-bold text-xl text-foreground mt-6 mb-3">{line.slice(2)}</h2>;
          if (line.startsWith("```"))
            return <div key={i} className="bg-muted/50 rounded p-3 font-mono text-xs" />;
          if (line.match(/^[-*] /))
            return <li key={i} className="ml-4 list-disc text-foreground/90">{line.slice(2)}</li>;
          if (!line.trim()) return <br key={i} />;
          return <p key={i} className="text-foreground/90 leading-relaxed">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto overflow-x-hidden">
      {/* Back button */}
      <Link
        href="/dashboard/forum"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        フォーラムに戻る
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">新規投稿</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          コミュニティにあなたの知見や質問を共有しましょう
        </p>
      </div>

      {errors.submit && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      <div className="space-y-6">
        {/* Title & Category */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Category */}
            <div>
              <Label className="text-sm font-medium">カテゴリ</Label>
              <Select
                value={category}
                onValueChange={(val) => {
                  setCategory(val);
                  setErrors((e) => { const { category: _, ...rest } = e; return rest; });
                }}
              >
                <SelectTrigger className={cn("mt-1.5 bg-muted/30 border-border/50", errors.category && "border-destructive")}>
                  <SelectValue placeholder="カテゴリを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive mt-1">{errors.category}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                タイトル
              </Label>
              <Input
                id="title"
                placeholder="投稿のタイトルを入力..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((err) => { const { title: _, ...rest } = err; return rest; });
                }}
                className={cn(
                  "mt-1.5 bg-muted/30 border-border/50 text-base",
                  errors.title && "border-destructive"
                )}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1">{errors.title}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {title.length}/200
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-muted/30">
                  <TabsTrigger value="edit">編集</TabsTrigger>
                  <TabsTrigger value="preview" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    プレビュー
                  </TabsTrigger>
                </TabsList>
                <p className="text-xs text-muted-foreground">
                  Markdownをサポート
                </p>
              </div>

              <TabsContent value="edit" className="mt-0">
                <Textarea
                  placeholder="投稿の内容を入力...&#10;&#10;Markdownがサポートされています:&#10;# 見出し&#10;## 小見出し&#10;- リスト項目&#10;**太字** *斜体*"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errors.content) setErrors((err) => { const { content: _, ...rest } = err; return rest; });
                  }}
                  className={cn(
                    "min-h-[300px] bg-muted/30 border-border/50 resize-y font-mono text-sm",
                    errors.content && "border-destructive"
                  )}
                />
                {errors.content && (
                  <p className="text-xs text-destructive mt-1">{errors.content}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {content.length}文字
                </p>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="min-h-[300px] bg-muted/10 rounded-lg p-4 border border-border/30">
                  {renderPreview()}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={handleSaveDraft}
            disabled={isPending}
          >
            下書き保存
          </Button>
          <Button
            className="gap-2 min-w-[120px]"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            投稿する
          </Button>
        </div>
      </div>
    </div>
  );
}
