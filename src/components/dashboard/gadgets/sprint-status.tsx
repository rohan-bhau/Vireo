"use client";

import { useState } from "react";

interface SprintStatusEntry {
  sprintId: string;
  name: string;
  projectName: string;
  totalPoints: number;
  completedPoints: number;
  progress: number;
  endDate: string | null;
}

interface SprintStatusProps {
  sprints: SprintStatusEntry[];
}

export function SprintStatus({ sprints }: SprintStatusProps) {
  const [now] = useState(() => Date.now());

  if (sprints.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-[#737686]">
        No active sprints
      </div>
    );
  }

  function daysRemaining(endDate: string | null, now: number) {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  }

  return (
    <div className="p-4 space-y-4">
      {sprints.map((sprint) => {
        const remaining = daysRemaining(sprint.endDate, now);
        return (
          <div key={sprint.sprintId}>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-xs font-medium text-[#121C28]">{sprint.name}</p>
                <p className="text-[10px] text-[#737686]">{sprint.projectName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-[#121C28]">{sprint.completedPoints}/{sprint.totalPoints}</p>
                {remaining !== null && (
                  <p className={`text-[10px] ${remaining <= 1 ? "text-red-500" : "text-[#737686]"}`}>
                    {remaining > 0 ? `${remaining}d left` : "Overdue"}
                  </p>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full bg-[#F1F2F6] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  sprint.progress >= 100 ? "bg-[#059669]" :
                  sprint.progress >= 50 ? "bg-[#2563EB]" :
                  "bg-[#D97706]"
                }`}
                style={{ width: `${Math.min(sprint.progress, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#737686] mt-0.5">{sprint.progress}% complete</p>
          </div>
        );
      })}
    </div>
  );
}
