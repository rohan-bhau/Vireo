"use client";

import type { Task } from "@/store/taskApi";

interface RecentlyCreatedProps {
  tasks: Task[];
}

export function RecentlyCreated({ tasks }: RecentlyCreatedProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-[#737686]">
        No recently created issues
      </div>
    );
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  const typeColors: Record<string, string> = {
    task: "bg-blue-50 text-blue-700",
    bug: "bg-red-50 text-red-700",
    epic: "bg-purple-50 text-purple-700",
    story: "bg-green-50 text-green-700",
    subtask: "bg-gray-50 text-gray-500",
  };

  return (
    <div className="divide-y divide-[#C3C6D7]/10">
      {tasks.slice(0, 8).map((task) => (
        <div key={task._id} className="flex items-center gap-2 px-4 py-2 hover:bg-[#F8F9FF]">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${typeColors[task.type] || "bg-gray-50 text-gray-500"}`}>
            {task.type}
          </span>
          <span className="text-xs text-[#434655] truncate flex-1">{task.title}</span>
          <span className="text-[10px] text-[#737686] shrink-0">{timeAgo(task.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}
