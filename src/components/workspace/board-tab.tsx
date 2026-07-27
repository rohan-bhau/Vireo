"use client";

import { useState } from "react";
import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";
import { BoardView } from "@/components/board/board-view";
import { SkeletonBoardColumn } from "@/components/ui/skeleton";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

interface BoardTabProps {
  workspaceId: string;
}

export function BoardTab({ workspaceId }: BoardTabProps) {
  const { data: projects = [], isLoading } = useGetWorkspaceProjectsQuery(workspaceId);
  const [showCreate, setShowCreate] = useState(false);

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
      <div className="flex flex-col items-center justify-center py-24">
        <svg className="h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        <p className="mt-4 text-sm font-medium text-[#121C28]">No projects yet</p>
        <p className="mt-1 text-xs text-[#737686]">Create a project to start using the board</p>
        <button
          onClick={() => setShowCreate(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create project
        </button>
        <CreateProjectDialog open={showCreate} onClose={() => setShowCreate(false)} />
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
