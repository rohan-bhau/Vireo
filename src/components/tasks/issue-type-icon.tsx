"use client";

import type { TaskType } from "@/store/taskApi";

const TYPE_CONFIG: Record<TaskType, { icon: string; color: string; bg: string; label: string }> = {
  epic: { icon: "★", color: "#8777D9", bg: "#F3F0FF", label: "Epic" },
  story: { icon: "📄", color: "#36B37E", bg: "#E8F5E9", label: "Story" },
  task: { icon: "☐", color: "#0052CC", bg: "#E8F0FE", label: "Task" },
  bug: { icon: "🐛", color: "#FF5630", bg: "#FFEBE6", label: "Bug" },
  subtask: { icon: "↳", color: "#42526E", bg: "#F1F2F6", label: "Sub-task" },
};

export function IssueTypeIcon({ type, size = "sm" }: { type: string; size?: "sm" | "md" | "lg" }) {
  const config = TYPE_CONFIG[type as TaskType] || TYPE_CONFIG.task;
  const dims = size === "sm" ? "h-4 w-4 text-xs" : size === "md" ? "h-5 w-5 text-sm" : "h-6 w-6 text-base";
  return (
    <span
      className={`inline-flex items-center justify-center rounded ${dims}`}
      style={{ color: config.color, backgroundColor: config.bg }}
      title={config.label}
    >
      {config.icon}
    </span>
  );
}
