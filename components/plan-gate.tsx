"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

interface PlanGateProps {
  requiredPlan: "STANDARD" | "PRO";
  children: React.ReactNode;
  featureName?: string;
}

export function PlanGate({ requiredPlan, children, featureName }: PlanGateProps) {
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => setPlan(data.plan ?? "FREE"))
      .catch(() => setPlan("FREE"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <>{children}</>;

  const planLevel: Record<string, number> = { FREE: 0, STANDARD: 1, PRO: 2 };
  const userLevel = planLevel[plan ?? "FREE"] ?? 0;
  const requiredLevel = planLevel[requiredPlan] ?? 1;

  if (userLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[60vh]">
      <div className="pointer-events-none select-none opacity-20 blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
        <Card className="glass border-amber-500/30 max-w-sm w-full shadow-2xl shadow-amber-500/10">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              現在開発中 🚧
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {featureName ? `「${featureName}」は` : "この機能は"}
              エンジニアが鋭意開発中です。
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              もう少しお待ちください — まもなくリリース予定です
            </p>
            <Button variant="outline" className="gap-2 border-amber-500/30 text-amber-400" disabled>
              <Sparkles className="h-4 w-4" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
