"use client";

import { Puzzle } from "lucide-react";
import Link from "next/link";

export default function AdminCustomFieldsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#121C28]">Custom Fields</h1>
        <p className="mt-1 text-sm text-[#737686]">
          Create and manage global custom fields for issues across all projects.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-24 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <Puzzle className="mb-4 h-12 w-12 text-[#C3C6D7]" />
        <h3 className="text-base font-semibold text-[#121C28]">Coming in a future update</h3>
        <p className="mt-1 max-w-md text-center text-sm text-[#737686]">
          Global custom fields will let you add custom data fields to issues across all projects in your organization.
        </p>
        <Link
          href="/admin"
          className="mt-6 text-sm font-medium text-[#2563EB] hover:text-[#1d4ed8]"
        >
          &larr; Back to administration
        </Link>
      </div>
    </div>
  );
}
