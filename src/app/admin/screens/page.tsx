"use client";

import { Monitor } from "lucide-react";
import Link from "next/link";

export default function AdminScreensPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#121C28]">Screens</h1>
        <p className="mt-1 text-sm text-[#737686]">
          Configure which fields appear on each screen per issue type (Create, Edit, View).
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-24 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <Monitor className="mb-4 h-12 w-12 text-[#C3C6D7]" />
        <h3 className="text-base font-semibold text-[#121C28]">Screen Configurations</h3>
        <p className="mt-1 max-w-md text-center text-sm text-[#737686]">
          Screen schemes let you define which fields appear when users create, edit, or view an issue.
          This feature will be available in a future update.
        </p>
        <div className="mt-8 grid w-full max-w-lg gap-3">
          {["Create Issue", "Edit Issue", "View Issue"].map((screen) => (
            <div
              key={screen}
              className="flex items-center justify-between rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] px-4 py-3"
            >
              <span className="text-sm font-medium text-[#434655]">{screen}</span>
              <span className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-medium text-[#004AC6]">Default</span>
            </div>
          ))}
        </div>
        <Link href="/admin" className="mt-8 text-sm font-medium text-[#2563EB] hover:text-[#1d4ed8]">
          &larr; Back to administration
        </Link>
      </div>
    </div>
  );
}
