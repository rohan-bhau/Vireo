"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import type { VelocityData } from "@/store/reportApi";

interface VelocityChartProps {
  data: VelocityData | undefined;
  isLoading: boolean;
}

export function VelocityChart({ data, isLoading }: VelocityChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse">
        <div className="h-4 w-32 bg-[#F1F2F6] rounded mb-4" />
        <div className="h-52 bg-[#F1F2F6] rounded" />
      </div>
    );
  }

  if (!data || data.sprints.length === 0) {
    return (
      <div className="rounded-xl bg-surface p-5 shadow-card">
        <h3 className="text-sm font-semibold text-text mb-4">Velocity Chart</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-sm text-text-tertiary">No sprint data yet</p>
          <p className="text-xs text-text-tertiary mt-1">Complete some sprints to see velocity</p>
        </div>
      </div>
    );
  }

  const { sprints, avgVelocity } = data;
  const padding = { top: 20, right: 50, bottom: 60, left: 40 };
  const width = 600;
  const height = 260;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxPoints = Math.max(...sprints.map((s) => s.totalPoints), 10);
  const barWidth = Math.min(chartW / sprints.length * 0.6, 40);
  const groupWidth = chartW / sprints.length;

  const hoveredSprint = hoverIndex !== null ? sprints[hoverIndex] : null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <h3 className="text-sm font-semibold text-[#121C28] mb-1">Velocity Chart</h3>
      <p className="text-xs text-[#737686] mb-4">
        Average velocity: <span className="font-semibold text-[#121C28]">{avgVelocity}</span> pts/sprint
        {" — "}Recommended commitment: <span className="font-semibold text-[#059669]">{Math.round(avgVelocity * 0.8)}</span> pts
      </p>

      {hoveredSprint && (
        <div className="mb-2 rounded-md bg-[#F8F9FF] px-3 py-1.5 text-xs text-[#434655]">
          {hoveredSprint.name}: {hoveredSprint.completedPoints}/{hoveredSprint.totalPoints} pts ({hoveredSprint.completedTasks}/{hoveredSprint.totalTasks} tasks)
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" style={{ maxHeight: height }}>
        <defs>
          <linearGradient id="velocity-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="velocity-bar-done" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding.top + chartH - (pct * chartH);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#F1F2F6" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px]" fill="#C3C6D7">{Math.round(maxPoints * pct)}</text>
            </g>
          );
        })}

        <line x1={padding.left} y1={padding.top + chartH - (avgVelocity / maxPoints) * chartH}
          x2={width - padding.right} y2={padding.top + chartH - (avgVelocity / maxPoints) * chartH}
          stroke="#DC2626" strokeWidth="1.5" strokeDasharray="6 3" />

        {sprints.map((sprint, i) => {
          const x = padding.left + groupWidth * i + (groupWidth - barWidth) / 2;
          const totalH = (sprint.totalPoints / maxPoints) * chartH;
          const doneH = (sprint.completedPoints / maxPoints) * chartH;
          const yBase = padding.top + chartH;
          const isHovered = hoverIndex === i;

          return (
            <g key={i}>
              <rect x={x} y={yBase - totalH} width={barWidth} height={totalH} fill="url(#velocity-bar)" rx="3" opacity="0.3" />
              <rect x={x} y={yBase - doneH} width={barWidth} height={doneH} fill="url(#velocity-bar-done)" rx="3" opacity={isHovered ? 1 : 0.85} />
              <rect x={x - 4} y={padding.top} width={barWidth + 8} height={chartH} fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} />
              <text x={x + barWidth / 2} y={yBase + 14} textAnchor="end" transform={`rotate(-45, ${x + barWidth / 2}, ${yBase + 14})`} className="text-[9px]" fill="#737686">
                {sprint.name.length > 12 ? sprint.name.slice(0, 12) + "..." : sprint.name}
              </text>
            </g>
          );
        })}

        <text x={padding.left + 4} y={padding.top + chartH - (avgVelocity / maxPoints) * chartH - 4} className="text-[9px]" fill="#DC2626">avg</text>
      </svg>

      <div className="flex items-center gap-4 mt-3 text-xs text-[#737686]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-[#059669]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-[#2563EB] opacity-30" />
          <span>Planned</span>
        </div>
        <span className="ml-auto text-[11px] text-[#C3C6D7]">{sprints.length} sprints</span>
      </div>
    </div>
  );
}
