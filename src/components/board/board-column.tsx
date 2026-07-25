"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { IssueCard } from "./issue-card";
import type { Task } from "@/store/taskApi";

interface ColumnData {
  id: string;
  name: string;
  wipLimit: number | null;
}

interface BoardColumnProps {
  column: ColumnData;
  tasks: Task[];
  onTaskClick: (taskKey: string) => void;
  onCreateTask: (columnId: string) => void;
  isOver?: boolean;
}

export function BoardColumn({ column, tasks, onTaskClick, onCreateTask, isOver }: BoardColumnProps) {
  const { setNodeRef, isOver: isDropOver } = useDroppable({ id: column.id });

  const wipExceeded = column.wipLimit !== null && tasks.length > column.wipLimit;
  const wipWarning = column.wipLimit !== null && tasks.length === column.wipLimit;

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex w-72 max-sm:w-64 flex-shrink-0 flex-col rounded-[3px] bg-[#F4F5F7]",
        isDropOver && "ring-2 ring-[#2563EB]/40",
        wipExceeded && "ring-2 ring-[#DC2626]/30"
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5 min-h-[44px]">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={clsx(
            "h-2 w-2 rounded-full flex-shrink-0",
            column.name.toLowerCase().includes("done") || column.name.toLowerCase().includes("complete")
              ? "bg-[#059669]"
              : column.name.toLowerCase().includes("progress")
              ? "bg-[#2563EB]"
              : column.name.toLowerCase().includes("review")
              ? "bg-[#D97706]"
              : "bg-[#C3C6D7]"
          )} />
          <h3 className="text-xs font-semibold text-[#172B4D] truncate">{column.name}</h3>
          <span className="rounded bg-[#DFE1E6] px-1.5 py-0.5 text-[11px] font-medium text-[#42526E] flex-shrink-0">
            {tasks.length}
          </span>
          {column.wipLimit !== null && (
            <span className={clsx(
              "text-[11px] font-medium flex-shrink-0",
              wipExceeded ? "text-[#DC2626]" : wipWarning ? "text-[#D97706]" : "text-[#737686]"
            )}>
              / {column.wipLimit}
            </span>
          )}
        </div>
      </div>

      <SortableContext items={tasks.map((t) => t.taskKey)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3 min-h-[60px]">
          {tasks.map((task) => (
            <IssueCard
              key={task.taskKey}
              task={task}
              onClick={() => onTaskClick(task.taskKey)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="mb-2 h-8 w-8 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <p className="text-xs text-[#737686]">Drop issues here</p>
            </div>
          )}
        </div>
      </SortableContext>

      <div className="px-3 pb-3">
        <button
          onClick={() => onCreateTask(column.id)}
          className="flex w-full items-center gap-2 rounded-[3px] px-3 py-2 text-xs font-medium text-[#737686] transition-colors hover:bg-[#DFE1E6] hover:text-[#172B4D]"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create issue
        </button>
      </div>
    </div>
  );
}
