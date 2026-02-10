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
    <div className="relative">
      <div className="pointer-events-none select-none opacity-20 blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="glass border-primary/30 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {requiredPlan}プラン限定機能
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {featureName ? `「${featureName}」は` : "この機能は"}
              {requiredPlan}プラン以上でご利用いただけます。
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Coming Soon — 有料プランは近日公開予定です
            </p>
            <Button variant="outline" className="gap-2" disabled>
              <Sparkles className="h-4 w-4" />
              準備中
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
