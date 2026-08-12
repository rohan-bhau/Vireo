"use client";

import { Settings, X, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import { AssignedToMe } from "./gadgets/assigned-to-me";
import { FilterResults } from "./gadgets/filter-results";
import { ActivityStream } from "./gadgets/activity-stream";
import { PieChart } from "./gadgets/pie-chart";
import { Statistics } from "./gadgets/statistics";
import { SprintStatus } from "./gadgets/sprint-status";
import { RecentlyCreated } from "./gadgets/recently-created";
import type { GadgetConfig, GadgetData } from "@/store/dashboardApi";

interface DashboardGadgetProps {
  config: GadgetConfig;
  data: GadgetData | undefined;
  onConfigure: () => void;
  onRemove: () => void;
}

export function DashboardGadget({ config, data, onConfigure, onRemove }: DashboardGadgetProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config.gadgetId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const widthClass = config.width === 2 ? "md:col-span-2" : config.width === 3 ? "md:col-span-3" : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        isDragging && "shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-2 ring-[#2563EB]/30",
        widthClass
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#C3C6D7]/10">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="touch-none cursor-grab active:cursor-grabbing text-[#C3C6D7] hover:text-[#737686] transition-colors"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <h3 className="text-xs font-semibold text-[#121C28]">{config.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onConfigure}
            className="rounded p-1 text-[#737686] hover:bg-[#F4F5F7] transition-colors"
            title="Configure"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="rounded p-1 text-[#737686] hover:bg-[#F4F5F7] transition-colors"
            title="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className={config.height === 2 ? "min-h-[300px]" : "min-h-[150px]"}>
        <GadgetContent type={config.type} data={data} config={config} />
      </div>
    </div>
  );
}

function GadgetContent({ type, data, config }: { type: string; data: GadgetData | undefined; config: GadgetConfig }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-[#737686] animate-pulse">
        Loading...
      </div>
    );
  }

  switch (type) {
    case "assigned-to-me":
      return <AssignedToMe tasks={data.assignedToMe} />;
    case "filter-results":
      return <FilterResults data={data} config={config} />;
    case "activity-stream":
      return <ActivityStream activity={data.activityStream} />;
    case "pie-chart":
      return <PieChart statistics={data.statistics} />;
    case "statistics":
      return <Statistics statistics={data.statistics} />;
    case "sprint-status":
      return <SprintStatus sprints={data.sprintStatus} />;
    case "recently-created":
      return <RecentlyCreated tasks={data.recentlyCreated} />;
    case "burndown-mini":
      return <BurndownMini stats={data.statistics} />;
    case "velocity-mini":
      return <VelocityMini stats={data.statistics} />;
    case "created-vs-resolved-mini":
      return <CreatedVsResolvedMini stats={data.statistics} />;
    default:
      return (
        <div className="flex items-center justify-center h-32 text-xs text-[#737686]">
          Unknown gadget: {type}
        </div>
      );
  }
}

function BurndownMini({ stats }: { stats: GadgetData["statistics"] }) {
  const total = Object.values(stats.byStatus).reduce((s, v) => s + v, 0) || 1;
  const done = stats.byStatus.done || 0;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#737686]">Progress</span>
        <span className="text-xs font-semibold text-[#121C28]">{done}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-[#F1F2F6] overflow-hidden">
        <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-[#737686] mt-2">{pct}% complete</p>
    </div>
  );
}

function VelocityMini({ stats }: { stats: GadgetData["statistics"] }) {
  const total = Object.values(stats.byStatus).reduce((s, v) => s + v, 0) || 1;
  return (
    <div className="p-4">
      <div className="space-y-2">
        {Object.entries(stats.byStatus).map(([key, val]) => {
          const colors: Record<string, string> = { todo: "#9CA3AF", inProgress: "#2563EB", inReview: "#D97706", done: "#059669" };
          const pct = Math.round((val / total) * 100);
          return (
            <div key={key} className="flex items-center gap-2 text-xs">
              <div className="h-2 w-full rounded-full bg-[#F1F2F6] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[key] || "#9CA3AF" }} />
              </div>
              <span className="w-16 text-right text-[#737686] shrink-0">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreatedVsResolvedMini({ stats }: { stats: GadgetData["statistics"] }) {
  const total = Object.values(stats.byStatus).reduce((s, v) => s + v, 0) || 1;
  const done = stats.byStatus.done || 0;
  const open = total - done;
  return (
    <div className="p-4 flex items-center gap-4">
      <div className="flex-1 text-center">
        <p className="text-lg font-bold text-[#2563EB]">{open}</p>
        <p className="text-[10px] text-[#737686]">Open</p>
      </div>
      <div className="w-px h-10 bg-[#C3C6D7]/30" />
      <div className="flex-1 text-center">
        <p className="text-lg font-bold text-[#059669]">{done}</p>
        <p className="text-[10px] text-[#737686]">Done</p>
      </div>
      <div className="w-px h-10 bg-[#C3C6D7]/30" />
      <div className="flex-1 text-center">
        <p className="text-lg font-bold text-[#121C28]">{total}</p>
        <p className="text-[10px] text-[#737686]">Total</p>
      </div>
    </div>
  );
}
