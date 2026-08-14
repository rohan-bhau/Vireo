"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { IssueCard } from "./issue-card";
import type { Task } from "@/store/taskApi";
import type { WorkspaceMember } from "@/store/workspaceApi";

interface SwimlaneRowProps {
  name: string;
  tasks: Task[];
  columns: { id: string; name: string }[];
  onTaskClick: (taskKey: string) => void;
  onAssigneeChange?: (taskKey: string, userId: string | null) => void;
  members?: WorkspaceMember[];
  membersMap?: Record<string, string>;
  defaultOpen?: boolean;
}

export function SwimlaneRow({ name, tasks, columns, onTaskClick, onAssigneeChange, members = [], membersMap = {}, defaultOpen = true }: SwimlaneRowProps) {
  const [collapsed, setCollapsed] = useState(!defaultOpen);

  if (tasks.length === 0 && collapsed) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={clsx(
          "flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-[#42526E] uppercase tracking-wide",
          "hover:bg-[#F4F5F7] rounded-[3px] transition-colors"
        )}
      >
        <svg
          className={clsx("h-3 w-3 text-[#737686] transition-transform", collapsed && "-rotate-90")}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {name}
        <span className="ml-auto text-[10px] text-[#737686] font-normal normal-case">
          {tasks.length} {tasks.length === 1 ? "issue" : "issues"}
        </span>
      </button>
      {!collapsed && (
        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 mt-2">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.columnId === col.id || t.status === col.id);
            return (
              <div key={col.id} className="flex w-72 flex-shrink-0 flex-col">
                <SortableContext items={colTasks.map((t) => t.taskKey)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 min-h-[40px]">
                    {colTasks.map((task) => (
                      <IssueCard
                        key={task.taskKey}
                        task={task}
                        onClick={() => onTaskClick(task.taskKey)}
                        assigneeName={membersMap[task.assignee || ""]}
                        members={members}
                        onAssigneeChange={onAssigneeChange?.bind(null, task.taskKey)}
                      />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="flex items-center justify-center h-10 rounded border border-dashed border-[#DFE1E6] text-[11px] text-[#737686]">
                        Drop here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
