"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { clsx } from "clsx";
import { EpicBar } from "./epic-bar";
import { SprintOverlay } from "./sprint-overlay";
import { RoadmapZoomControls } from "./roadmap-zoom-controls";

interface RoadmapItem {
  id: string;
  type: "epic" | "task";
  title: string;
  start: Date;
  end: Date;
  color: string;
  status: string;
  progress?: number;
  epicKey?: string;
}

interface SprintData {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
}

interface RoadmapTimelineProps {
  items: RoadmapItem[];
  sprints: SprintData[];
  showEpics: boolean;
  onToggleEpics: (show: boolean) => void;
  zoom: "quarter" | "month" | "week";
  onZoomChange: (zoom: "quarter" | "month" | "week") => void;
  onAddEpic?: () => void;
  onEpicClick?: (epicKey: string) => void;
  selectedEpic?: string | null;
}

export function RoadmapTimeline({
  items,
  sprints,
  showEpics,
  onToggleEpics,
  zoom,
  onZoomChange,
  onAddEpic,
  onEpicClick,
  selectedEpic,
}: RoadmapTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  const epicItems = useMemo(() => items.filter((i) => i.type === "epic"), [items]);
  const taskItems = useMemo(() => items.filter((i) => i.type === "task"), [items]);

  const timelineStart = useMemo(() => {
    if (!items.length) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      d.setDate(1);
      return d;
    }
    const dates = items.map((i) => i.start);
    const min = new Date(Math.min(...dates.map((d) => d.getTime()), now.getTime()));
    min.setMonth(min.getMonth() - 1);
    min.setDate(1);
    return min;
  }, [items]);

  const timelineEnd = useMemo(() => {
    if (!items.length) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + 3);
      return d;
    }
    const dates = items.map((i) => i.end);
    const max = new Date(Math.max(...dates.map((d) => d.getTime()), now.getTime()));
    max.setMonth(max.getMonth() + 3);
    return max;
  }, [items]);

  const totalMs = timelineEnd.getTime() - timelineStart.getTime();
  const TIMELINE_WIDTH = 1200;

  const timeLabels = useMemo(() => {
    const labels: { label: string; start: Date; width: number }[] = [];
    const cursor = new Date(timelineStart);

    while (cursor < timelineEnd) {
      const start = new Date(cursor);
      let label: string;
      let next: Date;

      if (zoom === "week") {
        label = `W${getWeekNumber(cursor)}`;
        next = new Date(cursor);
        next.setDate(next.getDate() + 7);
      } else if (zoom === "quarter") {
        const q = Math.floor(cursor.getMonth() / 3) + 1;
        label = `Q${q} ${cursor.getFullYear()}`;
        next = new Date(cursor);
        next.setMonth(next.getMonth() + 3);
      } else {
        label = cursor.toLocaleString("default", { month: "short", year: "2-digit" });
        next = new Date(cursor);
        next.setMonth(next.getMonth() + 1);
      }

      labels.push({ label, start, width: next.getTime() - start.getTime() });
      cursor.setTime(next.getTime());
    }
    return labels;
  }, [timelineStart, timelineEnd, zoom]);

  function getLeft(date: Date | string | null): number {
    if (!date) return 0;
    const d = new Date(date);
    return ((d.getTime() - timelineStart.getTime()) / totalMs) * TIMELINE_WIDTH;
  }

  function getWidth(start: Date, end: Date): number {
    const s = start.getTime();
    const e = end.getTime();
    return Math.max(20, ((e - s) / totalMs) * TIMELINE_WIDTH);
  }

  const getEpicProgress = useCallback(
    (epicKey: string): number => {
      const epicTasks = taskItems.filter((t) => t.epicKey === epicKey);
      if (!epicTasks.length) return 0;
      const done = epicTasks.filter((t) => t.status === "done").length;
      return Math.round((done / epicTasks.length) * 100);
    },
    [taskItems]
  );

  const displayedItems = useMemo(() => {
    if (!showEpics) return taskItems;
    return items;
  }, [items, showEpics, taskItems]);

  const ROW_HEIGHT = 36;
  const LABEL_WIDTH = 200;

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#121C28]">Roadmap</h2>
          <RoadmapZoomControls zoom={zoom} onZoomChange={onZoomChange} />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#434655] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showEpics}
              onChange={(e) => onToggleEpics(e.target.checked)}
              className="rounded border-[#C3C6D7] text-[#2563EB] focus:ring-[#2563EB]"
            />
            Show epics
          </label>
          {onAddEpic && (
            <button
              onClick={onAddEpic}
              className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1d4ed8] transition-colors"
            >
              + Add epic
            </button>
          )}
        </div>
      </div>

      {displayedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-[#C3C6D7]/20 bg-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF4FF] mb-3">
            <svg className="h-6 w-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[#121C28]">No timeline items yet</h3>
          <p className="mt-1 text-sm text-[#737686]">Create an epic to start planning your roadmap.</p>
        </div>
      ) : (
        <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-[#C3C6D7]/20 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div style={{ minWidth: TIMELINE_WIDTH + LABEL_WIDTH }}>
            <div className="flex border-b border-[#C3C6D7]/20">
              <div className="w-[200px] shrink-0 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">
                Item
              </div>
              <div className="flex flex-1 relative">
                {timeLabels.map((m, i) => {
                  const width = (m.width / totalMs) * TIMELINE_WIDTH;
                  return (
                    <div
                      key={i}
                      style={{ width }}
                      className={clsx(
                        "px-2 py-3 text-xs font-medium border-r border-[#C3C6D7]/10 shrink-0",
                        i % 2 === 0 ? "text-[#737686]" : "text-[#121C28]"
                      )}
                    >
                      {m.label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex">
              <div className="w-[200px] shrink-0 divide-y divide-[#C3C6D7]/10">
                {displayedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 px-4" style={{ height: ROW_HEIGHT }}>
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-sm text-[#434655]">{item.title}</span>
                  </div>
                ))}
              </div>

              <div className="flex-1 relative" style={{ minHeight: displayedItems.length * ROW_HEIGHT + 16 }}>
                {timeLabels.map((m, i) => {
                  const left = ((m.start.getTime() - timelineStart.getTime()) / totalMs) * TIMELINE_WIDTH;
                  const width = (m.width / totalMs) * TIMELINE_WIDTH;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-[#C3C6D7]/10"
                      style={{
                        left,
                        width,
                        backgroundColor: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)",
                      }}
                    />
                  );
                })}

                <SprintOverlay
                  sprints={sprints}
                  timelineStart={timelineStart}
                  totalMs={totalMs}
                  pixelsPerMs={TIMELINE_WIDTH / totalMs}
                />

                <div className="absolute left-0 right-0 top-2">
                  {displayedItems.map((item, idx) => {
                    const left = getLeft(item.start);
                    const width = getWidth(item.start, item.end);
                    const top = idx * ROW_HEIGHT;

                    if (item.type === "epic") {
                      return (
                        <EpicBar
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          color={item.color}
                          left={left}
                          width={width}
                          top={top + 4}
                          progress={getEpicProgress(item.id)}
                          onClick={() => onEpicClick?.(item.id)}
                          isExpanded={selectedEpic === item.id}
                          hasChildren={taskItems.some((t) => t.epicKey === item.id)}
                        />
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className="absolute h-5 rounded px-1.5 flex items-center overflow-hidden"
                        style={{
                          left,
                          width: Math.max(width, 12),
                          top: top + 6,
                          backgroundColor: item.color + "15",
                          borderLeft: `2px solid ${item.color}`,
                        }}
                        title={item.title}
                      >
                        <span className="truncate text-[10px] font-medium" style={{ color: item.color }}>
                          {item.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
