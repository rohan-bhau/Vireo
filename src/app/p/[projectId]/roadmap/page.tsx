"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetProjectTasksQuery } from "@/store/taskApi";
import { useGetProjectQuery } from "@/store/projectApi";
import { useGetProjectEpicsQuery } from "@/store/epicApi";
import { clsx } from "clsx";

export default function RoadmapPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project } = useGetProjectQuery(projectId);
  const { data: tasks = [] } = useGetProjectTasksQuery(projectId);
  const { data: epics = [] } = useGetProjectEpicsQuery(projectId);

  const [zoom, setZoom] = useState<"quarter" | "month" | "week">("month");
  const [showEpics, setShowEpics] = useState(true);

  const now = new Date();
  const timelineStart = useMemo(() => {
    const dates = tasks.filter((t) => t.dueDate).map((t) => new Date(t.dueDate!));
    const epicDates = epics.map((e) => new Date(e.createdAt));
    const all = [...dates, ...epicDates, now];
    const min = new Date(Math.min(...all.map((d) => d.getTime())));
    min.setMonth(min.getMonth() - 1);
    min.setDate(1);
    return min;
  }, [tasks, epics]);

  const timelineEnd = useMemo(() => {
    const dates = tasks.filter((t) => t.dueDate).map((t) => new Date(t.dueDate!));
    const epicDates = epics.map((e) => new Date(e.createdAt));
    const all = [...dates, ...epicDates, now];
    const max = new Date(Math.max(...all.map((d) => d.getTime())));
    max.setMonth(max.getMonth() + 3);
    return max;
  }, [tasks, epics]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; year: number; start: Date; width: number }[] = [];
    const cursor = new Date(timelineStart);
    while (cursor < timelineEnd) {
      const start = new Date(cursor);
      const month = cursor.toLocaleString("default", { month: "short" });
      const year = cursor.getFullYear();
      cursor.setMonth(cursor.getMonth() + 1);
      const end = new Date(cursor);
      labels.push({ month, year, start, width: (end.getTime() - start.getTime()) });
    }
    return labels;
  }, [timelineStart, timelineEnd]);

  const totalMs = timelineEnd.getTime() - timelineStart.getTime();
  const pixelsPerMs = 1200 / totalMs;

  function getLeft(date: Date | string | null) {
    if (!date) return 0;
    const d = new Date(date);
    return ((d.getTime() - timelineStart.getTime()) / totalMs) * 1200;
  }

  function getWidth(start: Date | string | null, end: Date | string | null) {
    const s = start ? new Date(start).getTime() : timelineStart.getTime();
    const e = end ? new Date(end).getTime() : s + 14 * 86400000;
    return Math.max(20, ((e - s) / totalMs) * 1200);
  }

  const roadmapItems = useMemo(() => {
    const items: { id: string; type: "epic" | "task"; title: string; start: Date; end: Date; color: string; status: string }[] = [];

    if (showEpics) {
      for (const epic of epics) {
        const epicTasks = tasks.filter((t) => t.parentTask === epic.epicKey);
        const start = new Date(epic.createdAt);
        const end = epicTasks.length > 0
          ? new Date(Math.max(...epicTasks.map((t) => new Date(t.dueDate || t.updatedAt).getTime())))
          : new Date(epic.createdAt);
        end.setDate(end.getDate() + 14);
        items.push({
          id: epic.epicKey,
          type: "epic",
          title: epic.name,
          start,
          end,
          color: epic.color || "#6366f1",
          status: epic.status,
        });
      }
    }

    for (const task of tasks) {
      if (!task.dueDate) continue;
      const start = new Date(task.createdAt);
      const end = new Date(task.dueDate);
      if (end < now) continue;
      items.push({
        id: task.taskKey,
        type: "task",
        title: task.taskKey + " " + task.title,
        start,
        end,
        color: task.status === "done" ? "#10B981" : task.status === "in_progress" ? "#2563EB" : "#6B7280",
        status: task.status,
      });
    }

    items.sort((a, b) => a.start.getTime() - b.start.getTime());
    return items;
  }, [epics, tasks, showEpics, now]);

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#121C28]">Roadmap</h2>
          <div className="flex items-center gap-1 rounded-lg border border-[#C3C6D7] bg-white p-0.5">
            {(["quarter", "month", "week"] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={clsx(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  zoom === z ? "bg-[#2563EB] text-white" : "text-[#737686] hover:text-[#121C28]"
                )}
              >
                {z.charAt(0).toUpperCase() + z.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#434655] cursor-pointer">
          <input type="checkbox" checked={showEpics} onChange={(e) => setShowEpics(e.target.checked)}
            className="rounded border-[#C3C6D7] text-[#2563EB] focus:ring-[#2563EB]" />
          Show epics
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#C3C6D7]/20 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="min-w-[1200px]">
          <div className="flex border-b border-[#C3C6D7]/20">
            <div className="w-56 flex-shrink-0 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">
              Item
            </div>
            <div className="flex flex-1">
              {monthLabels.map((m, i) => {
                const width = (m.width / totalMs) * 1200;
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={i}
                    style={{ width }}
                    className={clsx(
                      "px-2 py-3 text-xs font-medium",
                      isEven ? "text-[#737686]" : "text-[#121C28]"
                    )}
                  >
                    {m.month} {m.year}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex">
            <div className="w-56 flex-shrink-0 divide-y divide-[#C3C6D7]/10">
              {roadmapItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 px-4 py-3 h-10">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-sm text-[#434655]">{item.title}</span>
                </div>
              ))}
              {roadmapItems.length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-[#737686]">
                  No timeline items yet.
                </div>
              )}
            </div>

            <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0">
                {monthLabels.map((m, i) => {
                  const left = ((m.start.getTime() - timelineStart.getTime()) / totalMs) * 1200;
                  const width = (m.width / totalMs) * 1200;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-[#C3C6D7]/10"
                      style={{ left, width, backgroundColor: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}
                    />
                  );
                })}
                <div className="absolute left-0 right-0 top-0" style={{ height: roadmapItems.length * 40 }}>
                  {roadmapItems.map((item) => {
                    const left = getLeft(item.start);
                    const width = getWidth(item.start, item.end);
                    const top = roadmapItems.indexOf(item) * 40;
                    return (
                      <div
                        key={item.id}
                        className="absolute h-6 rounded-md px-2 flex items-center overflow-hidden"
                        style={{
                          left,
                          width: Math.max(width, 20),
                          top: top + 8,
                          backgroundColor: item.color + "20",
                          borderLeft: `3px solid ${item.color}`,
                        }}
                        title={item.title}
                      >
                        <span className="truncate text-xs font-medium" style={{ color: item.color }}>
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
      </div>
    </div>
  );
}
