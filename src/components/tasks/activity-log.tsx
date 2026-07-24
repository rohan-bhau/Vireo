"use client";

import { useState } from "react";
import { useGetTaskActivityQuery, type ActivityItem } from "@/store/taskApi";
import { useGetMembersQuery } from "@/store/workspaceApi";

interface ActivityLogProps {
  taskKey: string;
  workspaceId?: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function actionLabel(item: ActivityItem): string {
  switch (item.action) {
    case "created":
      return "created this task";
    case "status_changed":
      return `changed status from ${item.oldValue || "none"} to ${item.newValue || "none"}`;
    case "assigned":
      return `changed assignee from ${item.oldValue || "unassigned"} to ${item.newValue || "unassigned"}`;
    case "commented":
      return "commented on this task";
    case "attachment_added":
      return `added attachment`;
    case "attachment_removed":
      return `removed attachment`;
    case "updated":
      return `updated ${item.field || "task"} from ${item.oldValue || ""} to ${item.newValue || ""}`;
    default:
      return item.action;
  }
}

function actionIcon(action: string): string {
  switch (action) {
    case "created": return "+";
    case "status_changed": return "↔";
    case "assigned": return "→";
    case "commented": return "💬";
    case "attachment_added": return "📎";
    case "attachment_removed": return "✕";
    default: return "•";
  }
}

type FilterType = "all" | "field" | "status" | "comment";

export function ActivityLog({ taskKey, workspaceId }: ActivityLogProps) {
  const { data: activity, isLoading } = useGetTaskActivityQuery(taskKey);
  const { data: members } = useGetMembersQuery(workspaceId || "", { skip: !workspaceId });

  function getUserName(userId: string): string {
    const member = members?.find((m) => m.userId === userId);
    return member?.user?.name || userId;
  }
  const [filter, setFilter] = useState<FilterType>("all");

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-text-placeholder">Loading activity...</div>;
  }

  if (!activity || activity.length === 0) {
    return <div className="py-4 text-center text-sm text-text-placeholder">No activity recorded yet.</div>;
  }

  const filtered = activity.filter((item) => {
    if (filter === "all") return true;
    if (filter === "field") return item.action === "updated" || item.action === "assigned";
    if (filter === "status") return item.action === "status_changed" || item.action === "created";
    if (filter === "comment") return item.action === "commented";
    return true;
  });

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "field", label: "Field changes" },
    { value: "status", label: "Status changes" },
    { value: "comment", label: "Comments" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-text">History</h3>
      <div className="flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
              filter === f.value
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-bg-light"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border-light" />
        {filtered.map((item) => (
          <div key={item._id} className="relative flex gap-3 pb-3">
            <div className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface text-[11px] text-text-placeholder border border-border-light">
              {actionIcon(item.action)}
            </div>
            <div className="flex flex-1 flex-col gap-0.5 pt-0.5">
              <p className="text-xs text-text-secondary">
                <span className="font-medium text-text">{getUserName(item.actorId)}</span>{" "}
                {actionLabel(item)}
              </p>
              <span className="text-[11px] text-text-placeholder">{timeAgo(item.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}