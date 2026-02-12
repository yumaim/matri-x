"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TicketPlus, Loader2, MessageSquare, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
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
  user: { id: string; name: string | null; email: string | null; image: string | null };
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "受付中", icon: Clock, color: "text-blue-400" },
  { value: "IN_PROGRESS", label: "対応中", icon: Loader2, color: "text-yellow-400" },
  { value: "RESOLVED", label: "解決済み", icon: CheckCircle2, color: "text-emerald-400" },
  { value: "CLOSED", label: "クローズ", icon: XCircle, color: "text-muted-foreground" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  FEATURE_REQUEST: "🆕", BUG_REPORT: "🐛", IMPROVEMENT: "✨", OTHER: "📝",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const url = filter ? `/api/architect/tickets?status=${filter}` : "/api/architect/tickets";
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch { /* */ }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const updateTicket = async (ticketId: string, updates: Record<string, string | undefined>) => {
    setActionLoading(ticketId);
    try {
      const res = await fetch("/api/architect/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, ...updates }),
      });
      if (res.ok) {
        fetchTickets();
        setReplyingTo(null);
        setReplyText("");
      }
    } catch { /* */ }
    setActionLoading(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <TicketPlus className="h-5 w-5 text-orange-400" />
        チケット管理
      </h1>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={filter === "" ? "default" : "outline"} onClick={() => setFilter("")}>すべて</Button>
        {STATUS_OPTIONS.map((s) => (
          <Button key={s.value} size="sm" variant={filter === s.value ? "default" : "outline"} onClick={() => setFilter(s.value)} className="gap-1">
            <s.icon className={cn("h-3 w-3", s.color)} />
            {s.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">チケットがありません</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card key={t.id} className="bg-card/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{CATEGORY_EMOJI[t.category] ?? "📝"}</span>
                      <h3 className="font-medium text-sm">{t.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>by {t.user.name ?? t.user.email}</span>
                      <span>{formatDate(t.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center shrink-0">
                    <select
                      className="text-xs bg-background border border-border rounded px-2 py-1"
                      value={t.status}
                      onChange={(e) => updateTicket(t.id, { status: e.target.value })}
                      disabled={actionLoading === t.id}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {t.adminNote && (
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                    <p className="text-xs text-primary font-medium mb-1">💬 返信:</p>
                    <p className="text-sm">{t.adminNote}</p>
                  </div>
                )}

                {replyingTo === t.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="ユーザーへの返信を入力..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateTicket(t.id, { adminNote: replyText })}
                        disabled={!replyText.trim() || actionLoading === t.id}
                      >
                        送信
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm" variant="outline"
                    onClick={() => { setReplyingTo(t.id); setReplyText(t.adminNote ?? ""); }}
                    className="gap-1 text-xs"
                  >
                    <MessageSquare className="h-3 w-3" />
                    {t.adminNote ? "返信を編集" : "返信する"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
