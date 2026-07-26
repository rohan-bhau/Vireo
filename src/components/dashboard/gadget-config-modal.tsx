"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { GadgetConfig } from "@/store/dashboardApi";

interface GadgetConfigModalProps {
  config: GadgetConfig;
  onSave: (config: GadgetConfig) => void;
  onClose: () => void;
}

const timeRangeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12w", label: "Last 12 weeks" },
  { value: "all", label: "All time" },
];

const refreshOptions = [
  { value: 0, label: "Never" },
  { value: 5, label: "Every 5 minutes" },
  { value: 15, label: "Every 15 minutes" },
  { value: 30, label: "Every 30 minutes" },
  { value: 60, label: "Every hour" },
];

export function GadgetConfigModal({ config, onSave, onClose }: GadgetConfigModalProps) {
  const [title, setTitle] = useState(config.title);
  const [width, setWidth] = useState<1 | 2 | 3>(config.width);
  const [height, setHeight] = useState<1 | 2>(config.height);
  const [refreshInterval, setRefreshInterval] = useState(config.refreshInterval || 0);
  const [timeRange, setTimeRange] = useState(config.timeRange || "30d");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C3C6D7]/10">
          <h2 className="text-sm font-semibold text-[#121C28]">Configure Gadget</h2>
          <button onClick={onClose} className="rounded p-1 text-[#737686] hover:bg-[#F4F5F7]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#434655] mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#434655] mb-1 block">Width</label>
            <select
              value={width}
              onChange={(e) => setWidth(Number(e.target.value) as 1 | 2 | 3)}
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value={1}>1 column</option>
              <option value={2}>2 columns</option>
              <option value={3}>3 columns</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#434655] mb-1 block">Height</label>
            <select
              value={height}
              onChange={(e) => setHeight(Number(e.target.value) as 1 | 2)}
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value={1}>Compact</option>
              <option value={2}>Tall</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#434655] mb-1 block">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {timeRangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#434655] mb-1 block">Refresh Interval</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {refreshOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#C3C6D7]/10">
          <button
            onClick={onClose}
            className="rounded-[3px] border border-[#C3C6D7] px-4 py-2 text-xs font-medium text-[#434655] hover:bg-[#F4F5F7]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...config, title, width, height, refreshInterval, timeRange } as GadgetConfig)}
            className="rounded-[3px] bg-[#0052CC] px-4 py-2 text-xs font-medium text-white hover:bg-[#0747A6]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
