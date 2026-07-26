"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import type { CFDData } from "@/store/reportApi";

interface CumulativeFlowDiagramProps {
  data: CFDData | undefined;
  isLoading: boolean;
}

const statusChartColors: Record<string, string> = {
  todo: "#9CA3AF",
  in_progress: "#2563EB",
  in_review: "#D97706",
  done: "#059669",
};

export function CumulativeFlowDiagram({ data, isLoading }: CumulativeFlowDiagramProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse">
        <div className="h-4 w-48 bg-[#F1F2F6] rounded mb-4" />
        <div className="h-52 bg-[#F1F2F6] rounded" />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold text-[#121C28] mb-4">Cumulative Flow Diagram</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">Not enough data</p>
          <p className="text-xs text-[#C3C6D7] mt-1">Create tasks and track them through statuses</p>
        </div>
      </div>
    );
  }

  const { statuses, data: points } = data;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 700;
  const height = 280;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxTotal = Math.max(
    ...points.map((p) => Object.values(p.counts).reduce((s, c) => s + c, 0)),
    10
  );
  const xScale = (i: number) => padding.left + (i / Math.max(points.length - 1, 1)) * chartW;
  const yScale = (val: number) => padding.top + chartH - (val / (maxTotal * 1.1)) * chartH;

  const areaKeys = statuses.map((s) => s.key);
  const stackedAreas = areaKeys.map((key) => {
    let accumulated = 0;
    return points.map((p) => {
      const val = p.counts[key] || 0;
      accumulated += val;
      return accumulated;
    });
  });

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[#121C28]">Cumulative Flow Diagram</h3>
        <span className="text-[11px] text-[#737686]">{data.weeks} weeks</span>
      </div>
      <p className="text-xs text-[#737686] mb-3">Issue count per status over time — widening bands indicate bottlenecks</p>

      {hoveredPoint && (
        <div className="mb-2 rounded-md bg-[#F8F9FF] px-3 py-1.5 text-xs text-[#434655]">
          {hoveredPoint.date}: {statuses.map((s) => `${s.label}=${hoveredPoint.counts[s.key]}`).join(", ")}
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" style={{ maxHeight: height }}>
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = yScale(maxTotal * 1.1 * pct);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#F1F2F6" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px]" fill="#C3C6D7">{Math.round(maxTotal * 1.1 * pct)}</text>
            </g>
          );
        })}

        {areaKeys.map((key, layerIdx) => {
          const currentStack = stackedAreas[layerIdx];
          const prevStack = layerIdx > 0 ? stackedAreas[layerIdx - 1] : points.map(() => 0);
          const pointsStr = points
            .map((_, i) => `${xScale(i)},${yScale(currentStack[i])}`)
            .join(" ");
          const bottomPoints = points
            .map((_, i) => `${xScale(i)},${yScale(prevStack[i])}`)
            .reverse()
            .join(" ");
          const polygon = pointsStr + " " + bottomPoints;

          return (
            <polygon
              key={key}
              points={polygon}
              fill={statusChartColors[key] || "#9CA3AF"}
              fillOpacity={0.7 + layerIdx * 0.05}
              stroke={statusChartColors[key] || "#9CA3AF"}
              strokeWidth="0.5"
            />
          );
        })}

        {points.map((_, i) => (
          <rect key={i} x={xScale(i) - 6} y={padding.top} width={12} height={chartH} fill="transparent" className="cursor-pointer"
            onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} />
        ))}

        {points.filter((_, i) => i % Math.ceil(points.length / 8) === 0 || i === points.length - 1).map((p, i) => {
          const idx = points.indexOf(p);
          return (
            <text key={i} x={xScale(idx)} y={height - 4} textAnchor="middle" className="text-[9px]" fill="#C3C6D7" transform={`rotate(-30, ${xScale(idx)}, ${height - 4})`}>
              {p.date}
            </text>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 mt-3 text-xs text-[#737686]">
        {statuses.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: statusChartColors[s.key] }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
