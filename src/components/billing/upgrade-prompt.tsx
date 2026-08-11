"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

interface UpgradePromptProps {
  workspaceId: string;
  title?: string;
  message?: string;
}

export function UpgradePrompt({
  workspaceId,
  title = "Available on Pro and Enterprise",
  message = "Upgrade your workspace plan to unlock this feature.",
}: UpgradePromptProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-[#C3C6D7]/30 bg-surface p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF4FF]">
          <Lock className="h-6 w-6 text-[#2563EB]" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-text">{title}</h3>
        <p className="mt-1.5 text-sm text-text-secondary">{message}</p>
        <Link
          href={`/w/${workspaceId}/settings/billing`}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#004AC6]"
        >
          View plans &amp; upgrade
        </Link>
      </div>
    </div>
  );
}
