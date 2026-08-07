"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import type { Task } from "@/store/taskApi";
import { TypeIcon } from "@/components/tasks/type-icons";

const EPIC_COLORS = [
  "#4F46E5", "#7C3AED", "#0052CC", "#059669",
  "#D97706", "#DE350B", "#DB2777", "#00B8D9",
];

interface IssueCardProps {
  task: Task;
  onClick?: () => void;
  isOver?: boolean;
  assigneeName?: string | null;
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : "";
  return (first + second).toUpperCase();
}

export function IssueCard({ task, onClick, isOver, assigneeName }: IssueCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    isOver: dropOver,
  } = useSortable({ id: task.taskKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const epicIndex = task.labels.filter((l) => l.startsWith("epic:")).length > 0
    ? task.labels.findIndex((l) => l.startsWith("epic:"))
    : -1;
  const epicColor = epicIndex >= 0 ? EPIC_COLORS[epicIndex % EPIC_COLORS.length] : null;

  const isFlagged = task.labels.includes("flagged");
  const isDone = task.status === "done";
  const isSubtask = task.type === "subtask";
  const displayName = assigneeName || task.assignee || "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        "relative cursor-pointer rounded-lg bg-white text-left shadow-card border border-[#C3C6D7]/30 hover:border-[#2563EB]/40 hover:shadow-card-hover transition-all duration-150 touch-none select-none group p-2.5",
        dropOver && !isDragging && "border-t-2 border-t-[#2563EB]"
      )}
    >
      {epicColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
          style={{ backgroundColor: epicColor }}
        />
      )}

      <p className={clsx(
        "text-sm font-medium text-[#121C28] line-clamp-2",
        isSubtask && "text-xs ml-2",
        isDone && "line-through text-[#737686]"
      )}>
        {task.title}
      </p>

      <div className="mt-1 flex items-center gap-1">
        <TypeIcon type={task.type} className="h-3.5 w-3.5 shrink-0" />
        <span className={clsx("font-mono font-medium text-[#737686]", isSubtask ? "text-[10px]" : "text-[11px]")}>
          {task.taskKey}
        </span>
        {isFlagged && (
          <span className="text-[#FF5630] text-[11px]" title="Flagged">🚩</span>
        )}
        {task.storyPoints && (
          <span className="rounded bg-[#F4F5F7] px-1.5 py-0.5 text-[10px] font-medium text-[#737686]">
            {task.storyPoints}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          {isDone && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#36B37E] text-white" title="Done">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
          )}
          {task.assignee ? (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-semibold text-white flex-shrink-0"
              title={displayName}
            >
              {getInitials(displayName)}
            </span>
          ) : (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F4F5F7] text-[#737686] flex-shrink-0"
              title="Unassigned"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {task.dueDate && (
        <p className={clsx(
          "mt-0.5 text-[10px]",
          new Date(task.dueDate) < new Date() && !isDone
            ? "text-[#FF5630] font-medium"
            : "text-[#737686]"
        )}>
          {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
    </div>
  );
}

export function IssueCardOverlay({ task }: { task: Task }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-lg border border-[#2563EB]/30 w-72 opacity-90">
      <p className="text-sm font-medium text-[#121C28] line-clamp-2">{task.title}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <TypeIcon type={task.type} className="h-3.5 w-3.5" />
        <span className="text-[11px] font-mono font-medium text-[#737686]">{task.taskKey}</span>
      </div>
    </div>
  );
}