"use client";

import { clsx } from "clsx";
import {
  TrendingDown,
  BarChart3,
  ClipboardList,
  Layers,
  ScatterChart,
  GitCompareArrows,
  Clock,
  Timer,
} from "lucide-react";

export type ReportType =
  | "burndown"
  | "velocity"
  | "sprint-report"
  | "cfd"
  | "control-chart"
  | "created-vs-resolved"
  | "average-age"
  | "time-to-resolution";

interface ReportCategory {
  label: string;
  reports: { type: ReportType; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const categories: ReportCategory[] = [
  {
    label: "Scrum",
    reports: [
      { type: "burndown", label: "Burndown Chart", icon: TrendingDown },
      { type: "velocity", label: "Velocity Chart", icon: BarChart3 },
      { type: "sprint-report", label: "Sprint Report", icon: ClipboardList },
    ],
  },
  {
    label: "Kanban",
    reports: [
      { type: "cfd", label: "Cumulative Flow", icon: Layers },
      { type: "control-chart", label: "Control Chart", icon: ScatterChart },
    ],
  },
  {
    label: "Other",
    reports: [
      { type: "created-vs-resolved", label: "Created vs Resolved", icon: GitCompareArrows },
      { type: "average-age", label: "Average Age", icon: Clock },
      { type: "time-to-resolution", label: "Time to Resolution", icon: Timer },
    ],
  },
];

interface ReportSidebarProps {
  activeReport: ReportType;
  onSelect: (type: ReportType) => void;
}

export function ReportSidebar({ activeReport, onSelect }: ReportSidebarProps) {
  return (
    <div className="w-56 shrink-0 border-r border-[#C3C6D7]/20 bg-white">
      <div className="p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Reports</h2>
      </div>
      <nav className="space-y-4 px-2 pb-4">
        {categories.map((category) => (
          <div key={category.label}>
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-[#737686]">
              {category.label}
            </p>
            {category.reports.map((report) => {
              const Icon = report.icon;
              const isActive = activeReport === report.type;
              return (
                <button
                  key={report.type}
                  onClick={() => onSelect(report.type)}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-left text-xs transition-colors",
                    isActive
                      ? "bg-[#EEF4FF] text-[#0052CC] font-medium"
                      : "text-[#434655] hover:bg-[#F4F5F7]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{report.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
