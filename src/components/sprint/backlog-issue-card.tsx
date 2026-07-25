"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/store/taskApi";
import type { Epic } from "@/store/epicApi";
import type { Sprint } from "@/store/sprintApi";
import { IssueTypeIcon } from "@/components/tasks/issue-type-icon";
import { PriorityIcon } from "@/components/tasks/priority-icon";
import { EpicColorBar } from "./epic-color-bar";
import { IssueQuickMenu } from "./issue-quick-menu";
import { clsx } from "clsx";
import { GripVertical, MoreHorizontal } from "lucide-react";

interface BacklogIssueCardProps {
  task: Task;
  parentEpic?: Epic | null;
  sprints?: Sprint[];
  projectId?: string;
  workspaceId?: string;
  onClick?: () => void;
  isDragOverlay?: boolean;
}

export function BacklogIssueCard({ task, parentEpic, sprints, projectId, workspaceId, onClick, isDragOverlay }: BacklogIssueCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.taskKey,
    data: { task, parentEpic: parentEpic || null, sprintId: task.sprintId },
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.3 : 1,
      };

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={clsx(
        "group relative flex items-start gap-2 px-4 py-2.5 text-sm transition-colors",
        "hover:bg-[#F4F5F7] border-b border-[#EBECF0] last:border-b-0",
        isDragOverlay && "rounded-lg bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[#DFE1E6]",
        isDragging && "z-10"
      )}
      onClick={onClick}
    >
      {parentEpic && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] flex-shrink-0"
          style={{ backgroundColor: parentEpic.color }}
        />
      )}

      <div
        {...listeners}
        {...attributes}
        className="mt-0.5 flex-shrink-0 text-[#C3C6D7] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex items-center gap-1.5 mt-0.5 flex-shrink-0">
        <IssueTypeIcon type={task.type} size="sm" />
      </div>

      <span className="text-[11px] font-mono font-medium text-[#0065FF] w-[72px] flex-shrink-0 mt-0.5 select-none">
        {task.taskKey}
      </span>

      <span
        className={clsx(
          "flex-1 min-w-0 truncate text-[#172B4D] select-none",
          task.status === "done" && "line-through text-[#8993A4]"
        )}
      >
        {task.title}
      </span>

      <div className="flex items-center gap-2 flex-shrink-0 select-none">
        {task.storyPoints && (
          <span className="rounded bg-[#F4F5F7] px-1.5 py-0.5 text-[11px] font-medium text-[#5E6C84] leading-none whitespace-nowrap">
            {task.storyPoints}
          </span>
        )}

        <PriorityIcon priority={task.priority} size="sm" />

        {task.assignee && (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0065FF] text-[9px] font-semibold text-white flex-shrink-0"
            title={task.assignee}
          >
            {task.assignee.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="rounded p-0.5 text-[#5E6C84] opacity-0 group-hover:opacity-100 hover:bg-[#EBECF0] transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <IssueQuickMenu
              task={task}
              sprints={sprints}
              projectId={projectId}
              workspaceId={workspaceId}
              onClose={() => setShowMenu(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
