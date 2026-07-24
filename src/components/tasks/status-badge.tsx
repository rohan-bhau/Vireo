"use client";

import type { TaskStatus } from "@/store/taskApi";

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: "To Do", color: "#42526E", bg: "#F1F2F6" },
  in_progress: { label: "In Progress", color: "#0052CC", bg: "#E8F0FE" },
  in_review: { label: "In Review", color: "#FFAB00", bg: "#FFF8E6" },
  done: { label: "Done", color: "#36B37E", bg: "#E8F5E9" },
};

export function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) {
  const config = STATUS_CONFIG[status as TaskStatus] || STATUS_CONFIG.todo;
  const dims = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium ${dims}`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}
