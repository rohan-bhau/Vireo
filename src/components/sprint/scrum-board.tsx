"use client";

import { useRouter } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import { EpicSidebar } from "./epic-sidebar";
import { BoardView } from "@/components/board/board-view";

interface ScrumBoardProps {
  projectId: string;
  sprintId: string;
}

export function ScrumBoard({ projectId, sprintId }: ScrumBoardProps) {
  const router = useRouter();
  const { data: project } = useGetProjectQuery(projectId);

  return (
    <div className="flex h-[calc(100vh-280px)]">
      <div className="flex-1 flex flex-col min-w-0">
        <BoardView
          projectId={projectId}
          workspaceId={project?.workspaceId || ""}
          sprintId={sprintId}
          onBack={() => router.push(`/p/${projectId}/backlog`)}
        />
      </div>
      {project?.workspaceId && (
        <EpicSidebar projectId={projectId} workspaceId={project.workspaceId} />
      )}
    </div>
  );
}
