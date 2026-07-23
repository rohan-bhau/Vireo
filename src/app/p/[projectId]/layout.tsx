"use client";

import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import { AppLayout } from "@/components/layout/app-layout";
import { ProjectTabs } from "@/components/projects/project-tabs";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project, isLoading } = useGetProjectQuery(projectId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
          <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        {project && (
          <ProjectTabs
            projectId={project.id}
            projectName={project.name}
            workspaceId={project.workspaceId}
            template={project.template}
          />
        )}
      </div>
      {children}
    </AppLayout>
  );
}
