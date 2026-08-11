export type PlanId = "free" | "pro" | "enterprise";

export type PlanFeature =
  | "roadmap"
  | "customFields"
  | "customWorkflows"
  | "ssoAuditLogs";

export interface PlanLimits {
  memberLimit: number | null;
  automationRunLimit: number | null;
  aiCallLimit: number | null;
  storageLimitMB: number | null;
}

export const PLAN_LIMITS: Record<
  PlanId,
  Omit<PlanLimits, "automationRunLimit"> & {
    automationRunLimitPerMember: number | null;
  }
> = {
  free: {
    memberLimit: 10,
    automationRunLimitPerMember: null,
    aiCallLimit: 20,
    storageLimitMB: 2000,
  },
  pro: {
    memberLimit: null,
    automationRunLimitPerMember: 1000,
    aiCallLimit: 500,
    storageLimitMB: 10000,
  },
  enterprise: {
    memberLimit: null,
    automationRunLimitPerMember: null,
    aiCallLimit: null,
    storageLimitMB: null,
  },
};

export function automationRunLimitFor(
  plan: PlanId,
  memberCount: number
): number | null {
  if (plan === "enterprise") return null;
  if (plan === "pro") return Math.max(1, memberCount) * 1000;
  return 100;
}

export function resolveLimits(
  plan: PlanId,
  memberCount: number
): PlanLimits {
  const cfg = PLAN_LIMITS[plan];
  return {
    memberLimit: cfg.memberLimit,
    automationRunLimit: automationRunLimitFor(plan, memberCount),
    aiCallLimit: cfg.aiCallLimit,
    storageLimitMB: cfg.storageLimitMB,
  };
}

export function hasFeature(plan: PlanId | undefined, feature: PlanFeature): boolean {
  if (!plan) return false;
  switch (feature) {
    case "roadmap":
    case "customFields":
    case "customWorkflows":
      return plan === "pro" || plan === "enterprise";
    case "ssoAuditLogs":
      return plan === "enterprise";
  }
}
