"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const IMPACTS = [
  { value: "LOW", label: "🟢 軽微", color: "border-emerald-500/30 bg-emerald-500/10" },
  { value: "MEDIUM", label: "🟡 注意", color: "border-yellow-500/30 bg-yellow-500/10" },
  { value: "HIGH", label: "🟠 重要", color: "border-orange-500/30 bg-orange-500/10" },
  { value: "CRITICAL", label: "🔴 緊急", color: "border-red-500/30 bg-red-500/10" },
];

export default function AdminUpdatesPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [impact, setImpact] = useState("MEDIUM");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError("タイトルと説明を入力してください");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/architect/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, source: source || undefined, impact, category: category || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSuccess(true);
      setTitle(""); setDescription(""); setSource(""); setCategory("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "送信に失敗しました");
    }
    setSubmitting(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Bell className="h-5 w-5 text-red-400" />
        アルゴリズム更新通知
      </h1>
      <p className="text-sm text-muted-foreground">
        新しいアルゴリズム更新を作成すると、全ユーザーに通知が送信されます。
      </p>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-emerald-400 text-sm">
          <CheckCircle2 className="h-4 w-4" /> 更新を投稿し、全ユーザーに通知しました！
        </div>
      )}

      <Card className="bg-card/50">
        <CardHeader><CardTitle className="text-lg">新しい更新を作成</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>影響度</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {IMPACTS.map((i) => (
                <button
                  key={i.value}
                  onClick={() => setImpact(i.value)}
                  aria-pressed={impact === i.value}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm transition-all",
                    impact === i.value ? `${i.color} font-medium` : "border-border hover:border-primary/50"
                  )}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-title">タイトル</Label>
            <Input id="update-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: ランキングアルゴリズム変更" maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-desc">説明</Label>
            <Textarea id="update-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="変更内容の詳細..." rows={6} maxLength={5000} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="update-source">ソース（任意）</Label>
              <Input id="update-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="URL or 出典" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-category">カテゴリ（任意）</Label>
              <Input id="update-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="例: ランキング" />
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            {submitting ? "送信中..." : "更新を投稿＆全ユーザーに通知"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
