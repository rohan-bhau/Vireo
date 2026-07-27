"use client";

import { clsx } from "clsx";

type ZoomLevel = "quarter" | "month" | "week";

interface RoadmapZoomControlsProps {
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
}

const OPTIONS: { value: ZoomLevel; label: string }[] = [
  { value: "quarter", label: "Quarter" },
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
];

export function RoadmapZoomControls({ zoom, onZoomChange }: RoadmapZoomControlsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-[#C3C6D7] bg-white p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onZoomChange(opt.value)}
          className={clsx(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            zoom === opt.value
              ? "bg-[#2563EB] text-white"
              : "text-[#737686] hover:text-[#121C28]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
