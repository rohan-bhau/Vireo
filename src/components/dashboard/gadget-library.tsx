"use client";

import { X, ListChecks, Filter, Activity, PieChart, BarChart3, TrendingDown, GitCompareArrows, Clock, Layers } from "lucide-react";

interface GadgetLibraryItem {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const availableGadgets: GadgetLibraryItem[] = [
  { type: "assigned-to-me", label: "Assigned to Me", description: "Issues assigned to you", icon: ListChecks },
  { type: "filter-results", label: "Filter Results", description: "Results from a saved filter", icon: Filter },
  { type: "activity-stream", label: "Activity Stream", description: "Recent project activity", icon: Activity },
  { type: "pie-chart", label: "Pie Chart", description: "Issues grouped by field", icon: PieChart },
  { type: "statistics", label: "Statistics", description: "Issue counts by status/priority/type", icon: BarChart3 },
  { type: "sprint-status", label: "Sprint Status", description: "Current sprint progress", icon: Clock },
  { type: "recently-created", label: "Recently Created", description: "Recently created issues", icon: Layers },
  { type: "burndown-mini", label: "Burndown (Mini)", description: "Small burndown chart", icon: TrendingDown },
  { type: "velocity-mini", label: "Velocity (Mini)", description: "Small velocity chart", icon: BarChart3 },
  { type: "created-vs-resolved-mini", label: "Created vs Resolved (Mini)", description: "Mini trend chart", icon: GitCompareArrows },
];

interface GadgetLibraryProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

export function GadgetLibrary({ onSelect, onClose }: GadgetLibraryProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C3C6D7]/10">
          <h2 className="text-sm font-semibold text-[#121C28]">Add Gadget</h2>
          <button onClick={onClose} className="rounded p-1 text-[#737686] hover:bg-[#F4F5F7]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2">
            {availableGadgets.map((gadget) => {
              const Icon = gadget.icon;
              return (
                <button
                  key={gadget.type}
                  onClick={() => onSelect(gadget.type)}
                  className="flex items-start gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-left hover:border-[#2563EB] hover:bg-[#F8F9FF] transition-all"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF]">
                    <Icon className="h-4 w-4 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#121C28]">{gadget.label}</p>
                    <p className="text-[10px] text-[#737686] mt-0.5">{gadget.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
