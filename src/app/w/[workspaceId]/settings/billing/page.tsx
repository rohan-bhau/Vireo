"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetPortalSessionMutation,
} from "@/store/billingApi";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function handleUpgrade(planId: "pro" | "enterprise") {
    setError(null);
    setIsLoading(planId);
    try {
      const result = await createCheckoutSession({
        workspaceId,
        planId,
        successUrl: `${window.location.origin}/w/${workspaceId}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/w/${workspaceId}/settings/billing?canceled=true`,
      }).unwrap();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create checkout session");
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
    } catch (err: any) {
      setError(err?.data?.message || "Failed to cancel subscription");
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
    } catch (err: any) {
      setError(err?.data?.message || "Failed to resume subscription");
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
    } catch (err: any) {
      setError(err?.data?.message || "Failed to open billing portal");
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

      <div className="flex gap-2 mb-6 border-b border-[#C3C6D7]/20 pb-4">
        <Link
          href={`/w/${workspaceId}/settings`}
          className="rounded-lg px-4 py-2 text-sm font-medium text-[#434655] hover:bg-[#F8F9FF] transition-colors"
        >
          General Details
        </Link>
        <Link
          href={`/w/${workspaceId}/settings`}
          className="rounded-lg px-4 py-2 text-sm font-medium text-[#434655] hover:bg-[#F8F9FF] transition-colors"
        >
          Members
        </Link>
        <Link
          href={`/w/${workspaceId}/settings/billing`}
          className="rounded-lg px-4 py-2 text-sm font-medium bg-[#EEF4FF] text-[#004AC6] transition-colors"
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

      {subscription && (
        <div className="mb-8 rounded-xl bg-[#F8F9FF] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
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
            <div className="flex gap-3">
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
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all ${
                  isCurrentPlan
                    ? "border-[#2563EB] ring-1 ring-[#2563EB]"
                    : "border-[#C3C6D7]/30 hover:border-[#2563EB]/50"
                } ${isTrialing && plan.id === "pro" ? "border-[#2563EB] ring-1 ring-[#2563EB]" : ""}`}
              >
                {plan.id === "pro" && !isCurrentPlan && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#121C28]">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#737686]">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-[#121C28]">
                    {plan.price === 0
                      ? "Free"
                      : `$${plan.price / 100}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="ml-1 text-sm text-[#737686]">
                      /user/mo
                    </span>
                  )}
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#434655]">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2563EB]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id !== "free" && (
                  <Button
                    onClick={() =>
                      isDisabled ? null : handleUpgrade(plan.id as "pro" | "enterprise")
                    }
                    isLoading={isLoading === plan.id}
                    disabled={!!isDisabled}
                    className="w-full"
                  >
                    {isCurrentPlan
                      ? "Current Plan"
                      : isTrialing && plan.id === "pro"
                      ? "Currently Trial"
                      : subscription?.plan === "free"
                      ? "Upgrade"
                      : "Switch"}
                  </Button>
                )}
                {plan.id === "free" && (
                  <div className="w-full rounded-lg bg-[#F8F9FF] px-4 py-2.5 text-center text-sm font-medium text-[#737686]">
                    {isCurrentPlan ? "Current Plan" : "Free"}
                  </div>
                )}
              </div>
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
    </div>
  );
}
