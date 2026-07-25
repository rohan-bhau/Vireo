"use client";

import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import { BoardView } from "@/components/board/board-view";

export default function BoardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project } = useGetProjectQuery(projectId);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <BoardView
      projectId={projectId}
      workspaceId={project.workspaceId}
    />
  );
}
