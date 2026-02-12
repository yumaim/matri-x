"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Crown, UserCog, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-utils";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
}

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<TeamMember[]>([]);
  const [mods, setMods] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/architect/users?search=");
      if (res.ok) {
        const data = await res.json();
        const all: TeamMember[] = data.users;
        setAdmins(all.filter((u) => u.role === "ADMIN"));
        setMods(all.filter((u) => u.role === "MODERATOR"));
      }
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const changeRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/architect/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "changeRole", role }),
      });
      if (res.ok) fetchTeam();
      else {
        const err = await res.json();
        alert(err.error || "エラー");
      }
    } catch { alert("通信エラー"); }
    setActionLoading(null);
  };

  const roleIcon = (role: string) => {
    if (role === "ADMIN") return <Crown className="h-4 w-4 text-yellow-400" />;
    return <Shield className="h-4 w-4 text-blue-400" />;
  };

  const roleBadgeColor = (role: string) => {
    if (role === "ADMIN") return "bg-red-500/10 text-red-400 border-red-500/30";
    return "bg-blue-500/10 text-blue-400 border-blue-500/30";
  };

  const renderMember = (member: TeamMember) => (
    <Card key={member.id} className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            {roleIcon(member.role)}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{member.name ?? "名前未設定"}</span>
                <Badge variant="outline" className={cn("text-xs", roleBadgeColor(member.role))}>
                  {member.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{member.email}</p>
              <p className="text-xs text-muted-foreground">参加: {formatDate(member.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {member.role === "MODERATOR" && (
              <>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => changeRole(member.id, "ADMIN")} disabled={actionLoading === member.id}>
                  ADMINに昇格
                </Button>
                <Button size="sm" variant="outline" className="text-xs text-muted-foreground" onClick={() => changeRole(member.id, "USER")} disabled={actionLoading === member.id}>
                  解除
                </Button>
              </>
            )}
            {member.role === "ADMIN" && (
              <Button size="sm" variant="outline" className="text-xs text-muted-foreground" onClick={() => changeRole(member.id, "USER")} disabled={actionLoading === member.id}>
                ADMIN解除
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <UserCog className="h-5 w-5 text-purple-400" />
        チーム管理
      </h1>
      <p className="text-sm text-muted-foreground">
        管理者（ADMIN）とモデレーター（MOD）の管理。ユーザー管理ページでロール変更も可能です。
      </p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-400" /> 管理者 ({admins.length})
            </h2>
            {admins.length === 0 ? (
              <p className="text-sm text-muted-foreground">管理者がいません</p>
            ) : admins.map(renderMember)}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" /> モデレーター ({mods.length})
            </h2>
            {mods.length === 0 ? (
              <p className="text-sm text-muted-foreground">モデレーターがいません。ユーザー管理から追加できます。</p>
            ) : mods.map(renderMember)}
          </div>
        </>
      )}
    </div>
  );
}
