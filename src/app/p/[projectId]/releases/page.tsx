"use client";

import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";

export default function ReleasesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project } = useGetProjectQuery(projectId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#121C28]">Releases</h1>
        <p className="mt-1 text-sm text-[#737686]">Version tracking for {project?.name || "..."}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-24 text-center">
        <h3 className="text-base font-semibold text-[#121C28]">No releases yet</h3>
        <p className="mt-1 text-sm text-[#737686]">Create versions to track when issues are shipped</p>
      </div>
    </div>
  );
}
