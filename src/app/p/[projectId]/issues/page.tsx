"use client";

import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";

export default function IssuesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project } = useGetProjectQuery(projectId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#121C28]">Issues</h1>
        <p className="mt-1 text-sm text-[#737686]">Full issue list for {project?.name || "..."}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-24 text-center">
        <svg className="mb-3 h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <h3 className="text-base font-semibold text-[#121C28]">Issue navigator</h3>
        <p className="mt-1 text-sm text-[#737686]">Full issue table with search, filters, and bulk actions. Coming soon.</p>
      </div>
    </div>
  );
}
