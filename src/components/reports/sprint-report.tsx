"use client";

import { ClipboardList } from "lucide-react";
import type { SprintReportData } from "@/store/reportApi";

interface SprintReportProps {
  data: SprintReportData | undefined;
  isLoading: boolean;
}

const statusColors: Record<string, string> = {
  todo: "bg-[#9CA3AF]",
  in_progress: "bg-[#2563EB]",
  in_review: "bg-[#D97706]",
  done: "bg-[#059669]",
};

const outcomeLabels: Record<string, string> = {
  completed: "Completed",
  pushed: "Pushed",
  in_progress: "In Progress",
};

const outcomeColors: Record<string, string> = {
  completed: "text-green-600 bg-green-50",
  pushed: "text-amber-600 bg-amber-50",
  in_progress: "text-blue-600 bg-blue-50",
};

export function SprintReport({ data, isLoading }: SprintReportProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse">
        <div className="h-4 w-32 bg-[#F1F2F6] rounded mb-4" />
        <div className="h-52 bg-[#F1F2F6] rounded" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold text-[#121C28] mb-4">Sprint Report</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">No sprint selected</p>
          <p className="text-xs text-[#C3C6D7] mt-1">Select a completed or active sprint to view report</p>
        </div>
      </div>
    );
  }

  const { sprintName, planned, added, completed, pushed, removed, totalPlanned, completion, issues } = data;
  const totalPoints = totalPlanned.points;

  const segments = [
    { label: "Planned", value: planned.points, color: "#2563EB" },
    { label: "Added", value: added.points, color: "#D97706" },
    { label: "Completed", value: completed.points, color: "#059669" },
    { label: "Pushed", value: pushed.points, color: "#DC2626" },
    { label: "Removed", value: removed.points, color: "#9CA3AF" },
  ];

  const chartSize = 160;
  const cx = chartSize / 2;
  const cy = chartSize / 2;
  const radius = 70;
  const nonZeroSegments = segments.filter((s) => s.value > 0);
  const total = nonZeroSegments.reduce((s, seg) => s + seg.value, 0) || 1;
  let currentAngle = -Math.PI / 2;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#121C28]">Sprint Report</h3>
            <p className="text-xs text-[#737686]">{sprintName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#121C28]">{completion}%</p>
            <p className="text-xs text-[#737686]">Completion</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <svg width={chartSize} height={chartSize} viewBox={`0 0 ${chartSize} ${chartSize}`}>
            {nonZeroSegments.length === 0 ? (
              <circle cx={cx} cy={cy} r={radius} fill="#F1F2F6" />
            ) : (
              nonZeroSegments.map((seg) => {
                const angle = (seg.value / total) * Math.PI * 2;
                const x1 = cx + radius * Math.cos(currentAngle);
                const y1 = cy + radius * Math.sin(currentAngle);
                currentAngle += angle;
                const x2 = cx + radius * Math.cos(currentAngle);
                const y2 = cy + radius * Math.sin(currentAngle);
                const largeArc = angle > Math.PI ? 1 : 0;
                const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                return <path key={seg.label} d={path} fill={seg.color} />;
              })
            )}
            <circle cx={cx} cy={cy} r={40} fill="white" />
            <text x={cx} y={cy - 4} textAnchor="middle" className="text-xs font-bold" fill="#121C28">{completed.points}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" className="text-[9px]" fill="#737686">done</text>
          </svg>

          <div className="flex-1 space-y-2">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-[#434655]">{seg.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#737686]">{seg.value} pts</span>
                  <span className="w-12 text-right text-[#737686]">
                    {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h4 className="text-xs font-semibold text-[#121C28] mb-3">Issue Breakdown ({issues.length})</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#C3C6D7]/20">
                  <th className="text-left py-2 px-2 text-[#737686] font-medium">Key</th>
                  <th className="text-left py-2 px-2 text-[#737686] font-medium">Title</th>
                  <th className="text-left py-2 px-2 text-[#737686] font-medium">Type</th>
                  <th className="text-left py-2 px-2 text-[#737686] font-medium">Status</th>
                  <th className="text-right py-2 px-2 text-[#737686] font-medium">Pts</th>
                  <th className="text-left py-2 px-2 text-[#737686] font-medium">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.key} className="border-b border-[#C3C6D7]/10 hover:bg-[#F8F9FF]">
                    <td className="py-2 px-2 font-mono text-[#2563EB]">{issue.key}</td>
                    <td className="py-2 px-2 text-[#121C28] max-w-[200px] truncate">{issue.title}</td>
                    <td className="py-2 px-2 text-[#737686] capitalize">{issue.type}</td>
                    <td className="py-2 px-2">
                      <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${statusColors[issue.status] || "bg-[#9CA3AF]"}`}>
                        {issue.status.replace("_", " ")}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-[#737686]">{issue.storyPoints}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${outcomeColors[issue.outcome] || "text-[#737686]"}`}>
                        {outcomeLabels[issue.outcome] || issue.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
