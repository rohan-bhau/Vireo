"use client";

import type { TaskPriority } from "@/store/taskApi";

const PRIORITY_CONFIG: Record<TaskPriority, { icon: string; color: string; bg: string; label: string }> = {
  highest: { icon: "↑↑", color: "#FF5630", bg: "#FFEBE6", label: "Highest" },
  high: { icon: "↑", color: "#FF8F5E", bg: "#FFF0E6", label: "High" },
  medium: { icon: "-", color: "#FFAB00", bg: "#FFF8E6", label: "Medium" },
  low: { icon: "↓", color: "#36B37E", bg: "#E8F5E9", label: "Low" },
  lowest: { icon: "↓↓", color: "#57D9A3", bg: "#E8F5E9", label: "Lowest" },
};

export function PriorityIcon({ priority, size = "sm" }: { priority: string; size?: "sm" | "md" }) {
  const config = PRIORITY_CONFIG[priority as TaskPriority] || PRIORITY_CONFIG.medium;
  const dims = size === "sm" ? "h-4 w-4 text-[10px]" : "h-5 w-5 text-xs";
  return (
    <span
      className={`inline-flex items-center justify-center rounded ${dims} font-bold`}
      style={{ color: config.color, backgroundColor: config.bg }}
      title={config.label}
    >
      {config.icon}
    </span>
  );
}
