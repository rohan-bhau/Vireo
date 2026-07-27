"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetPortalSessionMutation,
} from "@/store/billingApi";
import { Button } from "@/components/ui/button";
import { UsageStats } from "@/components/billing/usage-stats";
import { PlanCard } from "@/components/billing/plan-card";
import { UpgradeModal } from "@/components/billing/upgrade-modal";

export default function BillingPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState<"pro" | "enterprise" | null>(null);

  const { data: plans = [], isLoading: plansLoading } = useGetPlansQuery();
  const {
    data: subscription,
    isLoading: subLoading,
    refetch: refetchSub,
  } = useGetSubscriptionQuery(workspaceId);
  const [createCheckoutSession] = useCreateCheckoutSessionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const [resumeSubscription] = useResumeSubscriptionMutation();
  const [getPortalSession] = useGetPortalSessionMutation();

  const handleUpgradeClick = useCallback((planId: "pro" | "enterprise") => {
    setTargetPlanId(planId);
    setUpgradeModalOpen(true);
  }, []);

  async function handleConfirmUpgrade() {
    if (!targetPlanId) return;
    setError(null);
    setIsLoading("upgrade");
    try {
      const result = await createCheckoutSession({
        workspaceId,
        planId: targetPlanId,
        successUrl: `${window.location.origin}/w/${workspaceId}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/w/${workspaceId}/settings/billing?canceled=true`,
      }).unwrap();
      setUpgradeModalOpen(false);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data: { message: string } }).data?.message
          : "Failed to create checkout session";
      setError(message);
    } finally {
      setIsLoading(null);
    }
  }

  async function handleCancel() {
    setError(null);
    setIsLoading("cancel");
    try {
      await cancelSubscription(workspaceId).unwrap();
      refetchSub();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data: { message: string } }).data?.message
          : "Failed to cancel subscription";
      setError(message);
    } finally {
      setIsLoading(null);
    }
  }

  async function handleResume() {
    setError(null);
    setIsLoading("resume");
    try {
      await resumeSubscription(workspaceId).unwrap();
      refetchSub();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data: { message: string } }).data?.message
          : "Failed to resume subscription";
      setError(message);
    } finally {
      setIsLoading(null);
    }
  }

  async function handlePortal() {
    setError(null);
    setIsLoading("portal");
    try {
      const result = await getPortalSession({
        workspaceId,
        returnUrl: `${window.location.origin}/w/${workspaceId}/settings/billing`,
      }).unwrap();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data: { message: string } }).data?.message
          : "Failed to open billing portal";
      setError(message);
    } finally {
      setIsLoading(null);
    }
  }

  const isLoadingData = plansLoading || subLoading;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const isTrialing = subscription?.status === "trialing";
  const isOnPaidPlan = subscription?.plan === "pro" || subscription?.plan === "enterprise";
  const isCanceled = subscription?.cancelAtPeriodEnd;

  // eslint-disable-next-line react-hooks/purity
  const _now = Date.now();
  const trialDaysLeft: number | null =
    isTrialing && subscription?.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - _now) / (1000 * 60 * 60 * 24)))
      : null;

  const currentPlanData = plans.find((p) => p.id === subscription?.plan) || null;

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href={`/w/${workspaceId}`} className="font-medium text-[#737686] hover:text-[#121C28] transition-colors">
          Workspace
        </Link>
        <span className="text-[#C3C6D7]">/</span>
        <Link href={`/w/${workspaceId}/settings`} className="font-medium text-[#737686] hover:text-[#121C28] transition-colors">
          Settings
        </Link>
        <span className="text-[#C3C6D7]">/</span>
        <span className="font-semibold text-[#121C28]">Plans & Billing</span>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[#C3C6D7]/20 pb-4 overflow-x-auto">
        <Link
          href={`/w/${workspaceId}/settings`}
          className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-[#434655] hover:bg-[#F8F9FF] transition-colors"
        >
          General Details
        </Link>
        <Link
          href={`/w/${workspaceId}/settings`}
          className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-[#434655] hover:bg-[#F8F9FF] transition-colors"
        >
          Members
        </Link>
        <Link
          href={`/w/${workspaceId}/settings/billing`}
          className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium bg-[#EEF4FF] text-[#004AC6] transition-colors"
        >
          Plans & Billing
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#121C28]">Plans & Billing</h2>
        <p className="mt-1 text-sm text-[#737686]">
          Manage your subscription plan and billing information.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {isTrialing && trialDaysLeft !== null && trialDaysLeft <= 7 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] p-4">
          <svg className="h-5 w-5 flex-shrink-0 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div className="text-sm text-[#92400E]">
            <span className="font-semibold">Trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}.</span>{" "}
            Add a payment method to keep your Pro plan features after the trial ends.
          </div>
        </div>
      )}

      {subscription && (
        <div className="mb-6 rounded-xl bg-[#F8F9FF] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#737686]">Current Plan</p>
              <p className="mt-1 text-2xl font-bold text-[#121C28] capitalize">
                {subscription.plan}
                {isTrialing && (
                  <span className="ml-2 inline-block rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-medium text-[#D97706]">
                    Trial
                  </span>
                )}
                {isCanceled && (
                  <span className="ml-2 inline-block rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-xs font-medium text-[#DC2626]">
                    Canceled
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-[#737686] capitalize">
                Status: {subscription.status.replace("_", " ")}
                {isTrialing && subscription.trialEndsAt && (
                  <span>
                    {" "}— Trial ends{" "}
                    {new Date(subscription.trialEndsAt).toLocaleDateString()}
                  </span>
                )}
                {isCanceled && subscription.currentPeriodEnd && (
                  <span>
                    {" "}— Access until{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isOnPaidPlan && (
                <Button
                  variant="outline"
                  isLoading={isLoading === "portal"}
                  onClick={handlePortal}
                >
                  Manage in Stripe
                </Button>
              )}
              {isOnPaidPlan && !isCanceled && (
                <Button
                  variant="danger"
                  isLoading={isLoading === "cancel"}
                  onClick={handleCancel}
                >
                  Cancel Plan
                </Button>
              )}
              {isOnPaidPlan && isCanceled && (
                <Button
                  isLoading={isLoading === "resume"}
                  onClick={handleResume}
                >
                  Resume Plan
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <UsageStats workspaceId={workspaceId} />

      {(!isOnPaidPlan || isTrialing) && (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan =
              subscription?.plan === plan.id && !isTrialing;
            const isDisabled =
              isCurrentPlan ||
              (plan.id === "free" && !isTrialing) ||
              (subscription?.plan === "pro" && plan.id === "enterprise" && !isTrialing && !isCanceled);

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isCurrentPlan}
                isTrialing={isTrialing}
                isDisabled={isDisabled}
                onUpgrade={handleUpgradeClick}
                isLoading={isLoading === plan.id}
              />
            );
          })}
        </div>
      )}

      {isOnPaidPlan && !isTrialing && (
        <div className="mt-8 rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-base font-semibold text-[#121C28]">
            Manage Subscription
          </h3>
          <p className="mt-1 text-sm text-[#737686]">
            Use the Stripe customer portal to update your payment method, view
            invoices, and manage your subscription.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            isLoading={isLoading === "portal"}
            onClick={handlePortal}
          >
            Open Billing Portal
          </Button>
        </div>
      )}

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          setTargetPlanId(null);
        }}
        currentPlan={currentPlanData}
        targetPlan={plans.find((p) => p.id === targetPlanId) || null}
        onConfirm={handleConfirmUpgrade}
        isLoading={isLoading === "upgrade"}
      />
    </div>
  );
}
