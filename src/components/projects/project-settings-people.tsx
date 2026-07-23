"use client";

import type { Project } from "@/store/projectApi";

export function ProjectSettingsPeople({ project }: { project: Project }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">People / Access</h2>
        <p className="text-sm text-[#737686]">Manage who has access to this project and their roles</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-16 text-center">
        <svg className="mb-3 h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
        <h3 className="text-base font-semibold text-[#121C28]">Member management coming soon</h3>
        <p className="mt-1 text-sm text-[#737686]">This section will be built in a follow-up phase</p>
      </div>
    </div>
  );
}
