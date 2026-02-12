"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCcw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  database: { status: string; latencyMs: number };
  memory: { heapUsedMB: number; heapTotalMB: number; rssMB: number };
  runtime: { nodeVersion: string; platform: string };
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/architect/health");
      if (res.ok) setHealth(await res.json());
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchHealth(); }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}時間 ${m}分`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          ヘルスチェック
        </h1>
        <Button size="sm" variant="outline" onClick={fetchHealth} disabled={loading} className="gap-1">
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          更新
        </Button>
      </div>

      {loading && !health ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !health ? (
        <div className="text-center py-12 text-red-400">ヘルスデータの取得に失敗しました</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-card/50">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">全体ステータス</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {health.status === "healthy" ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-400" />
                )}
                <div>
                  <p className="text-xl font-bold">{health.status === "healthy" ? "正常" : "異常"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(health.timestamp).toLocaleString("ja-JP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">データベース</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {health.database.status === "OK" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400" />
                )}
                <div>
                  <p className="font-medium">{health.database.status}</p>
                  <p className="text-xs text-muted-foreground">レイテンシ: {health.database.latencyMs}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">メモリ</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Heap使用</span>
                <span>{health.memory.heapUsedMB} / {health.memory.heapTotalMB} MB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, (health.memory.heapUsedMB / health.memory.heapTotalMB) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">RSS</span>
                <span>{health.memory.rssMB} MB</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">ランタイム</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">稼働時間</span>
                <span>{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Node.js</span>
                <span>{health.runtime.nodeVersion}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">プラットフォーム</span>
                <span>{health.runtime.platform}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
