"use client";

import { useState } from "react";

interface ActivityEntry {
  _id: string;
  actorName: string;
  action: string;
  entityType: string;
  entityName: string;
  createdAt: string;
}

interface ActivityStreamProps {
  activity: ActivityEntry[];
}

const actionLabels: Record<string, string> = {
  workspace_created: "created workspace",
  project_created: "created project",
  task_created: "created task",
  task_updated: "updated task",
  member_added: "added member",
  member_removed: "removed member",
  sprint_started: "started sprint",
  sprint_completed: "completed sprint",
};

export function ActivityStream({ activity }: ActivityStreamProps) {
  const [now] = useState(() => Date.now());

  if (activity.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-[#737686]">
        No recent activity
      </div>
    );
  }

  function timeAgo(dateStr: string, now: number) {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <div className="divide-y divide-[#C3C6D7]/10 max-h-64 overflow-y-auto">
      {activity.slice(0, 10).map((entry) => (
        <div key={entry._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F9FF]">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-[9px] font-bold text-[#004AC6]">
            {entry.actorName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#434655]">
              <span className="font-semibold text-[#121C28]">{entry.actorName}</span>{" "}
              {actionLabels[entry.action] || entry.action}{" "}
              {entry.entityName && <span className="text-[#737686]">{entry.entityName}</span>}
            </p>
          </div>
          <span className="text-[10px] text-[#737686] shrink-0">{timeAgo(entry.createdAt, now)}</span>
        </div>
      ))}
    </div>
  );
}
