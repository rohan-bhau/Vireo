"use client";

import { useMemo, useState } from "react";
import { useGetWorkspaceTasksQuery } from "@/store/taskApi";
import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";
import { useGetWorkspaceEpicsQuery } from "@/store/epicApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { useGetWorkspaceSprintsQuery } from "@/store/sprintApi";
import { SkeletonSummaryCards } from "@/components/ui/skeleton";
import type { Task, TaskStatus, TaskPriority, TaskType } from "@/store/taskApi";

interface ReportsTabProps {
  workspaceId: string;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: "To Do", color: "#6B7280", bg: "#F3F4F6" },
  in_progress: { label: "In Progress", color: "#2563EB", bg: "#EEF4FF" },
  in_review: { label: "In Review", color: "#D97706", bg: "#FEF3C7" },
  done: { label: "Done", color: "#059669", bg: "#D1FAE5" },
};

const TYPE_CONFIG: Record<TaskType, { label: string; color: string }> = {
  epic: { label: "Epic", color: "#6366f1" },
  story: { label: "Story", color: "#0ea5e9" },
  task: { label: "Task", color: "#2563EB" },
  bug: { label: "Bug", color: "#ef4444" },
  subtask: { label: "Subtask", color: "#f59e0b" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  highest: { label: "Highest", color: "#ef4444" },
  high: { label: "High", color: "#f97316" },
  medium: { label: "Medium", color: "#eab308" },
  low: { label: "Low", color: "#10b981" },
  lowest: { label: "Lowest", color: "#94a3b8" },
};

function countBy<T extends string>(tasks: Task[], getKey: (t: Task) => T): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    const key = getKey(t);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

export function ReportsTab({ workspaceId }: ReportsTabProps) {
  const { data: tasks = [], isLoading: tasksLoading } = useGetWorkspaceTasksQuery(workspaceId);
  const { data: projects = [], isLoading: projectsLoading } = useGetWorkspaceProjectsQuery(workspaceId);
  const { data: epics = [], isLoading: epicsLoading } = useGetWorkspaceEpicsQuery(workspaceId);
  const { data: members = [], isLoading: membersLoading } = useGetMembersQuery(workspaceId);
  const { data: sprints = [], isLoading: sprintsLoading } = useGetWorkspaceSprintsQuery(workspaceId);

  const [projectFilter, setProjectFilter] = useState<string>("all");
  const loading = tasksLoading || projectsLoading || epicsLoading || membersLoading || sprintsLoading;

  const visibleTasks = useMemo(
    () => (projectFilter === "all" ? tasks : tasks.filter((t) => t.projectId === projectFilter)),
    [tasks, projectFilter]
  );

  const projectById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of projects) map[p.id] = p.name;
    return map;
  }, [projects]);

  const statusCounts = useMemo(() => countBy(visibleTasks, (t) => t.status), [visibleTasks]);
  const typeCounts = useMemo(() => countBy(visibleTasks, (t) => t.type), [visibleTasks]);
  const priorityCounts = useMemo(() => countBy(visibleTasks, (t) => t.priority), [visibleTasks]);

  const assigneeCounts = useMemo(() => countBy(visibleTasks, (t) => t.assignee || "Unassigned"), [visibleTasks]);

  const memberNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) {
      if (m.user) map[m.userId] = m.user.name;
    }
    return map;
  }, [members]);

  const openCount = visibleTasks.filter((t) => t.status !== "done").length;
  const doneCount = visibleTasks.length - openCount;
  const donePct = visibleTasks.length > 0 ? Math.round((doneCount / visibleTasks.length) * 100) : 0;

  const openTaskCount = visibleTasks.filter((t) => ["in_progress", "in_review"].includes(t.status)).length;

  const [now] = useState(() => Date.now());

  const createdVsResolved = useMemo(() => {
    const buckets: { date: string; created: number; resolved: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      buckets.push({ date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), created: 0, resolved: 0 });
    }
    for (const t of visibleTasks) {
      const createdWeek = Math.floor((now - new Date(t.createdAt).getTime()) / (7 * 86400000));
      if (createdWeek >= 0 && createdWeek < 14) {
        buckets[13 - createdWeek].created += 1;
      }
      if (t.status === "done") {
        const resolvedWeek = Math.floor((now - new Date(t.updatedAt).getTime()) / (7 * 86400000));
        if (resolvedWeek >= 0 && resolvedWeek < 14) {
          buckets[13 - resolvedWeek].resolved += 1;
        }
      }
    }
    return buckets;
  }, [visibleTasks, now]);

  const [hoverWeek, setHoverWeek] = useState<number | null>(null);

  const maxCvR = Math.max(...createdVsResolved.map((b) => Math.max(b.created, b.resolved)), 1);
  const cw = 640;
  const ch = 190;
  const cPad = { top: 14, right: 12, bottom: 26, left: 34 };
  const cPlotW = cw - cPad.left - cPad.right;
  const cPlotH = ch - cPad.top - cPad.bottom;
  const cGroupW = cPlotW / createdVsResolved.length;
  const cBarW = Math.max(4, cGroupW * 0.35);
  const yScale = (v: number) => cPad.top + cPlotH - (v / maxCvR) * cPlotH;
  const hoveredWeek = hoverWeek !== null ? createdVsResolved[hoverWeek] : null;

  const projectDistribution = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {};
    for (const t of tasks) {
      const entry = counts[t.projectId] || { total: 0, done: 0 };
      entry.total += 1;
      if (t.status === "done") entry.done += 1;
      counts[t.projectId] = entry;
    }
    return Object.entries(counts)
      .map(([projectId, { total, done }]) => ({
        projectId,
        name: projectById[projectId] || projectId,
        total,
        done,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [tasks, projectById]);

  const activeSprints = sprints.filter((s) => s.status === "ACTIVE").length;

  if (loading) {
    return (
      <div>
        <SkeletonSummaryCards />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Workspace Reports</h2>
          <p className="text-sm text-[#737686]">Analytics across all projects in this workspace</p>
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
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tasks" value={visibleTasks.length} sub={`${projects.length} project${projects.length !== 1 ? "s" : ""}`} icon="tasks" />
        <StatCard label="Open Tasks" value={openCount} sub={`${openTaskCount} in progress/review`} icon="open" />
        <StatCard label="Completion" value={`${donePct}%`} sub={`${doneCount} of ${visibleTasks.length} done`} icon="done" />
        <StatCard label="Active Sprints" value={activeSprints} sub={`${epics.length} epics tracked`} icon="sprint" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#121C28] mb-4">Created vs Resolved</h3>
          <p className="text-xs text-[#737686] mb-3">Weekly created and resolved issues over the last 14 weeks</p>

          {hoveredWeek && (
            <div className="mb-2 rounded-md bg-[#F8F9FF] px-3 py-1.5 text-xs text-[#434655]">
              {hoveredWeek.date}: {hoveredWeek.created} created, {hoveredWeek.resolved} resolved
            </div>
          )}

          <svg viewBox={`0 0 ${cw} ${ch}`} className="w-full" style={{ maxHeight: ch }}>
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = yScale(maxCvR * pct);
              return (
                <g key={pct}>
                  <line x1={cPad.left} y1={y} x2={cw - cPad.right} y2={y} stroke="#F1F2F6" strokeWidth="1" />
                  <text x={cPad.left - 6} y={y + 4} textAnchor="end" className="text-[9px]" fill="#C3C6D7">
                    {Math.round(maxCvR * pct)}
                  </text>
                </g>
              );
            })}

            {createdVsResolved.map((b, i) => {
              const xC = cPad.left + i * cGroupW + (cGroupW - cBarW) / 2;
              const xR = cPad.left + i * cGroupW + cGroupW - (cGroupW - cBarW) / 2 - cBarW;
              const hC = (b.created / maxCvR) * cPlotH;
              const hR = (b.resolved / maxCvR) * cPlotH;
              return (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverWeek(i)} onMouseLeave={() => setHoverWeek(null)}>
                  <rect x={cPad.left + i * cGroupW} y={cPad.top} width={cGroupW} height={cPlotH} fill="transparent" />
                  <rect x={xC} y={yScale(b.created)} width={cBarW} height={Math.max(2, hC)} rx="2" fill="#2563EB" opacity="0.85" />
                  <rect x={xR} y={yScale(b.resolved)} width={cBarW} height={Math.max(2, hR)} rx="2" fill="#059669" opacity="0.85" />
                  {i % 2 === 0 && (
                    <text x={cPad.left + i * cGroupW + cGroupW / 2} y={ch - 8} textAnchor="middle" className="text-[8px]" fill="#C3C6D7">
                      {b.date}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="flex items-center gap-4 mt-2 text-xs text-[#737686]">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded bg-[#2563EB]" />
              <span>Created</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded bg-[#059669]" />
              <span>Resolved</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#121C28] mb-4">Task Status</h3>
          <p className="text-xs text-[#737686] mb-4">Distribution of tasks by workflow status</p>
          <div className="space-y-3">
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => {
              const count = statusCounts[status] || 0;
              const pct = visibleTasks.length > 0 ? Math.round((count / visibleTasks.length) * 100) : 0;
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-[#434655]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                      {cfg.label}
                    </span>
                    <span className="text-[#737686]">{count} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F1F2F6] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                </div>
              );
            })}
            {visibleTasks.length === 0 && <EmptyState text="No tasks to report on yet" />}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#121C28] mb-4">By Issue Type</h3>
          <div className="space-y-2">
            {(Object.keys(TYPE_CONFIG) as TaskType[]).map((type) => {
              const count = typeCounts[type] || 0;
              const pct = visibleTasks.length > 0 ? Math.round((count / visibleTasks.length) * 100) : 0;
              const cfg = TYPE_CONFIG[type];
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span className="w-20 shrink-0 text-xs text-[#434655]">{cfg.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-[#F1F2F6] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs text-[#737686]">{count}</span>
                </div>
              );
            })}
            {visibleTasks.length === 0 && <EmptyState text="No tasks yet" />}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#121C28] mb-4">By Priority</h3>
          <div className="space-y-2">
            {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((priority) => {
              const count = priorityCounts[priority] || 0;
              const pct = visibleTasks.length > 0 ? Math.round((count / visibleTasks.length) * 100) : 0;
              const cfg = PRIORITY_CONFIG[priority];
              return (
                <div key={priority} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span className="w-20 shrink-0 text-xs text-[#434655]">{cfg.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-[#F1F2F6] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs text-[#737686]">{count}</span>
                </div>
              );
            })}
            {visibleTasks.length === 0 && <EmptyState text="No tasks yet" />}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#121C28] mb-4">Workload by Assignee</h3>
          <div className="space-y-2">
            {Object.entries(assigneeCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([assigneeId, count]) => {
                const max = Math.max(...Object.values(assigneeCounts), 1);
                const pct = Math.round((count / max) * 100);
                const name = assigneeId === "Unassigned" ? "Unassigned" : memberNameById[assigneeId] || "Unknown";
                return (
                  <div key={assigneeId} className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-[10px] font-bold text-[#2563EB]">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="w-28 truncate shrink-0 text-xs text-[#434655]">{name}</span>
                    <div className="h-2 flex-1 rounded-full bg-[#F1F2F6] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#6366f1] transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs text-[#737686]">{count}</span>
                  </div>
                );
              })}
            {Object.keys(assigneeCounts).length === 0 && <EmptyState text="No assignments yet" />}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#121C28] mb-4">Progress by Project</h3>
          {projectDistribution.length === 0 ? (
            <EmptyState text="No projects with tasks yet" />
          ) : (
            <div className="space-y-3">
              {projectDistribution.map((p) => (
                <div key={p.projectId}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#434655]">{p.name}</span>
                    <span className="text-[#737686]">{p.done}/{p.total} done ({p.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F1F2F6] overflow-hidden">
                    <div className="h-full rounded-full bg-[#059669] transition-all duration-300" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#121C28] mb-4">Recent Completed Tasks</h3>
          {visibleTasks.filter((t) => t.status === "done").length === 0 ? (
            <EmptyState text="No completed tasks yet" />
          ) : (
            <div className="divide-y divide-[#F1F2F6]">
              {visibleTasks
                .filter((t) => t.status === "done")
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 6)
                .map((t) => (
                  <div key={t._id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-xs font-semibold text-[#2563EB] shrink-0">{t.taskKey}</span>
                      <span className="truncate text-xs text-[#434655]">{t.title}</span>
                    </div>
                    <span className="shrink-0 text-[11px] text-[#C3C6D7]">
                      {new Date(t.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub: string; icon: "tasks" | "open" | "done" | "sprint" }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">{label}</p>
        <IconBadge icon={icon} />
      </div>
      <p className="mt-2 text-3xl font-bold text-[#121C28]">{value}</p>
      <p className="mt-1 text-xs text-[#737686]">{sub}</p>
    </div>
  );
}

function IconBadge({ icon }: { icon: "tasks" | "open" | "done" | "sprint" }) {
  const path =
    icon === "tasks" ? (
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ) : icon === "open" ? (
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
    ) : icon === "done" ? (
      <path d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ) : (
      <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    );
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
      <svg className="h-4 w-4 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {path}
      </svg>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9FF]">
        <svg className="h-5 w-5 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
        </svg>
      </div>
      <p className="text-xs text-[#C3C6D7]">{text}</p>
    </div>
  );
}
