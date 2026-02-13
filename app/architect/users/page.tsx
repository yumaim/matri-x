"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Search, Ban, ShieldCheck, UserCog, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-utils";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  plan: string;
  banned: boolean;
  bannedReason: string | null;
  createdAt: string;
  _count: { posts: number; comments: number; tickets: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    variant: "default" | "destructive";
    confirmLabel: string;
    inputLabel?: string;
    inputPlaceholder?: string;
    onConfirm: (inputValue?: string) => void;
  } | null>(null);

  // Search debounce
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/architect/users?page=${page}&search=${encodeURIComponent(debouncedSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch { /* */ }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (userId: string, action: string, extra?: Record<string, string>) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/architect/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, ...extra }),
      });
      if (res.ok) fetchUsers();
      else {
        const err = await res.json();
        // Use toast-style inline error instead of alert()
        console.error("Admin action error:", err.error);
      }
    } catch {
      console.error("Network error");
    }
    setActionLoading(null);
  };

  const showConfirm = (config: NonNullable<typeof confirmConfig>) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  };

  const handleBan = (user: UserRow) => {
    showConfirm({
      title: `${user.name ?? "名前未設定"} をBANしますか？`,
      description: "このユーザーはサービスにログインできなくなります。この操作は後で取り消せます。",
      variant: "destructive",
      confirmLabel: "BANする",
      inputLabel: "BAN理由（任意）",
      inputPlaceholder: "利用規約違反など...",
      onConfirm: (reason) => {
        handleAction(user.id, "ban", { reason: reason ?? "" });
        setConfirmOpen(false);
      },
    });
  };

  const handleUnban = (user: UserRow) => {
    showConfirm({
      title: `${user.name ?? "名前未設定"} のBANを解除しますか？`,
      description: "このユーザーは再びサービスを利用できるようになります。",
      variant: "default",
      confirmLabel: "BAN解除",
      onConfirm: () => {
        handleAction(user.id, "unban");
        setConfirmOpen(false);
      },
    });
  };

  const handleRoleChange = (user: UserRow, newRole: string) => {
    if (newRole === user.role) return;
    const isDowngrade = user.role === "ADMIN" && newRole !== "ADMIN";
    showConfirm({
      title: `ロール変更: ${user.role} → ${newRole}`,
      description: isDowngrade
        ? `⚠️ ${user.name ?? "名前未設定"} の管理者権限を剥奪します。本当によろしいですか？`
        : `${user.name ?? "名前未設定"} のロールを ${newRole} に変更します。`,
      variant: isDowngrade ? "destructive" : "default",
      confirmLabel: "変更する",
      onConfirm: () => {
        handleAction(user.id, "changeRole", { role: newRole });
        setConfirmOpen(false);
      },
    });
  };

  const handlePlanChange = (user: UserRow, newPlan: string) => {
    if (newPlan === user.plan) return;
    showConfirm({
      title: `プラン変更: ${user.plan} → ${newPlan}`,
      description: `${user.name ?? "名前未設定"} のプランを ${newPlan} に変更します。`,
      variant: "default",
      confirmLabel: "変更する",
      onConfirm: () => {
        handleAction(user.id, "changePlan", { plan: newPlan });
        setConfirmOpen(false);
      },
    });
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-500/10 text-red-400 border-red-500/30",
      MODERATOR: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      USER: "bg-muted text-muted-foreground border-border",
    };
    return <Badge variant="outline" className={cn("text-xs", colors[role] ?? colors.USER)}>{role}</Badge>;
  };

  const planBadge = (plan: string) => {
    const colors: Record<string, string> = {
      PRO: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      STANDARD: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      FREE: "bg-muted text-muted-foreground border-border",
    };
    return <Badge variant="outline" className={cn("text-xs", colors[plan] ?? colors.FREE)}>{plan}</Badge>;
  };

  // Mask email for display
  const maskEmail = (email: string | null) => {
    if (!email) return "—";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const masked = local.length <= 2 ? local : local.slice(0, 2) + "•".repeat(Math.min(local.length - 2, 5));
    return `${masked}@${domain}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <UserCog className="h-5 w-5 text-blue-400" />
          ユーザー管理 <span className="text-sm text-muted-foreground font-normal">({total}人)</span>
        </h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="名前またはメールで検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id} className={cn("bg-card/50", u.banned && "border-red-500/30 bg-red-500/5")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{u.name ?? "名前未設定"}</span>
                      {roleBadge(u.role)}
                      {planBadge(u.plan)}
                      {u.banned && <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">BAN</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{maskEmail(u.email)}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>投稿: {u._count.posts}</span>
                      <span>コメント: {u._count.comments}</span>
                      <span>チケット: {u._count.tickets}</span>
                      <span>登録: {formatDate(u.createdAt)}</span>
                    </div>
                    {u.bannedReason && <p className="text-xs text-red-400">BAN理由: {u.bannedReason}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0 flex-wrap">
                    {u.banned ? (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => handleUnban(u)}
                        disabled={actionLoading === u.id}
                        className="text-xs gap-1"
                      >
                        <ShieldCheck className="h-3 w-3" /> BAN解除
                      </Button>
                    ) : (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => handleBan(u)}
                        disabled={actionLoading === u.id}
                        className="text-xs gap-1 text-red-400 hover:text-red-300"
                      >
                        <Ban className="h-3 w-3" /> BAN
                      </Button>
                    )}
                    <select
                      className="text-xs bg-background border border-border rounded px-2 py-1"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      disabled={actionLoading === u.id}
                    >
                      <option value="USER">USER</option>
                      <option value="MODERATOR">MOD</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <select
                      className="text-xs bg-background border border-border rounded px-2 py-1"
                      value={u.plan}
                      onChange={(e) => handlePlanChange(u, e.target.value)}
                      disabled={actionLoading === u.id}
                    >
                      <option value="FREE">FREE</option>
                      <option value="STANDARD">STANDARD</option>
                      <option value="PRO">PRO</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

      {/* Confirmation Dialog */}
      {confirmConfig && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={confirmConfig.title}
          description={confirmConfig.description}
          variant={confirmConfig.variant}
          confirmLabel={confirmConfig.confirmLabel}
          inputLabel={confirmConfig.inputLabel}
          inputPlaceholder={confirmConfig.inputPlaceholder}
          onConfirm={confirmConfig.onConfirm}
          loading={actionLoading !== null}
        />
      )}
    </div>
  );
}
