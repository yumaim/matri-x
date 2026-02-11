"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TicketPlus, Bug, Lightbulb, Sparkles, FileText, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-utils";

interface Ticket {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: "FEATURE_REQUEST", label: "🆕 新機能リクエスト", icon: Lightbulb, color: "text-blue-400" },
  { value: "BUG_REPORT", label: "🐛 バグ報告", icon: Bug, color: "text-red-400" },
  { value: "IMPROVEMENT", label: "✨ 改善提案", icon: Sparkles, color: "text-yellow-400" },
  { value: "OTHER", label: "📝 その他", icon: FileText, color: "text-muted-foreground" },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  OPEN: { label: "受付中", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: Clock },
  IN_PROGRESS: { label: "対応中", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: Loader2 },
  RESOLVED: { label: "解決済み", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  CLOSED: { label: "クローズ", color: "bg-muted text-muted-foreground border-border", icon: AlertCircle },
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("FEATURE_REQUEST");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError("タイトルと詳細を入力してください");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }
      setSuccess(true);
      setTitle("");
      setDescription("");
      setShowForm(false);
      fetchTickets();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TicketPlus className="h-6 w-6 text-primary" />
            開発チケット
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            アーリーアクセス限定 — 新機能リクエストや改善提案を開発チームに直接送れます
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
          variant={showForm ? "outline" : "default"}
        >
          <TicketPlus className="h-4 w-4" />
          {showForm ? "閉じる" : "チケット作成"}
        </Button>
      </div>

      {success && (
        <div role="status" aria-live="polite" className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-emerald-400 text-sm">
          ✅ チケットを送信しました！開発チームに通知されました。
        </div>
      )}

      {showForm && (
        <Card className="border-primary/30 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">新しいチケットを作成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>カテゴリ</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    aria-pressed={category === cat.value}
                    aria-label={cat.label}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-sm",
                      category === cat.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <cat.icon className={cn("h-5 w-5", category === cat.value ? "text-primary" : cat.color)} />
                    <span className="text-xs text-center">{cat.label.split(" ").slice(1).join(" ")}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-title">タイトル</Label>
              <Input
                id="ticket-title"
                placeholder="簡潔に要約してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-desc">詳細</Label>
              <Textarea
                id="ticket-desc"
                placeholder="具体的な内容、再現手順、期待する動作などを記入してください"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/5000</p>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-400">{error}</p>
            )}
            <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <TicketPlus className="h-4 w-4" />}
              {submitting ? "送信中..." : "チケットを送信"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ticket List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-muted-foreground">あなたのチケット ({tickets.length})</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TicketPlus className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">まだチケットはありません</p>
              <p className="text-xs mt-1">新機能リクエストやバグ報告をお待ちしています！</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => {
            const status = STATUS_MAP[ticket.status] || STATUS_MAP.OPEN;
            const cat = CATEGORIES.find((c) => c.value === ticket.category);
            const StatusIcon = status.icon;
            return (
              <Card key={ticket.id} className="bg-card/50 hover:bg-card/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {cat && <span className="text-sm">{cat.label.split(" ")[0]}</span>}
                        <h3 className="font-medium text-foreground">{ticket.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                      {ticket.adminNote && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-2 mt-2">
                          <p className="text-xs text-primary font-medium mb-0.5">💬 開発チームからの返信:</p>
                          <p className="text-sm text-foreground">{ticket.adminNote}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 gap-1", status.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
