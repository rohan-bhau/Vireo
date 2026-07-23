"use client";

import type { Project } from "@/store/projectApi";

export function ProjectSettingsIssueTypes({ project }: { project: Project }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">Issue types</h2>
        <p className="text-sm text-[#737686]">Enable or disable issue types for this project</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-16 text-center">
        <h3 className="text-base font-semibold text-[#121C28]">Issue type configuration coming soon</h3>
        <p className="mt-1 text-sm text-[#737686]">This section will be built in a follow-up phase</p>
      </div>
    </div>
  );
}
