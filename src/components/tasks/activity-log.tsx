"use client";

import { useGetTaskActivityQuery, type ActivityItem } from "@/store/taskApi";

interface ActivityLogProps {
  taskKey: string;
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
      return `changed ${item.field} from ${item.oldValue || "none"} to ${item.newValue || "none"}`;
    case "assigned":
      return `changed assignee from ${item.oldValue || "unassigned"} to ${item.newValue || "unassigned"}`;
    case "commented":
      return "commented on this task";
    case "attachment_added":
      return `added attachment: ${item.newValue || ""}`;
    case "attachment_removed":
      return `removed attachment: ${item.oldValue || ""}`;
    case "updated":
      return `updated ${item.field || "task"} from ${item.oldValue || ""} to ${item.newValue || ""}`;
    default:
      return item.action;
  }
}

function actionIcon(action: string): string {
  switch (action) {
    case "created": return "●";
    case "status_changed": return "⇄";
    case "assigned": return "→";
    case "commented": return "💬";
    case "attachment_added": return "📎";
    case "attachment_removed": return "✕";
    default: return "○";
  }
}

export function ActivityLog({ taskKey }: ActivityLogProps) {
  const { data: activity, isLoading } = useGetTaskActivityQuery(taskKey);

  if (isLoading) {
    return (
      <div className="py-4 text-center text-sm text-[#737686]">Loading activity...</div>
    );
  }

  if (!activity || activity.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-[#C3C6D7]">No activity recorded yet.</div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-[#121C28] mb-2">Activity</h3>
      <div className="relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#E5E7EF]" />
        {activity.map((item) => (
          <div key={item._id} className="relative flex gap-3 pb-3">
            <div className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-[11px] text-[#737686]">
              {actionIcon(item.action)}
            </div>
            <div className="flex flex-1 flex-col gap-0.5 pt-0.5">
              <p className="text-xs text-[#434655]">
                <span className="font-medium text-[#121C28]">{item.actorId}</span>{" "}
                {actionLabel(item)}
              </p>
              <span className="text-[11px] text-[#C3C6D7]">{timeAgo(item.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
