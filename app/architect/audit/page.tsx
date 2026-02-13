"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  details: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  BAN: { label: "BAN", color: "bg-red-500/10 text-red-400 border-red-500/30" },
  UNBAN: { label: "BAN解除", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  CHANGE_ROLE: { label: "ロール変更", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  CHANGE_PLAN: { label: "プラン変更", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  UPDATE_TICKET: { label: "チケット更新", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  CREATE_UPDATE: { label: "更新作成", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  DELETE_UPDATE: { label: "更新削除", color: "bg-red-500/10 text-red-400 border-red-500/30" },
  UPDATE_POST: { label: "投稿操作", color: "bg-muted text-muted-foreground border-border" },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filter) params.set("action", filter);
    try {
      const res = await fetch(`/api/architect/audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch { /* */ }
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const allActions = Object.keys(ACTION_LABELS);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <ScrollText className="h-5 w-5 text-amber-400" />
        監査ログ <span className="text-sm text-muted-foreground font-normal">({total}件)</span>
      </h1>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={filter === "" ? "default" : "outline"} onClick={() => { setFilter(""); setPage(1); }}>
          すべて
        </Button>
        {allActions.map((a) => (
          <Button
            key={a} size="sm"
            variant={filter === a ? "default" : "outline"}
            onClick={() => { setFilter(a); setPage(1); }}
            className="text-xs"
          >
            {ACTION_LABELS[a].label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">監査ログがありません</div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const actionInfo = ACTION_LABELS[log.action] ?? { label: log.action, color: "bg-muted text-muted-foreground border-border" };
            return (
              <Card key={log.id} className="bg-card/50">
                <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(log.createdAt)}</span>
                  <Badge variant="outline" className={cn("text-xs", actionInfo.color)}>{actionInfo.label}</Badge>
                  <span className="text-sm font-medium">{log.actorName}</span>
                  {log.details && <span className="text-sm text-muted-foreground flex-1">— {log.details}</span>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
