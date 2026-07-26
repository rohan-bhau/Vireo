"use client";

import type { Task } from "@/store/taskApi";

interface AssignedToMeProps {
  tasks: Task[];
}

export function AssignedToMe({ tasks }: AssignedToMeProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-[#737686]">
        No issues assigned to you
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    highest: "text-red-500",
    high: "text-orange-500",
    medium: "text-blue-500",
    low: "text-gray-400",
    lowest: "text-gray-300",
  };

  return (
    <div className="divide-y divide-[#C3C6D7]/10">
      {tasks.slice(0, 8).map((task) => (
        <div key={task._id} className="flex items-center gap-2 px-4 py-2 hover:bg-[#F8F9FF]">
          <span className={`text-xs ${priorityColors[task.priority]}`}>●</span>
          <span className="text-[11px] font-mono text-[#2563EB] shrink-0">{task.taskKey}</span>
          <span className="text-xs text-[#434655] truncate flex-1">{task.title}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
            task.status === "done" ? "bg-green-50 text-green-700" :
            task.status === "in_progress" ? "bg-blue-50 text-blue-700" :
            task.status === "in_review" ? "bg-amber-50 text-amber-700" :
            "bg-gray-50 text-gray-500"
          }`}>
            {task.status.replace("_", " ")}
          </span>
        </div>
      ))}
    </div>
  );
}
