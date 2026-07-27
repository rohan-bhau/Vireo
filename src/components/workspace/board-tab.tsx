"use client";

import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";
import { BoardView } from "@/components/board/board-view";
import { SkeletonBoardColumn } from "@/components/ui/skeleton";

interface BoardTabProps {
  workspaceId: string;
}

export function BoardTab({ workspaceId }: BoardTabProps) {
  const { data: projects = [], isLoading } = useGetWorkspaceProjectsQuery(workspaceId);

  if (isLoading) {
    return (
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        <SkeletonBoardColumn />
        <SkeletonBoardColumn />
        <SkeletonBoardColumn />
        <SkeletonBoardColumn />
      </div>
    );
  }

  const firstProject = projects[0];

  if (!firstProject) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          <p className="mt-4 text-sm font-medium text-text-tertiary">No projects yet</p>
          <p className="mt-1 text-xs text-text-tertiary">Create a project to start using the board</p>
        </div>
      </div>
    );
  }

  return (
    <BoardView
      projectId={firstProject.id}
      workspaceId={workspaceId}
    />
  );
}
