"use client";

import type { GadgetConfig, GadgetData } from "@/store/dashboardApi";

interface FilterResultsProps {
  data: GadgetData;
  config: GadgetConfig;
}

export function FilterResults({ data }: FilterResultsProps) {
  const totalTasks = Object.values(data.statistics.byStatus).reduce((s, v) => s + v, 0);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#737686]">Total: {totalTasks} issues</p>
      </div>
      <div className="space-y-2">
        {Object.entries(data.statistics.byStatus).map(([key, val]) => {
          const labels: Record<string, string> = {
            todo: "To Do",
            inProgress: "In Progress",
            inReview: "In Review",
            done: "Done",
          };
          const colors: Record<string, string> = {
            todo: "bg-[#9CA3AF]",
            inProgress: "bg-[#2563EB]",
            inReview: "bg-[#D97706]",
            done: "bg-[#059669]",
          };
          const pct = totalTasks > 0 ? Math.round((val / totalTasks) * 100) : 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-[#434655]">{labels[key] || key}</span>
                <span className="text-[#737686]">{val} ({pct}%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#F1F2F6] overflow-hidden">
                <div className={`h-full rounded-full ${colors[key] || "bg-[#9CA3AF]"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
