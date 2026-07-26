"use client";

import { useState } from "react";
import { GitCompareArrows } from "lucide-react";
import type { CreatedVsResolvedData } from "@/store/reportApi";

interface CreatedVsResolvedProps {
  data: CreatedVsResolvedData | undefined;
  isLoading: boolean;
}

export function CreatedVsResolved({ data, isLoading }: CreatedVsResolvedProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse">
        <div className="h-4 w-40 bg-[#F1F2F6] rounded mb-4" />
        <div className="h-52 bg-[#F1F2F6] rounded" />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold text-[#121C28] mb-4">Created vs Resolved</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GitCompareArrows className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">Not enough data</p>
          <p className="text-xs text-[#C3C6D7] mt-1">Track issues over time to see this chart</p>
        </div>
      </div>
    );
  }

  const { data: points } = data;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 700;
  const height = 260;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(
    ...points.map((p) => Math.max(p.created, p.resolved)),
    10
  ) * 1.15;

  const xScale = (i: number) => padding.left + (i / Math.max(points.length - 1, 1)) * chartW;
  const yScale = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

  const createdLine = points.map((p, i) => ({ x: xScale(i), y: yScale(p.created) }));
  const resolvedLine = points.map((p, i) => ({ x: xScale(i), y: yScale(p.resolved) }));

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[#121C28]">Created vs Resolved</h3>
        <span className="text-[11px] text-[#737686]">{data.weeks} weeks</span>
      </div>
      <p className="text-xs text-[#737686] mb-3">Cumulative created vs resolved issues over time</p>

      {hoveredPoint && (
        <div className="mb-2 rounded-md bg-[#F8F9FF] px-3 py-1.5 text-xs text-[#434655]">
          {hoveredPoint.date}: Created={hoveredPoint.created}, Resolved={hoveredPoint.resolved}
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" style={{ maxHeight: height }}>
        <defs>
          <linearGradient id="created-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="resolved-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = yScale(maxVal * pct);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#F1F2F6" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px]" fill="#C3C6D7">{Math.round(maxVal * pct)}</text>
            </g>
          );
        })}

        <polygon points={createdLine.map((p) => `${p.x},${p.y}`).join(" ") + ` ${xScale(points.length - 1)},${chartH + padding.top} ${xScale(0)},${chartH + padding.top}`} fill="url(#created-area)" />
        <polygon points={resolvedLine.map((p) => `${p.x},${p.y}`).join(" ") + ` ${xScale(points.length - 1)},${chartH + padding.top} ${xScale(0)},${chartH + padding.top}`} fill="url(#resolved-area)" />

        <polyline points={createdLine.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
        <polyline points={resolvedLine.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" />

        {points.map((_, i) => (
          <rect key={i} x={xScale(i) - 6} y={padding.top} width={12} height={chartH} fill="transparent" className="cursor-pointer"
            onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} />
        ))}

        {points.filter((_, i) => i % Math.ceil(points.length / 8) === 0 || i === points.length - 1).map((_, i) => {
          const p = points[i];
          const idx = points.indexOf(p);
          return (
            <text key={i} x={xScale(idx)} y={height - 4} textAnchor="middle" className="text-[9px]" fill="#C3C6D7">
              {p.date}
            </text>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 mt-3 text-xs text-[#737686]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-[#2563EB]" />
          <span>Created</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-[#059669]" />
          <span>Resolved</span>
        </div>
        {points.length > 0 && (
          <span className="ml-auto text-[11px] text-[#C3C6D7]">
            Net: {points[points.length - 1].created - points[points.length - 1].resolved}
          </span>
        )}
      </div>
    </div>
  );
}
