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
  lowest: "text-priority-lowest",
  low: "text-priority-low",
  medium: "text-priority-medium",
  high: "text-priority-high",
  highest: "text-priority-highest",
};

const EPIC_COLORS = [
  "#4F46E5", "#7C3AED", "#0052CC", "#059669",
  "#D97706", "#DE350B", "#DB2777", "#00B8D9",
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
    opacity: isDragging ? 0.4 : 1,
  };

  const epicIndex = task.labels.filter((l) => l.startsWith("epic:")).length > 0
    ? task.labels.findIndex((l) => l.startsWith("epic:"))
    : -1;
  const epicColor = epicIndex >= 0 ? EPIC_COLORS[epicIndex % EPIC_COLORS.length] : null;

  const isFlagged = task.labels.includes("flagged");
  const isDone = task.status === "done";
  const isSubtask = task.type === "subtask";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        "relative cursor-pointer rounded-lg bg-surface text-left shadow-card border border-border-light hover:border-primary/40 hover:shadow-card-hover transition-all duration-150 touch-none select-none group",
        isOver && !isDragging && "border-t-2 border-t-primary",
        isDone && "opacity-75"
      )}
    >
      {epicColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
          style={{ backgroundColor: epicColor }}
        />
      )}
      <div className={clsx("flex items-center gap-1.5", isSubtask ? "mb-1" : "mb-1.5")}>
        <span className="text-xs leading-none" title={task.type}>{TYPE_ICONS[task.type] || "☐"}</span>
        <span className={clsx("font-mono font-medium", isSubtask ? "text-[10px] text-text-placeholder" : "text-[11px] text-text-tertiary")}>
          {task.taskKey}
        </span>
        <span className={clsx(isSubtask ? "text-[10px]" : "text-[11px]", PRIORITY_COLORS[task.priority] || "text-text-tertiary")} title={task.priority}>
          {PRIORITY_ICONS[task.priority] || ""}
        </span>
        {isFlagged && (
          <span className="text-danger text-[11px]" title="Flagged">🚩</span>
        )}
        {task.storyPoints && (
          <span className="ml-auto rounded bg-bg-light px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
            {task.storyPoints}
          </span>
        )}
      </div>
      <p className={clsx(
        isSubtask ? "text-xs" : "text-sm",
        "font-medium text-text-primary line-clamp-2",
        isDone && "line-through text-text-placeholder"
      )}>
        {task.title}
      </p>
      {task.dueDate && (
        <p className={clsx(
          "mt-1 text-[10px]",
          new Date(task.dueDate) < new Date() && !isDone
            ? "text-danger font-medium"
            : "text-text-tertiary"
        )}>
          {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
      <div className={clsx("flex items-center gap-2", isSubtask ? "mt-1.5" : "mt-2")}>
        <div className="flex flex-1 gap-1 overflow-hidden flex-wrap">
          {task.labels.filter((l) => !l.startsWith("epic:")).slice(0, 2).map((label) => (
            <span
              key={label}
              className="rounded bg-primary-bg px-1.5 py-0.5 text-[10px] font-medium text-primary truncate max-w-[80px]"
            >
              {label}
            </span>
          ))}
          {task.labels.filter((l) => !l.startsWith("epic:")).length > 2 && (
            <span className="text-[10px] text-text-tertiary">
              +{task.labels.filter((l) => !l.startsWith("epic:")).length - 2}
            </span>
          )}
        </div>
        {task.assignee && (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white flex-shrink-0"
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
    <div className="rounded-lg bg-surface p-3 shadow-lg border border-primary/30 w-72 opacity-90">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">{TYPE_ICONS[task.type] || "☐"}</span>
        <span className="text-[11px] font-mono font-medium text-text-tertiary">{task.taskKey}</span>
      </div>
      <p className="text-sm font-medium text-text-primary">{task.title}</p>
    </div>
  );
}

export const TYPE_ICONS_MAP = TYPE_ICONS;
export const PRIORITY_COLORS_MAP = PRIORITY_COLORS;
