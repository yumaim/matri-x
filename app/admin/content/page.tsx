"use client";

import React, { useEffect, useState } from "react";
import { Plus, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface AlgorithmUpdate {
  id: string;
  title: string;
  description: string;
  source: string | null;
  impact: string;
  category: string;
  publishedAt: string;
}

const impactColors: Record<string, string> = {
  CRITICAL: "destructive",
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

export default function AdminContentPage() {
  const [updates, setUpdates] = useState<AlgorithmUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", source: "", impact: "MEDIUM", category: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUpdates = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/content");
    const data = await res.json();
    setUpdates(data.updates || []);
    setLoading(false);
  };

  useEffect(() => { fetchUpdates(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", source: "", impact: "MEDIUM", category: "" });
    setDialogOpen(false);
    setSubmitting(false);
    fetchUpdates();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{updates.length} 件のアップデート</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />新規作成</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>アルゴリズムアップデートを追加</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>タイトル *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label>説明 *</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required />
              </div>
              <div>
                <Label>ソースURL</Label>
                <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="https://github.com/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>影響度 *</Label>
                  <Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      <SelectItem value="HIGH">HIGH</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                      <SelectItem value="LOW">LOW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>カテゴリ *</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ranking, TweepCred..." required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "保存中..." : "保存"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-12 bg-muted rounded" /></CardContent></Card>)}</div>
      ) : updates.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">アップデートがありません</p>
      ) : (
        <div className="space-y-3">
          {updates.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{u.title}</h3>
                      <Badge variant={impactColors[u.impact] as any} className="text-xs">{u.impact}</Badge>
                      <Badge variant="outline" className="text-xs">{u.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{u.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(u.publishedAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                  {u.source && (
                    <a href={u.source} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
