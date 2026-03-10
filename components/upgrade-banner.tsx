"use client";

import Link from "next/link";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type PlanTier, PLAN_INFO, getNextPlan } from "@/lib/plan-gating";

/**
 * Inline upgrade banner shown when a user tries to access a gated feature.
 * Use as a replacement for or overlay on the locked content area.
 */
export function UpgradeBanner({
  currentPlan = "FREE",
  requiredPlan,
  featureName,
  compact = false,
}: {
  currentPlan?: PlanTier;
  requiredPlan: PlanTier;
  featureName: string;
  compact?: boolean;
}) {
  const planInfo = PLAN_INFO[requiredPlan];
  const nextPlan = getNextPlan(currentPlan);

  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-xl border ${planInfo.borderColor} ${planInfo.bgColor} px-4 py-3`}>
        <Lock className={`h-4 w-4 shrink-0 ${planInfo.color}`} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">
            {featureName}は
          </span>
          <span className={`text-sm font-bold ${planInfo.color} ml-1`}>
            {planInfo.name}プラン
          </span>
          <span className="text-sm text-muted-foreground ml-1">
            以上で利用可能
          </span>
        </div>
        <Link href="/register">
          <Button size="sm" variant="outline" className={`shrink-0 text-xs ${planInfo.borderColor} ${planInfo.color}`}>
            詳細
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${planInfo.borderColor} ${planInfo.bgColor} p-6 sm:p-8`}>
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />

      <div className="relative flex flex-col items-center text-center space-y-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${planInfo.bgColor} border ${planInfo.borderColor}`}>
          <Lock className={`h-6 w-6 ${planInfo.color}`} />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className={`h-4 w-4 ${planInfo.color}`} />
            {featureName}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            この機能は
            <span className={`font-bold ${planInfo.color} mx-1`}>
              {planInfo.name}プラン
            </span>
            ({planInfo.price}) 以上でご利用いただけます。
            アップグレードして全機能にアクセスしましょう。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {nextPlan && (
            <Link href="/register">
              <Button className="group">
                {PLAN_INFO[nextPlan].name}にアップグレード
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
          <Link href="/#pricing">
            <Button variant="outline">
              料金プランを比較
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper that gates content behind a plan check.
 * Shows the content if user has access, otherwise shows upgrade banner.
 */
export function PlanGate({
  children,
  userPlan = "FREE",
  requiredPlan,
  featureName,
  compact = false,
}: {
  children: React.ReactNode;
  userPlan?: PlanTier;
  requiredPlan: PlanTier;
  featureName: string;
  compact?: boolean;
}) {
  const planHierarchy: Record<PlanTier, number> = {
    FREE: 0,
    STANDARD: 1,
    PRO: 2,
    ENTERPRISE: 3,
  };

  if (planHierarchy[userPlan] >= planHierarchy[requiredPlan]) {
    return <>{children}</>;
  }

  return (
    <UpgradeBanner
      currentPlan={userPlan}
      requiredPlan={requiredPlan}
      featureName={featureName}
      compact={compact}
    />
  );
}
