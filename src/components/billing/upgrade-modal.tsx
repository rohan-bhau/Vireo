"use client";

import { Dialog } from "@/components/ui/dialog";
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

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan: Plan | null;
  targetPlan: Plan | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function UpgradeModal({
  open,
  onClose,
  currentPlan,
  targetPlan,
  onConfirm,
  isLoading,
}: UpgradeModalProps) {
  if (!currentPlan || !targetPlan) return null;

  const priceDiff =
    targetPlan.price > 0 && currentPlan.price >= 0
      ? `$${(targetPlan.price - currentPlan.price) / 100}/user/mo`
      : targetPlan.price > 0
        ? `$${targetPlan.price / 100}/user/mo`
        : null;

  return (
    <Dialog open={open} onClose={onClose} title="Confirm Upgrade" className="max-w-lg">
      <div className="space-y-5">
        <p className="text-sm text-[#737686]">
          Are you sure you want to upgrade to the{" "}
          <span className="font-semibold text-[#121C28]">{targetPlan.name}</span> plan?
        </p>

        {priceDiff && (
          <div className="rounded-lg bg-[#F8F9FF] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#737686]">{currentPlan.name}</span>
              <span className="text-sm font-medium text-[#121C28]">
                {currentPlan.price === 0 ? "Free" : `$${currentPlan.price / 100}/user/mo`}
              </span>
            </div>
            <div className="my-2 border-t border-[#C3C6D7]/30" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#121C28]">{targetPlan.name}</span>
              <span className="text-sm font-semibold text-[#121C28]">
                ${targetPlan.price / 100}/user/mo
              </span>
            </div>
            <div className="mt-3 rounded-md bg-[#EEF4FF] px-3 py-2 text-center text-sm font-medium text-[#004AC6]">
              Additional cost: {priceDiff}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#C3C6D7]/30 p-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#737686]">
              {currentPlan.name}
            </p>
            <ul className="space-y-1.5">
              {currentPlan.features.slice(0, 4).map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-[#434655]">
                  <svg className="h-3 w-3 flex-shrink-0 text-[#36B37E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              {targetPlan.name}
            </p>
            <ul className="space-y-1.5">
              {targetPlan.features.slice(0, 4).map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-[#434655]">
                  <svg className="h-3 w-3 flex-shrink-0 text-[#36B37E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} isLoading={isLoading}>
            Upgrade to {targetPlan.name}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
