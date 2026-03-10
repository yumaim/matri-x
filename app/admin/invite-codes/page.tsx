"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Trash2,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  description: string | null;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function InviteCodesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("10");
  const [newExpiresAt, setNewExpiresAt] = useState("2026-03-31");

  const fetchCodes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/invite-codes");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCodes(data.codes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/invite-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c))
      );
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この招待コードを削除しますか？")) return;
    try {
      const res = await fetch(`/api/admin/invite-codes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setCodes((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode || undefined,
          description: newDescription || undefined,
          maxUses: parseInt(newMaxUses) || 10,
          expiresAt: newExpiresAt || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create");
      }
      const data = await res.json();
      setCodes((prev) => [data.inviteCode, ...prev]);
      setShowCreate(false);
      setNewCode("");
      setNewDescription("");
      setNewMaxUses("10");
      setNewExpiresAt("2026-03-31");
    } catch (err) {
      alert(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setCreating(false);
    }
  };

  const activeCount = codes.filter((c) => c.isActive).length;
  const totalUsed = codes.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/10">
              <Ticket className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">総コード数</p>
              <p className="text-xl font-bold">
                {loading ? (
                  <Skeleton className="h-6 w-8 inline-block" />
                ) : (
                  codes.length
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-400/10">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">有効コード</p>
              <p className="text-xl font-bold">
                {loading ? (
                  <Skeleton className="h-6 w-8 inline-block" />
                ) : (
                  activeCount
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-400/10">
              <RefreshCw className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">総使用回数</p>
              <p className="text-xl font-bold">
                {loading ? (
                  <Skeleton className="h-6 w-8 inline-block" />
                ) : (
                  totalUsed
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">招待コード一覧</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCodes}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            更新
          </Button>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            新規作成
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="bg-card border-border border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">新しい招待コードを作成</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">
                    コード{" "}
                    <span className="text-muted-foreground font-normal">
                      (空欄で自動生成)
                    </span>
                  </Label>
                  <Input
                    id="code"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="例: MATRIXVIP"
                    className="uppercase tracking-widest font-mono"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">説明メモ</Label>
                  <Input
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="例: Twitter経由の初期ユーザー向け"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">最大使用回数</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">有効期限</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreate(false)}
                >
                  キャンセル
                </Button>
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      作成中...
                    </>
                  ) : (
                    "作成"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Code list */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : codes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                招待コードがまだありません
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                最初のコードを作成
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {codes.map((code) => {
                const isExpired =
                  code.expiresAt && new Date(code.expiresAt) < new Date();
                const isFull = code.usedCount >= code.maxUses;
                const isUsable = code.isActive && !isExpired && !isFull;

                return (
                  <div
                    key={code.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 transition-colors ${
                      !isUsable ? "opacity-60" : ""
                    }`}
                  >
                    {/* Code & description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="rounded bg-muted px-2.5 py-1 font-mono text-sm font-bold tracking-widest">
                          {code.code}
                        </code>
                        {!code.isActive && (
                          <Badge variant="secondary" className="text-[10px]">
                            無効
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="destructive" className="text-[10px]">
                            期限切れ
                          </Badge>
                        )}
                        {isFull && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-orange-500/30 text-orange-400"
                          >
                            上限到達
                          </Badge>
                        )}
                        {isUsable && (
                          <Badge className="text-[10px] bg-green-500/10 text-green-400 border-green-500/30">
                            有効
                          </Badge>
                        )}
                      </div>
                      {code.description && (
                        <p className="mt-1 text-xs text-muted-foreground truncate">
                          {code.description}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        使用: {code.usedCount}/{code.maxUses}
                        {code.expiresAt &&
                          ` · 期限: ${new Date(code.expiresAt).toLocaleDateString("ja-JP")}`}
                        {` · 作成: ${new Date(code.createdAt).toLocaleDateString("ja-JP")}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {code.isActive ? "有効" : "無効"}
                        </span>
                        <Switch
                          checked={code.isActive}
                          onCheckedChange={() =>
                            handleToggleActive(code.id, code.isActive)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(code.code, code.id)}
                        title="コードをコピー"
                      >
                        {copiedId === code.id ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(code.id)}
                        title="削除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
