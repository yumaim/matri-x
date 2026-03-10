/**
 * Plan-based feature gating utility
 * 
 * Defines which features are available at each tier.
 * Used throughout the app to check access and show upgrade prompts.
 */

export type PlanTier = "FREE" | "STANDARD" | "PRO" | "ENTERPRISE";

// Plan hierarchy for comparison
const PLAN_HIERARCHY: Record<PlanTier, number> = {
  FREE: 0,
  STANDARD: 1,
  PRO: 2,
  ENTERPRISE: 3,
};

export type Feature =
  | "pipeline_explorer"
  | "engagement_analysis"
  | "tweepcred_simulator"
  | "deep_ai_search"
  | "forum_post"
  | "forum_view"
  | "weekly_report"
  | "simclusters"
  | "advanced_simulator"
  | "api_access"
  | "team_features"
  | "priority_support";

// Feature → minimum required plan
const FEATURE_PLAN: Record<Feature, PlanTier> = {
  pipeline_explorer: "FREE",
  engagement_analysis: "FREE",
  forum_view: "FREE",
  tweepcred_simulator: "STANDARD",
  forum_post: "STANDARD",
  deep_ai_search: "PRO",
  weekly_report: "PRO",
  simclusters: "PRO",
  advanced_simulator: "PRO",
  api_access: "ENTERPRISE",
  team_features: "ENTERPRISE",
  priority_support: "PRO",
};

// Plan display info for UI
export const PLAN_INFO: Record<PlanTier, { name: string; price: string; color: string; bgColor: string; borderColor: string }> = {
  FREE: { name: "Free", price: "¥0", color: "text-muted-foreground", bgColor: "bg-muted", borderColor: "border-border" },
  STANDARD: { name: "Standard", price: "¥2,980/月", color: "text-blue-400", bgColor: "bg-blue-400/10", borderColor: "border-blue-400/30" },
  PRO: { name: "Pro", price: "¥5,980/月", color: "text-purple-400", bgColor: "bg-purple-400/10", borderColor: "border-purple-400/30" },
  ENTERPRISE: { name: "Enterprise", price: "お問い合わせ", color: "text-yellow-400", bgColor: "bg-yellow-400/10", borderColor: "border-yellow-400/30" },
};

/**
 * Check if a plan has access to a feature
 */
export function hasAccess(userPlan: PlanTier, feature: Feature): boolean {
  const requiredPlan = FEATURE_PLAN[feature];
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
}

/**
 * Get the minimum required plan for a feature
 */
export function getRequiredPlan(feature: Feature): PlanTier {
  return FEATURE_PLAN[feature];
}

/**
 * Check if a plan is at least as high as another
 */
export function isPlanAtLeast(userPlan: PlanTier, requiredPlan: PlanTier): boolean {
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
}

/**
 * Get the next upgrade plan
 */
export function getNextPlan(currentPlan: PlanTier): PlanTier | null {
  switch (currentPlan) {
    case "FREE": return "STANDARD";
    case "STANDARD": return "PRO";
    case "PRO": return "ENTERPRISE";
    case "ENTERPRISE": return null;
  }
}
