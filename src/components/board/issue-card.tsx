"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import type { Task } from "@/store/taskApi";

const TYPE_ICONS: Record<string, string> = {
  task: "☐",
  bug: "🐛",
  epic: "★",
  story: "📖",
  subtask: "↳",
};

const PRIORITY_ICONS: Record<string, string> = {
  lowest: "⇣",
  low: "↓",
  medium: "→",
  high: "↑",
  highest: "⇡",
};

const PRIORITY_COLORS: Record<string, string> = {
  lowest: "text-[#C3C6D7]",
  low: "text-[#737686]",
  medium: "text-[#2563EB]",
  high: "text-[#D97706]",
  highest: "text-[#DC2626]",
};

const EPIC_COLORS = [
  "#4F46E5", "#7C3AED", "#2563EB", "#059669",
  "#D97706", "#DC2626", "#DB2777", "#0891B2",
];

interface IssueCardProps {
  task: Task;
  onClick?: () => void;
  isOver?: boolean;
}

export function IssueCard({ task, onClick }: IssueCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: task.taskKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const epicIndex = task.labels.filter((l) => l.startsWith("epic:")).length > 0
    ? task.labels.findIndex((l) => l.startsWith("epic:"))
    : -1;
  const epicColor = epicIndex >= 0 ? EPIC_COLORS[epicIndex % EPIC_COLORS.length] : null;

  const isFlagged = task.labels.includes("flagged");
  const isDone = task.status === "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        "relative cursor-pointer rounded-lg bg-white p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#C3C6D7]/20 hover:border-[#2563EB]/30 hover:shadow-md transition-all touch-none select-none group",
        isOver && !isDragging && "border-t-2 border-t-[#2563EB]",
        isDone && "bg-green-50/50"
      )}
    >
      {epicColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
          style={{ backgroundColor: epicColor }}
        />
      )}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs" title={task.type}>{TYPE_ICONS[task.type] || "☐"}</span>
        <span className="text-[11px] font-mono font-medium text-[#737686]">
          {task.taskKey}
        </span>
        <span className={clsx("text-[11px]", PRIORITY_COLORS[task.priority] || "text-[#737686]")} title={task.priority}>
          {PRIORITY_ICONS[task.priority] || ""}
        </span>
        {isFlagged && (
          <span className="text-[#DC2626] text-[11px]" title="Flagged">🚩</span>
        )}
        {task.storyPoints && (
          <span className="ml-auto rounded bg-[#F1F2F6] px-1.5 py-0.5 text-[10px] font-medium text-[#737686]">
            {task.storyPoints}
          </span>
        )}
      </div>
      <p className={clsx(
        "text-sm font-medium text-[#121C28] line-clamp-2",
        isDone && "line-through text-[#737686]"
      )}>
        {task.title}
      </p>
      {task.dueDate && (
        <p className={clsx(
          "mt-1 text-[10px]",
          new Date(task.dueDate) < new Date() && !isDone
            ? "text-[#DC2626] font-medium"
            : "text-[#737686]"
        )}>
          {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 gap-1 overflow-hidden flex-wrap">
          {task.labels.filter((l) => !l.startsWith("epic:")).slice(0, 2).map((label) => (
            <span
              key={label}
              className="rounded bg-[#EEF4FF] px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB] truncate max-w-[80px]"
            >
              {label}
            </span>
          ))}
          {task.labels.filter((l) => !l.startsWith("epic:")).length > 2 && (
            <span className="text-[10px] text-[#737686]">
              +{task.labels.filter((l) => !l.startsWith("epic:")).length - 2}
            </span>
          )}
        </div>
        {task.assignee && (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-semibold text-white flex-shrink-0"
            title={task.assignee}
          >
            {task.assignee.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

export function IssueCardOverlay({ task }: { task: Task }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-lg border border-[#2563EB]/30 w-72 opacity-90">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">{TYPE_ICONS[task.type] || "☐"}</span>
        <span className="text-[11px] font-mono font-medium text-[#737686]">{task.taskKey}</span>
      </div>
      <p className="text-sm font-medium text-[#121C28]">{task.title}</p>
    </div>
  );
}

export const TYPE_ICONS_MAP = TYPE_ICONS;
export const PRIORITY_COLORS_MAP = PRIORITY_COLORS;
