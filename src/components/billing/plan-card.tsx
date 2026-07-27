"use client";

import { Button } from "@/components/ui/button";

interface Plan {
  id: "free" | "pro" | "enterprise";
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  memberLimit: number;
  projectLimit: number;
  features: string[];
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isTrialing: boolean;
  isDisabled: boolean;
  onUpgrade: (planId: "pro" | "enterprise") => void;
  isLoading: boolean;
}

export function PlanCard({
  plan,
  isCurrentPlan,
  isTrialing,
  isDisabled,
  onUpgrade,
  isLoading,
}: PlanCardProps) {
  const showPopular = plan.id === "pro" && !isCurrentPlan;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all ${
        isCurrentPlan || (isTrialing && plan.id === "pro")
          ? "border-[#2563EB] ring-1 ring-[#2563EB]"
          : "border-[#C3C6D7]/30 hover:border-[#2563EB]/50"
      }`}
    >
      {showPopular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Popular
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#121C28]">{plan.name}</h3>
        <p className="mt-1 text-sm text-[#737686]">{plan.description}</p>
      </div>
      <div className="mb-6">
        <span className="text-3xl font-bold text-[#121C28]">
          {plan.price === 0 ? "Free" : `$${plan.price / 100}`}
        </span>
        {plan.price > 0 && (
          <span className="ml-1 text-sm text-[#737686]">/user/mo</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      {plan.id !== "free" && (
        <Button
          onClick={() => (isDisabled ? null : onUpgrade(plan.id as "pro" | "enterprise"))}
          isLoading={isLoading}
          disabled={!!isDisabled}
          className="w-full"
        >
          {isCurrentPlan
            ? "Current Plan"
            : isTrialing && plan.id === "pro"
              ? "Currently Trial"
              : "Upgrade"}
        </Button>
      )}
      {plan.id === "free" && (
        <div className="w-full rounded-lg bg-[#F8F9FF] px-4 py-2.5 text-center text-sm font-medium text-[#737686]">
          {isCurrentPlan ? "Current Plan" : "Free"}
        </div>
      )}
    </div>
  );
}
