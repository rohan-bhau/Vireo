"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useGetWorkspaceProjectsQuery, useGetOrSeedDefaultProjectMutation } from "@/store/projectApi";
import { useGetWorkspaceTasksQuery, type Task, type TaskType } from "@/store/taskApi";
import { SkeletonSummaryCards } from "@/components/ui/skeleton";
import {
  SquareCheckBig,
  BookOpen,
  Bug,
  Flag,
  ListTodo,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";

interface TimelineTabProps {
  workspaceId: string;
}

type Zoom = "today" | "week" | "month" | "quarter";

const ZOOM_OPTIONS: { value: Zoom; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
];

interface TypeConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const TYPE_CONFIG: Record<TaskType, TypeConfig> = {
  epic: { label: "Epic", color: "#6366f1", icon: Flag },
  story: { label: "Story", color: "#0ea5e9", icon: BookOpen },
  task: { label: "Task", color: "#2563EB", icon: SquareCheckBig },
  bug: { label: "Bug", color: "#ef4444", icon: Bug },
  subtask: { label: "Subtask", color: "#f59e0b", icon: ListTodo },
};

const COLUMN_WIDTH = 152;
const ROW_MIN_HEIGHT = 44;

function startOfDay(d: Date): Date {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

function startOfWeek(d: Date): Date {
  const nd = startOfDay(d);
  const day = (nd.getDay() + 6) % 7; // Monday first
  nd.setDate(nd.getDate() - day);
  return nd;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1);
}

function addDays(d: Date, n: number): Date {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface Column {
  id: string;
  label: string;
  sublabel?: string;
  start: Date;
  end: Date;
  isToday?: boolean;
}

function buildColumns(zoom: Zoom, now: Date): Column[] {
  if (zoom === "today") {
    const day = startOfDay(now);
    const cols: Column[] = [];
    for (let h = 0; h < 24; h++) {
      const start = addDays(day, 0);
      start.setHours(h, 0, 0, 0);
      const end = new Date(start);
      end.setHours(h + 1, 0, 0, 0);
      cols.push({
        id: `h${h}`,
        label: h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`,
        start,
        end,
        isToday: true,
      });
    }
    return cols;
  }

  if (zoom === "week") {
    const start = startOfWeek(now);
    const cols: Column[] = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      cols.push({
        id: `d${i}`,
        label: dayNames[i],
        sublabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        start: startOfDay(d),
        end: startOfDay(addDays(d, 1)),
        isToday: isSameDay(d, now),
      });
    }
    return cols;
  }

  if (zoom === "month") {
    const start = startOfMonth(now);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const cols: Column[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i);
      cols.push({
        id: `m${i}`,
        label: `${i}`,
        sublabel: d.toLocaleDateString("en-US", { weekday: "short" }),
        start: startOfDay(d),
        end: startOfDay(addDays(d, 1)),
        isToday: isSameDay(d, now),
      });
    }
    return cols;
  }

  // quarter → weekly columns for the quarter
  const start = startOfQuarter(now);
  const end = new Date(start.getFullYear(), start.getMonth() + 3, 1);
  const cols: Column[] = [];
  let cursor = startOfWeek(start);
  let idx = 0;
  while (cursor < end) {
    const weekEnd = addDays(cursor, 6);
    cols.push({
      id: `q${idx}`,
      label: `W${idx + 1}`,
      sublabel: `${cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      start: cursor,
      end: startOfDay(addDays(weekEnd, 1)),
      isToday: cursor <= now && now < startOfDay(addDays(weekEnd, 1)),
    });
    cursor = startOfDay(addDays(weekEnd, 1));
    idx++;
  }
  return cols;
}

function columnIndexFor(taskDate: Date, columns: Column[]): number {
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].start <= taskDate && taskDate < columns[i].end) return i;
  }
  return -1;
}

function getTooltipStyle(
  pos: { x: number; y: number },
  _task: Task,
  tooltipWidth: number
): React.CSSProperties {
  const margin = 10;
  const top = Math.max(margin, pos.y);
  let left = pos.x + margin;
  if (left + tooltipWidth > window.innerWidth - margin) {
    left = pos.x - tooltipWidth - margin;
  }
  if (typeof document !== "undefined") {
    const estHeight = 120;
    const maxTop = window.innerHeight - estHeight - margin;
    return { top: Math.min(top, Math.max(margin, maxTop)), left: Math.max(margin, left) };
  }
  return { top, left };
}

export function TimelineTab({ workspaceId }: TimelineTabProps) {
  const { data: projects = [], isLoading: projectsLoading } = useGetWorkspaceProjectsQuery(workspaceId);
  const { data: tasks = [], isLoading: tasksLoading } = useGetWorkspaceTasksQuery(workspaceId);
  const [ensureDefault] = useGetOrSeedDefaultProjectMutation();

  const [zoom, setZoom] = useState<Zoom>("month");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!projectsLoading && !tasksLoading && projects.length === 0) {
      ensureDefault(workspaceId);
    }
  }, [projectsLoading, tasksLoading, projects.length, workspaceId, ensureDefault]);

  const loading = projectsLoading || tasksLoading;
  const now = useMemo(() => new Date(), []);

  const projectNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of projects) map[p.id] = p.name;
    return map;
  }, [projects]);

  const columns = useMemo(() => buildColumns(zoom, now), [zoom, now]);

  const visibleTasks = useMemo(
    () => (projectFilter === "all" ? tasks : tasks.filter((t) => t.projectId === projectFilter)),
    [tasks, projectFilter]
  );

  const tasksByProject = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    for (const t of visibleTasks) {
      (groups[t.projectId] ||= []).push(t);
    }
    return groups;
  }, [visibleTasks]);

  const projectRows = useMemo(() => {
    const projectIds = Object.keys(tasksByProject);
    if (projectIds.length === 0) return projects.map((p) => p.id);
    return projects.filter((p) => tasksByProject[p.id]).map((p) => p.id);
  }, [tasksByProject, projects]);

  if (loading) {
    return (
      <div>
        <SkeletonSummaryCards />
      </div>
    );
  }

  const hasEvents = Object.keys(tasksByProject).length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Timeline</h2>
          <p className="text-sm text-[#737686]">Calendar view of when issues were created, grouped by project</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-1.5 text-xs font-medium text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="all">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 rounded-lg border border-[#C3C6D7] bg-white p-0.5">
            {ZOOM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setZoom(opt.value)}
                className={clsx(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  zoom === opt.value ? "bg-[#2563EB] text-white" : "text-[#737686] hover:text-[#121C28]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-[#737686]">
        {(Object.keys(TYPE_CONFIG) as TaskType[]).map((type) => {
          const cfg = TYPE_CONFIG[type];
          const Icon = cfg.icon;
          return (
            <div key={type} className="flex items-center gap-1.5">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full" style={{ backgroundColor: cfg.color }}>
                <Icon className="h-2 w-2 text-white" />
              </span>
              <span>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {!hasEvents ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#C3C6D7]/20 bg-white py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF4FF]">
            <svg className="h-6 w-6 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-text">No timeline events yet</h3>
          <p className="mt-1 text-sm text-text-tertiary">Create or edit issues to see them appear on the calendar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#C3C6D7]/20 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div style={{ minWidth: 200 + columns.length * COLUMN_WIDTH }}>
            {/* header row */}
            <div className="flex border-b border-[#C3C6D7]/20">
              <div className="sticky left-0 z-20 w-48 shrink-0 border-r border-[#C3C6D7]/20 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">
                Project
              </div>
              <div className="flex">
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className={clsx(
                      "shrink-0 px-2 py-3 text-center border-r border-[#C3C6D7]/10",
                      col.isToday && "bg-[#EEF4FF]"
                    )}
                    style={{ width: COLUMN_WIDTH }}
                  >
                    <div className="text-xs font-semibold text-[#434655]">{col.label}</div>
                    {col.sublabel && <div className="text-[10px] text-[#C3C6D7]">{col.sublabel}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* rows */}
            <div className="divide-y divide-[#C3C6D7]/10">
              {projectRows.map((projectId, rowIdx) => {
                const projectTasks = (tasksByProject[projectId] || []).sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                // stack events per column
                const perColumn: Task[][] = columns.map(() => []);
                for (const t of projectTasks) {
                  const idx = columnIndexFor(new Date(t.createdAt), columns);
                  if (idx >= 0) perColumn[idx].push(t);
                }

                const columnHeights = perColumn.map((stack) =>
                  stack.length > 0 ? Math.max(ROW_MIN_HEIGHT, stack.length * 22 + 4) : ROW_MIN_HEIGHT
                );
                const rowHeight = Math.max(...columnHeights, ROW_MIN_HEIGHT);

                return (
                  <div key={projectId} className="flex">
                    <div className="sticky left-0 z-10 flex w-48 shrink-0 items-center gap-2 border-r border-[#C3C6D7]/20 bg-white px-4" style={{ minHeight: rowHeight }}>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-[#EEF4FF] text-[11px] font-bold text-[#2563EB]">
                        {(projectNameById[projectId] || projectId).charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate text-xs font-medium text-[#434655]">
                        {projectNameById[projectId] || projectId}
                      </span>
                      <span className="ml-auto text-[10px] text-[#C3C6D7]">{projectTasks.length}</span>
                    </div>
                    <div className="flex relative">
                      {perColumn.map((stack, colIdx) => (
                        <div
                          key={colIdx}
                          className={clsx(
                            "relative shrink-0 border-r border-[#C3C6D7]/10 p-1.5",
                            columns[colIdx].isToday && "bg-[#EEF4FF]/60"
                          )}
                          style={{ width: COLUMN_WIDTH, minHeight: rowHeight }}
                        >
                          <div className="absolute left-1.5 right-1.5 top-1.5 flex flex-col gap-0.5">
                            {stack.slice(0, 5).map((t) => {
                              const cfg = TYPE_CONFIG[t.type];
                              const Icon = cfg.icon;
                              return (
                                <div
                                  key={t._id}
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setTooltipPos({ x: rect.left + rect.width, y: rect.top });
                                    setHoveredTask(t);
                                  }}
                                  onMouseLeave={() => setHoveredTask(null)}
                                  className="flex w-full cursor-default items-center gap-1.5 rounded border-l-2 bg-[#F8F9FF] px-1.5 py-0.5 transition-colors hover:bg-white"
                                  style={{ borderLeftColor: cfg.color }}
                                >
                                  <Icon className="h-2.5 w-2.5 shrink-0" style={{ color: cfg.color }} />
                                  <span className="truncate text-[10px] text-[#434655]">{t.taskKey}</span>
                                </div>
                              );
                            })}
                            {stack.length > 5 && (
                              <div className="flex items-center gap-1 px-1 text-[10px] text-[#737686]">
                                <ArrowRight className="h-2.5 w-2.5" />
                                +{stack.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {typeof document !== "undefined" &&
        hoveredTask &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[100] w-56 rounded-lg border border-[#C3C6D7]/30 bg-white p-3 shadow-dropdown"
            style={getTooltipStyle(tooltipPos, hoveredTask, 224)}
          >
            {(() => {
              const cfg = TYPE_CONFIG[hoveredTask.type];
              const Icon = cfg.icon;
              return (
                <>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#2563EB]">{hoveredTask.taskKey}</span>
                    <span
                      className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: cfg.color }}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#121C28]">{hoveredTask.title}</p>
                  <p className="mt-1 text-[10px] text-[#737686]">
                    Created {new Date(hoveredTask.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#737686]">
                    Project: <span className="text-[#434655]">{projectNameById[hoveredTask.projectId] || hoveredTask.projectId}</span>
                  </p>
                  {hoveredTask.assignee && (
                    <p className="mt-0.5 text-[10px] text-[#737686]">
                      Assignee: <span className="text-[#434655]">{hoveredTask.assignee}</span>
                    </p>
                  )}
                </>
              );
            })()}
          </div>,
          document.body
        )}
    </div>
  );
}