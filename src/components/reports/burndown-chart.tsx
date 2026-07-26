"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { TrendingDown } from "lucide-react";
import type { BurndownData } from "@/store/reportApi";

interface BurndownChartProps {
  data: BurndownData | undefined;
  isLoading: boolean;
}

export function BurndownChart({ data, isLoading }: BurndownChartProps) {
  const [hoverDay, setHoverDay] = useState<number | null>(null);

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
        <h3 className="text-sm font-semibold text-[#121C28] mb-4">Burndown Chart</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingDown className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">No active sprint</p>
          <p className="text-xs text-[#C3C6D7] mt-1">Start a sprint to see burndown</p>
        </div>
      </div>
    );
  }

  const { dailyData, totalPoints, totalDays, status, sprintName } = data;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 600;
  const height = 260;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxY = totalPoints * 1.1 || 10;
  const xScale = (day: number) => padding.left + (day / totalDays) * chartW;
  const yScale = (val: number) => padding.top + chartH - (val / maxY) * chartH;

  const idealLine = dailyData.map((d) => ({ x: xScale(d.day), y: yScale(d.ideal) }));
  const actualLine = dailyData.map((d) => ({ x: xScale(d.day), y: yScale(d.actual) }));

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    y: yScale(totalPoints * pct),
    label: `${Math.round(totalPoints * pct)}`,
  }));

  const lastActual = dailyData[dailyData.length - 1]?.actual ?? 0;
  const pctRemaining = totalPoints > 0 ? Math.round((lastActual / totalPoints) * 100) : 0;
  const hoveredPoint = hoverDay !== null ? dailyData.find((d) => d.day === hoverDay) : null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[#121C28]">Burndown Chart</h3>
        <span className="text-[11px] text-[#737686]">{sprintName}</span>
      </div>
      <p className="text-xs text-[#737686] mb-3">
        {status === "active" ? "Active sprint" : status === "completed" ? "Completed sprint" : "Planned sprint"}
        {" — "}
        <span className="font-medium text-[#121C28]">{pctRemaining}%</span> remaining
      </p>
      <div className="flex items-center gap-4 mb-3 text-xs text-[#737686]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-[#2563EB]" />
          <span>Ideal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-[#DC2626]" />
          <span>Actual</span>
        </div>
        <span className="ml-auto font-medium text-[#121C28]">
          {Math.round(totalPoints - lastActual)}/{totalPoints} pts completed
        </span>
      </div>

      {hoveredPoint && (
        <div className="mb-2 rounded-md bg-[#F8F9FF] px-3 py-1.5 text-xs text-[#434655]">
          Day {hoveredPoint.day}: Ideal={hoveredPoint.ideal}, Actual={hoveredPoint.actual}
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" style={{ maxHeight: height }}>
        <defs>
          <linearGradient id="burndown-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {gridLines.map((gl, i) => (
          <g key={i}>
            <line x1={padding.left} y1={gl.y} x2={width - padding.right} y2={gl.y} stroke="#F1F2F6" strokeWidth="1" />
            <text x={padding.left - 8} y={gl.y + 4} textAnchor="end" className="text-[10px]" fill="#C3C6D7">{gl.label}</text>
          </g>
        ))}
        <polygon points={actualLine.map((p) => `${p.x},${p.y}`).join(" ") + ` ${xScale(totalDays)},${chartH + padding.top} ${xScale(0)},${chartH + padding.top}`} fill="url(#burndown-fill)" />
        <polyline points={idealLine.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="6 3" />
        <polyline points={actualLine.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {dailyData.map((d, i) => (
          <rect key={i} x={xScale(d.day) - 6} y={padding.top} width={12} height={chartH} fill="transparent" className="cursor-pointer"
            onMouseEnter={() => setHoverDay(d.day)} onMouseLeave={() => setHoverDay(null)} />
        ))}
        {dailyData.filter((_, i) => i === 0 || i === dailyData.length - 1 || i % Math.ceil(totalDays / 6) === 0).map((d, i) => {
          const p = actualLine[dailyData.indexOf(d)];
          return <circle key={i} cx={p.x} cy={p.y} r={hoverDay === d.day ? 5 : 3} fill="#DC2626" stroke="white" strokeWidth="1.5" className="transition-all" />;
        })}
        <text x={padding.left} y={height - 4} textAnchor="middle" className="text-[10px]" fill="#C3C6D7">Start</text>
        <text x={xScale(totalDays)} y={height - 4} textAnchor="middle" className="text-[10px]" fill="#C3C6D7">End</text>
      </svg>

      {status === "completed" && (
        <div className={clsx("mt-3 rounded-md px-3 py-2 text-xs font-medium", lastActual <= 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
          {lastActual <= 0 ? "Sprint completed on track — all points resolved." : `Sprint completed ${lastActual <= totalPoints * 0.2 ? "mostly on track" : "behind"} — ${pctRemaining}% of points unresolved.`}
        </div>
      )}
    </div>
  );
}
