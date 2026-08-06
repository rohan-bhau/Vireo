"use client";

import { useEffect } from "react";
import { useGetWorkspaceProjectsQuery, useGetOrSeedDefaultProjectMutation } from "@/store/projectApi";
import { BoardView } from "@/components/board/board-view";
import { SkeletonBoardColumn } from "@/components/ui/skeleton";

interface BoardTabProps {
  workspaceId: string;
}

export function BoardTab({ workspaceId }: BoardTabProps) {
  const { data: projects = [], isLoading } = useGetWorkspaceProjectsQuery(workspaceId);
  const [ensureDefault, { isLoading: isEnsuring }] = useGetOrSeedDefaultProjectMutation();

  useEffect(() => {
    if (!isLoading && projects.length === 0) {
      ensureDefault(workspaceId);
    }
  }, [isLoading, projects.length, workspaceId, ensureDefault]);

  if (isLoading || isEnsuring) {
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
    return null;
  }

  return (
    <BoardView
      projectId={firstProject.id}
      workspaceId={workspaceId}
    />
  );
}
