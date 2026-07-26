"use client";

import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import { VersionManager } from "@/components/projects/version-manager";

export default function ReleasesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project } = useGetProjectQuery(projectId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">Releases</h1>
        <p className="mt-1 text-sm text-text-placeholder">Version tracking for {project?.name || "..."}</p>
      </div>
      <VersionManager projectId={projectId} />
    </div>
  );
}
