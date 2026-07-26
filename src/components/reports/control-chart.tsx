"use client";

import { useState } from "react";
import { ScatterChart } from "lucide-react";
import type { ControlChartData } from "@/store/reportApi";

interface ControlChartProps {
  data: ControlChartData | undefined;
  isLoading: boolean;
}

export function ControlChart({ data, isLoading }: ControlChartProps) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<ControlChartData["issues"][0] | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse">
        <div className="h-4 w-32 bg-[#F1F2F6] rounded mb-4" />
        <div className="h-52 bg-[#F1F2F6] rounded" />
      </div>
    );
  }

  if (!data || data.issues.length === 0) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold text-[#121C28] mb-4">Control Chart</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ScatterChart className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">No completed issues found</p>
          <p className="text-xs text-[#C3C6D7] mt-1">Complete some issues in this project to see cycle time data</p>
        </div>
      </div>
    );
  }

  const { issues, avgCycleTime, stdDev, upperBand, lowerBand } = data;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = 700;
  const height = 300;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxCycleTime = Math.max(...issues.map((i) => i.cycleTime), 10) * 1.2;
  const xScale = (i: number) => padding.left + (i / Math.max(issues.length - 1, 1)) * chartW;
  const yScale = (val: number) => padding.top + chartH - (val / maxCycleTime) * chartH;

  const hoveredIssue = hoverKey ? issues.find((i) => i.key === hoverKey) : null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[#121C28]">Control Chart</h3>
        <span className="text-[11px] text-[#737686]">{issues.length} issues</span>
      </div>
      <p className="text-xs text-[#737686] mb-3">Cycle time (days from start to done) per issue</p>

      <div className="flex items-center gap-4 mb-3 text-xs text-[#737686]">
        <span>Avg: <strong className="text-[#121C28]">{avgCycleTime}d</strong></span>
        <span>Std Dev: <strong className="text-[#121C28]">{stdDev}d</strong></span>
        <span>Upper: <strong className="text-[#DC2626]">{upperBand}d</strong></span>
        <span>Lower: <strong className="text-[#059669]">{lowerBand}d</strong></span>
      </div>

      {hoveredIssue && !selectedIssue && (
        <div className="mb-2 rounded-md bg-[#F8F9FF] px-3 py-1.5 text-xs text-[#434655]">
          {hoveredIssue.key}: {hoveredIssue.title} — {hoveredIssue.cycleTime}d cycle time (click for details)
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" style={{ maxHeight: height }}>
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = yScale(maxCycleTime * pct);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#F1F2F6" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px]" fill="#C3C6D7">
                {Math.round(maxCycleTime * pct)}d
              </text>
            </g>
          );
        })}

        <line x1={padding.left} y1={yScale(avgCycleTime)} x2={width - padding.right} y2={yScale(avgCycleTime)}
          stroke="#2563EB" strokeWidth="1.5" strokeDasharray="6 3" />

        <line x1={padding.left} y1={yScale(upperBand)} x2={width - padding.right} y2={yScale(upperBand)}
          stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={padding.left} y1={yScale(lowerBand)} x2={width - padding.right} y2={yScale(lowerBand)}
          stroke="#059669" strokeWidth="1" strokeDasharray="3 3" />

        {issues.map((issue, i) => {
          const x = xScale(i);
          const y = yScale(issue.cycleTime);
          const isHovered = hoverKey === issue.key;
          return (
            <g key={issue.key}>
              <circle cx={x} cy={y} r={isHovered ? 6 : 4}
                fill={issue.cycleTime > upperBand ? "#DC2626" : issue.cycleTime < lowerBand ? "#059669" : "#2563EB"}
                opacity={isHovered || selectedIssue?.key === issue.key ? 1 : 0.7}
                stroke="white" strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoverKey(issue.key)}
                onMouseLeave={() => setHoverKey(null)}
                onClick={() => setSelectedIssue(selectedIssue?.key === issue.key ? null : issue)} />
            </g>
          );
        })}

        <text x={padding.left + 4} y={yScale(avgCycleTime) - 4} className="text-[9px]" fill="#2563EB">avg</text>
        <text x={padding.left + 4} y={yScale(upperBand) - 4} className="text-[9px]" fill="#DC2626">+1σ</text>
        <text x={padding.left + 4} y={yScale(lowerBand) - 4} className="text-[9px]" fill="#059669">-1σ</text>
      </svg>

      <div className="flex items-center gap-4 mt-3 text-xs text-[#737686]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
          <span>Within range</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
          <span>Above +1σ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#059669]" />
          <span>Below -1σ</span>
        </div>
      </div>

      {selectedIssue && (
        <div className="mt-4 rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-mono text-xs text-[#2563EB] font-semibold">{selectedIssue.key}</span>
              <h4 className="text-sm font-medium text-[#121C28] mt-0.5">{selectedIssue.title}</h4>
            </div>
            <button onClick={() => setSelectedIssue(null)} className="text-[#737686] hover:text-[#121C28] text-xs">Close</button>
          </div>
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-[#737686]">Type</p>
              <p className="font-medium text-[#121C28] capitalize">{selectedIssue.type}</p>
            </div>
            <div>
              <p className="text-[#737686]">Priority</p>
              <p className="font-medium text-[#121C28] capitalize">{selectedIssue.priority}</p>
            </div>
            <div>
              <p className="text-[#737686]">Cycle Time</p>
              <p className="font-medium text-[#121C28]">{selectedIssue.cycleTime}d</p>
            </div>
            <div>
              <p className="text-[#737686]">Assignee</p>
              <p className="font-medium text-[#121C28]">{selectedIssue.assignee || "Unassigned"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
