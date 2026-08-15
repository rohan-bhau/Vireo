"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, CreditCard, ExternalLink, Sparkles, X } from "lucide-react";
import { clsx } from "clsx";
import {
  useGetSubscriptionQuery,
  useGetUsageStatsQuery,
  useGetPlansQuery,
  useCreateCheckoutSessionMutation,
  useActivateSubscriptionMutation,
  type PlanId,
} from "@/store/billingApi";
import { useSettings } from "@/lib/settings-context";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SkeletonSettingsPage } from "@/components/ui/skeleton";
import { toastError } from "@/lib/toast";

const STATUS_META: Record<string, { label: string; className: string }> = {
  trialing: {
    label: "Trialing",
    className: "bg-[#EEF4FF] text-[#004AC6]",
  },
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700",
  },
  past_due: {
    label: "Past due",
    className: "bg-amber-50 text-amber-700",
  },
  canceled: {
    label: "Canceled",
    className: "bg-slate-100 text-slate-600",
  },
};

const PLAN_NAMES: Record<PlanId, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

function daysUntil(date?: string): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatMB(mb: number): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1)} GB`;
  }
  return `${mb} MB`;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

function formatPrice(cents: number): string {
  return cents === 0 ? "$0" : `$${(cents / 100).toFixed(0)}`;
}

interface UsageBarProps {
  label: string;
  used: number;
  limit: number | null;
  limitLabel: string;
}

function UsageBar({ label, used, limit, limitLabel }: UsageBarProps) {
  const pct = limit !== null ? Math.min((used / Math.max(1, limit)) * 100, 100) : null;
  const color =
    pct === null
      ? "bg-[#2563EB]"
      : pct >= 100
        ? "bg-[#DC2626]"
        : pct >= 80
          ? "bg-[#D97706]"
          : "bg-[#2563EB]";

  return (
    <div className="rounded-2xl border border-[#C3C6D7]/30 bg-surface p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <p className="text-sm font-semibold text-text">
          {limit === null ? "Unlimited" : `${formatCount(used)} / ${formatCount(limit)}`}
        </p>
      </div>
      {pct !== null && (
        <>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EEF4FF]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${color}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-text-secondary">
            {limitLabel}
            {pct >= 100 ? " · Limit reached" : pct >= 80 ? " · Almost there" : ""}
          </p>
        </>
      )}
      {limit === null && (
        <p className="mt-1.5 text-xs text-text-secondary">{limitLabel}</p>
      )}
    </div>
  );
}

export function WorkspaceSettingsBilling() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { isOwner } = useSettings();
  const canManage = isOwner;

  const { data: subscription, isLoading: subLoading, refetch: refetchSubscription } =
    useGetSubscriptionQuery(workspaceId, { skip: !workspaceId });
  const { data: usage, isLoading: usageLoading } = useGetUsageStatsQuery(workspaceId, {
    skip: !workspaceId,
  });
  const { data: plans = [], isLoading: plansLoading } = useGetPlansQuery();
  const [createCheckout, { isLoading: checkoutLoading }] = useCreateCheckoutSessionMutation();
  const [activateSubscription] = useActivateSubscriptionMutation();

  const [confirmPlan, setConfirmPlan] = useState<PlanId | null>(null);
  const upgradeSucceeded = searchParams.get("upgrade") === "success";
  const activated = upgradeSucceeded && subscription?.plan !== "free";

  useEffect(() => {
    if (!upgradeSucceeded || activated || !workspaceId) return;
    let active = true;
    activateSubscription(workspaceId)
      .unwrap()
      .catch((e) => {
        const msg =
          (e as { data?: { message?: string } })?.data?.message ||
          (e as { message?: string })?.message ||
          "Could not activate your plan yet";
        if (active) toastError(msg);
      });
    return () => { active = false; };
  }, [upgradeSucceeded, activated, workspaceId, activateSubscription]);

  useEffect(() => {
    if (!upgradeSucceeded || activated || !refetchSubscription) return;
    const t = setInterval(() => { refetchSubscription(); }, 3000);
    const stop = setTimeout(() => clearInterval(t), 20000);
    return () => { clearInterval(t); clearTimeout(stop); };
  }, [upgradeSucceeded, activated, refetchSubscription]);

  useEffect(() => {
    if (!activated || !upgradeSucceeded) return;
    sessionStorage.removeItem("vireo_checkout_session");
    router.replace(`/w/${workspaceId}/settings/billing`);
  }, [activated, upgradeSucceeded, workspaceId, router]);

  if (subLoading || usageLoading || plansLoading) {
    return <SkeletonSettingsPage />;
  }

  const plan = subscription?.plan || usage?.plan || "free";
  const status = subscription?.status || "trialing";
  const trialDaysLeft = plan === "free" && status === "trialing" ? daysUntil(subscription?.trialEndsAt) : null;
  const statusMeta = STATUS_META[status] ?? STATUS_META.active;

  async function handleUpgrade(planId: "pro" | "enterprise") {
    if (!workspaceId) return;
    const origin = window.location.origin;
    try {
      const { url, sessionId } = await createCheckout({
        workspaceId,
        planId,
        successUrl: `${origin}/w/${workspaceId}/settings/billing?upgrade=success`,
        cancelUrl: `${origin}/w/${workspaceId}/settings/billing`,
      }).unwrap();
      sessionStorage.setItem("vireo_checkout_session", sessionId);
      window.location.href = url;
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not start checkout");
      setConfirmPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Billing &amp; Plan</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Monitor your usage and upgrade your workspace plan anytime.
        </p>
      </div>

      {upgradeSucceeded && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {activated
            ? "Your workspace has been upgraded."
            : "Activating your new plan..."}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-[#C3C6D7]/30 bg-surface shadow-[0_1px_3px_rgba(16,24,40,0.04)] lg:w-2/5">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#EC4899]" />
          <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-secondary">Current plan</p>
            <span
              className={clsx(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                statusMeta.className
              )}
            >
              {statusMeta.label}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] shadow-md">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{PLAN_NAMES[plan]}</p>
              <p className="text-sm text-text-secondary">
                {plan === "free"
                  ? "$0 forever"
                  : `${formatPrice(
                      plans.find((p) => p.id === plan)?.price ?? 0
                    )} / user / month`}
              </p>
            </div>
          </div>

          {trialDaysLeft !== null && (
            <div className="mt-4 rounded-lg bg-[#EEF4FF] px-3 py-2 text-sm text-[#004AC6]">
              {trialDaysLeft > 0
                ? `Free trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"}`
                : "Free trial has ended"}
            </div>
          )}

          {subscription?.currentPeriodStart && subscription?.currentPeriodEnd && (
            <div className="mt-4 space-y-1 border-t border-[#C3C6D7]/30 pt-4 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Period start</span>
                <span className="font-medium text-text">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Period end</span>
                <span className="font-medium text-text">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <div className="mt-5">
            <Link
              href="/pricing"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#004AC6] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View public pricing page
            </Link>
          </div>
          </div>
        </div>

        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <UsageBar
            label="Team members"
            used={usage?.memberCount ?? 0}
            limit={usage?.memberLimit ?? null}
            limitLabel={
              usage?.memberLimit != null
                ? `${usage.memberLimit} max on ${PLAN_NAMES[usage.plan]}`
                : "Unlimited members"
            }
          />
          <UsageBar
            label="Automation runs"
            used={usage?.automationRunsUsed ?? 0}
            limit={usage?.automationRunLimit ?? null}
            limitLabel={
              usage?.automationRunLimit != null
                ? `${formatCount(usage.automationRunLimit)} / period on ${PLAN_NAMES[usage.plan]}`
                : "Unlimited automation runs"
            }
          />
          <UsageBar
            label="AI calls"
            used={usage?.aiCallsUsed ?? 0}
            limit={usage?.aiCallLimit ?? null}
            limitLabel={
              usage?.aiCallLimit != null
                ? `${formatCount(usage.aiCallLimit)} / period on ${PLAN_NAMES[usage.plan]}`
                : "Unlimited AI calls"
            }
          />
          <UsageBar
            label="Storage"
            used={usage?.storageUsed ?? 0}
            limit={usage?.storageLimit ?? null}
            limitLabel={
              usage?.storageLimit != null
                ? `${formatMB(usage.storageLimit)} on ${PLAN_NAMES[usage.plan]}`
                : "Unlimited storage"
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-text">Choose a plan</h3>
        <p className="mt-0.5 text-sm text-text-secondary">
          Per-user (seat) pricing. Upgrades apply immediately and are billed via Stripe.
        </p>

        {!canManage && (
          <div className="mt-3 rounded-lg bg-[#F8F9FF] px-4 py-3 text-sm text-text-secondary">
            Only workspace admins and the owner can upgrade the plan.
          </div>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = p.id === plan;
            const canUpgrade = canManage && !isCurrent && p.id !== "free";
            const isPro = p.id === "pro";
            return (
              <div
                key={p.id}
                className={clsx(
                  "relative flex flex-col rounded-2xl border bg-surface p-6 transition-all duration-300",
                  isPro
                    ? "border-[#2563EB]/60 bg-gradient-to-b from-[#2563EB]/[0.06] to-transparent shadow-[0_8px_32px_rgba(37,99,235,0.12)] ring-1 ring-[#2563EB]/30 hover:shadow-[0_12px_40px_rgba(37,99,235,0.18)]"
                    : "border-[#C3C6D7]/30 shadow-[0_1px_3px_rgba(16,24,40,0.04)] hover:border-[#2563EB]/40 hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]"
                )}
              >
                {isPro && (
                  <span className="absolute left-1/2 -top-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                    Most popular
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-text">{p.name}</p>
                  {isCurrent && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                      Current
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={clsx("text-3xl font-extrabold", isPro ? "text-[#2563EB]" : "text-text")}>
                    {formatPrice(p.price)}
                  </span>
                  <span className="text-xs text-text-secondary">/ user / month</span>
                </div>
                <p className="mt-1.5 text-xs text-text-secondary">{p.description}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span
                        className={clsx(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          isPro ? "bg-[#2563EB]/10" : "bg-emerald-50"
                        )}
                      >
                        <Check className="h-2.5 w-2.5 text-[#36B37E]" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full cursor-pointer"
                  variant={isPro ? "primary" : "outline"}
                  disabled={!canUpgrade || checkoutLoading}
                  onClick={() => setConfirmPlan(p.id as "pro" | "enterprise")}
                >
                  {isCurrent ? (
                    "Current plan"
                  ) : p.id === "free" ? (
                    "Downgrade"
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Upgrade
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#C3C6D7]/30 bg-surface shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
        <table className="w-full min-w-[640px] border-collapse bg-surface text-sm">
          <thead>
            <tr className="border-b border-[#C3C6D7]/30 bg-[#F8F9FF]">
              <th className="px-4 py-3 text-left font-semibold text-text">Feature</th>
              {plans.map((p) => (
                <th key={p.id} className="px-4 py-3 text-left font-semibold text-text">
                  {p.name}
                  {p.id === "pro" && (
                    <span className="ml-1.5 rounded-full bg-[#2563EB]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#2563EB]">
                      Popular
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Team members", get: (id: PlanId) => (id === "free" ? "Up to 10" : "Unlimited (per-seat)") },
              { label: "Projects", get: () => "Unlimited" },
              { label: "Automation runs", get: (id: PlanId) => (id === "free" ? "100 / month" : id === "pro" ? "1,000 per member / month" : "Unlimited") },
              { label: "AI calls", get: (id: PlanId) => (id === "free" ? "20 / month" : id === "pro" ? "500 / month" : "Unlimited") },
              { label: "Storage", get: (id: PlanId) => (id === "free" ? "2 GB" : id === "pro" ? "10 GB" : "Unlimited") },
              { label: "Roadmap / Timeline", get: (id: PlanId) => (id === "free" ? "—" : "Included") },
              { label: "Custom fields", get: (id: PlanId) => (id === "free" ? "—" : "Included") },
              { label: "Custom workflows", get: (id: PlanId) => (id === "free" ? "—" : "Included") },
              { label: "SSO & audit logs", get: (id: PlanId) => (id === "enterprise" ? "Included" : "—") },
            ].map((row) => (
              <tr key={row.label} className="border-b border-[#C3C6D7]/20 last:border-0">
                <td className="px-4 py-2.5 font-medium text-text">{row.label}</td>
                {plans.map((p) => {
                  const value = row.get(p.id);
                  const isIncluded = value === "Included";
                  return (
                    <td key={p.id} className="px-4 py-2.5 text-text-secondary">
                      {isIncluded ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                          <Check className="h-4 w-4" /> Included
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={confirmPlan !== null}
        onClose={() => setConfirmPlan(null)}
        title={`Upgrade to ${confirmPlan ? PLAN_NAMES[confirmPlan] : ""}`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            You&apos;re upgrading to the{" "}
            <span className="font-semibold text-text">
              {confirmPlan ? PLAN_NAMES[confirmPlan] : ""}
            </span>{" "}
            plan at{" "}
            <span className="font-semibold text-text">
              {formatPrice(plans.find((p) => p.id === confirmPlan)?.price ?? 0)} / user / month
            </span>
            . Your workspace will be charged for{" "}
            <span className="font-semibold text-text">{usage?.memberCount ?? 0} member(s)</span>.
            You&apos;ll complete payment securely on Stripe.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmPlan(null)} disabled={checkoutLoading}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button
              onClick={() => confirmPlan && handleUpgrade(confirmPlan as "pro" | "enterprise")}
              isLoading={checkoutLoading}
            >
              Continue to payment
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
