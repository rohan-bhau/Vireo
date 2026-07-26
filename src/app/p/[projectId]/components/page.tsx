"use client";

import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import { ComponentManager } from "@/components/projects/component-manager";

export default function ComponentsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project } = useGetProjectQuery(projectId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">Components</h1>
        <p className="mt-1 text-sm text-text-placeholder">Project components for {project?.name || "..."}</p>
      </div>
      <ComponentManager projectId={projectId} workspaceId={project?.workspaceId || ""} />
    </div>
  );
}
