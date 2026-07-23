"use client";

import type { Project } from "@/store/projectApi";

export function ProjectSettingsPermissions({ project }: { project: Project }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">Permissions</h2>
        <p className="text-sm text-[#737686]">Control what project roles can do</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-16 text-center">
        <svg className="mb-3 h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <h3 className="text-base font-semibold text-[#121C28]">Permission management coming soon</h3>
        <p className="mt-1 text-sm text-[#737686]">This section will be built alongside the roles & permissions feature</p>
      </div>
    </div>
  );
}
