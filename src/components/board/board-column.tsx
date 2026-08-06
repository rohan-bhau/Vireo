"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    isOver: isDropOver,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const wipExceeded = column.wipLimit !== null && tasks.length > column.wipLimit;
  const wipWarning = column.wipLimit !== null && tasks.length === column.wipLimit;

  const subtaskMap = useMemo(() => {
    const map = new Map<string, Task[]>();
    const subtasks = tasks.filter((t) => t.parentTask);
    for (const s of subtasks) {
      const existing = map.get(s.parentTask!) || [];
      existing.push(s);
      map.set(s.parentTask!, existing);
    }
    return map;
  }, [tasks]);

  const orphanSubtasks = useMemo(() => tasks.filter((t) => t.parentTask && !subtaskMap.has(t.parentTask!)), [tasks, subtaskMap]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={clsx(
        "flex w-72 max-sm:w-64 flex-shrink-0 flex-col rounded-lg bg-bg-light border border-border-light/60",
        isDropOver && "ring-2 ring-primary/30",
        wipExceeded && "ring-2 ring-danger/30",
        isDragging && "shadow-xl opacity-90 cursor-grabbing"
      )}
    >
      <div
        className="flex items-center justify-between px-3 py-3 min-h-[44px] border-b border-border-light/40 cursor-grab active:cursor-grabbing touch-none"
        {...listeners}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <svg className="h-3.5 w-3.5 flex-shrink-0 text-text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 6h.01M16 6h.01M8 12h.01M16 12h.01M8 18h.01M16 18h.01" />
          </svg>
          <div className={clsx(
            "h-2 w-2 rounded-full flex-shrink-0",
            column.name.toLowerCase().includes("done") || column.name.toLowerCase().includes("complete")
              ? "bg-success"
              : column.name.toLowerCase().includes("progress")
              ? "bg-primary"
              : column.name.toLowerCase().includes("review")
              ? "bg-warning"
              : "bg-text-placeholder"
          )} />
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wide">{column.name}</h3>
          <span className="rounded bg-bg-neutral px-1.5 py-0.5 text-[11px] font-medium text-text-tertiary flex-shrink-0">
            {tasks.length}
          </span>
          {column.wipLimit !== null && (
            <span className={clsx(
              "text-[11px] font-medium flex-shrink-0",
              wipExceeded ? "text-danger" : wipWarning ? "text-warning" : "text-text-tertiary"
            )}>
              / {column.wipLimit}
            </span>
          )}
        </div>
      </div>

      <SortableContext items={tasks.map((t) => t.taskKey)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto px-2 py-2 min-h-[60px]">
          {tasks.filter((t) => !t.parentTask).map((task) => (
            <div key={task.taskKey}>
              <IssueCard task={task} onClick={() => onTaskClick(task.taskKey)} />
              {subtaskMap.get(task.taskKey)?.map((sub) => (
                <div key={sub.taskKey} className="ml-3 mt-1.5">
                  <IssueCard task={sub} onClick={() => onTaskClick(sub.taskKey)} />
                </div>
              ))}
            </div>
          ))}
          {orphanSubtasks.map((task) => (
            <IssueCard key={task.taskKey} task={task} onClick={() => onTaskClick(task.taskKey)} />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="mb-2 h-8 w-8 text-text-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <p className="text-xs text-text-tertiary">Drop issues here</p>
            </div>
          )}
        </div>
      </SortableContext>

      <div className="px-2 pb-2">
        <button
          onClick={() => onCreateTask(column.id)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-text-tertiary transition-colors hover:bg-bg-neutral hover:text-text-primary"
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
