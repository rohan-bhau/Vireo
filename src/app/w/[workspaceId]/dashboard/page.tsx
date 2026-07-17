"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetDashboardStatsQuery, useGetTaskTimelineQuery, useGetTeamWorkloadQuery } from "@/store/dashboardApi";
import { useGetWorkspaceQuery } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  Layers,
  TrendingUp,
  BarChart3,
  Activity,
  ChevronRight,
} from "lucide-react";

const statusColors: Record<string, string> = {
  todo: "bg-[#9CA3AF]",
  inProgress: "bg-[#2563EB]",
  inReview: "bg-[#D97706]",
  done: "bg-[#059669]",
};

const statusLabels: Record<string, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  inReview: "In Review",
  done: "Done",
};

const priorityColors: Record<string, string> = {
  highest: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-gray-400",
  lowest: "bg-gray-200",
};

const actionLabels: Record<string, string> = {
  workspace_created: "created workspace",
  project_created: "created project",
  task_created: "created task",
  task_updated: "updated task",
  member_added: "added member",
  member_removed: "removed member",
  integration_updated: "updated integration",
  integration_deleted: "removed integration",
  sprint_started: "started sprint",
  sprint_completed: "completed sprint",
};

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function StatCard({ title, value, icon: Icon, color, href }: { title: string; value: number | string; icon: React.ComponentType<{ className?: string }>; color: string; href?: string }) {
  const content = (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#737686]">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[#121C28]">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: workspace } = useGetWorkspaceQuery(workspaceId);
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery(workspaceId);
  const { data: timeline } = useGetTaskTimelineQuery({ workspaceId, days: 14 });
  const { data: workload } = useGetTeamWorkloadQuery(workspaceId);

  const [widgets, setWidgets] = useState<string[]>([
    "stats", "timeline", "priority", "activity", "workload", "types"
  ]);

  const allWidgets = [
    { id: "stats", label: "Task Status Breakdown" },
    { id: "timeline", label: "Task Timeline" },
    { id: "priority", label: "Priority Distribution" },
    { id: "activity", label: "Recent Activity" },
    { id: "workload", label: "Team Workload" },
    { id: "types", label: "Task Types" },
  ];

  function toggleWidget(id: string) {
    setWidgets((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }

  const maxTimeline = timeline ? Math.max(...timeline.map((t) => t.created), 1) : 1;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[#121C28]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-[#737686]">
            {workspace?.name || "Workspace"} overview and metrics
          </p>
        </div>
        <div className="relative group">
          <Button variant="outline" size="sm" onClick={() => {}}>
            <LayoutDashboard className="mr-1.5 h-4 w-4" />
            Customize
          </Button>
          <div className="absolute right-0 top-full z-50 mt-1 hidden w-56 rounded-lg border border-[#C3C6D7]/20 bg-white py-2 shadow-lg group-focus-within:block">
            {allWidgets.map((w) => (
              <label
                key={w.id}
                className="flex items-center gap-3 px-3 py-1.5 text-xs text-[#434655] hover:bg-[#F8F9FF] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={widgets.includes(w.id)}
                  onChange={() => toggleWidget(w.id)}
                  className="h-4 w-4 rounded border-[#C3C6D7] text-[#2563EB]"
                />
                {w.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : !stats ? (
        <div className="rounded-xl bg-white p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF]">
            <LayoutDashboard className="h-8 w-8 text-[#2563EB]" />
          </div>
          <h2 className="text-lg font-semibold text-[#121C28]">No data yet</h2>
          <p className="mt-2 text-sm text-[#737686]">Create tasks and projects to populate your dashboard.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Tasks" value={stats.taskStats.total} icon={ListChecks} color="bg-[#2563EB]" href={`/w/${workspaceId}`} />
            <StatCard title="Team Members" value={stats.memberCount} icon={Users} color="bg-[#7C3AED]" href={`/w/${workspaceId}/settings`} />
            <StatCard title="Projects" value={stats.projectCount} icon={Layers} color="bg-[#D97706]" href={`/w/${workspaceId}`} />
            <StatCard title="Active Sprints" value={stats.activeSprintCount} icon={TrendingUp} color="bg-[#059669]" />
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            {widgets.includes("stats") && (
              <div className="lg:col-span-2 rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h3 className="mb-4 text-sm font-semibold text-[#121C28]">Task Status</h3>
                <div className="space-y-3">
                  {(["todo", "inProgress", "inReview", "done"] as const).map((key) => {
                    const count = stats.taskStats.byStatus[key];
                    const total = stats.taskStats.total || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={key}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-[#434655]">{statusLabels[key]}</span>
                          <span className="text-[#737686]">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#F0F0F5]">
                          <div
                            className={`h-full rounded-full ${statusColors[key]} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {widgets.includes("priority") && (
              <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h3 className="mb-4 text-sm font-semibold text-[#121C28]">Priority Distribution</h3>
                <div className="space-y-3">
                  {(["highest", "high", "medium", "low", "lowest"] as const).map((key) => {
                    const count = stats.taskStats.byPriority[key];
                    const total = stats.taskStats.total || 1;
                    const pct = Math.round((count / total) * 100);
                    if (count === 0) return null;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${priorityColors[key]}`} />
                        <span className="flex-1 text-xs font-medium text-[#434655] capitalize">{key}</span>
                        <span className="text-xs text-[#737686]">{count}</span>
                        <span className="w-8 text-right text-xs text-[#737686]">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {widgets.includes("types") && (
              <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h3 className="mb-4 text-sm font-semibold text-[#121C28]">Task Types</h3>
                <div className="space-y-3">
                  {(["task", "bug", "epic", "story", "subtask"] as const).map((key) => {
                    const count = stats.taskStats.byType[key];
                    if (count === 0) return null;
                    return (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#434655] capitalize">{key}</span>
                        <span className="text-[#737686]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {widgets.includes("timeline") && timeline && timeline.length > 0 && (
              <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h3 className="mb-4 text-sm font-semibold text-[#121C28]">Task Timeline (14 days)</h3>
                <div className="flex items-end gap-1 h-32">
                  {timeline.slice(-14).map((entry) => (
                    <div key={entry.date} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full flex flex-col items-center" style={{ height: "100%" }}>
                        <div
                          className="w-full bg-[#2563EB] rounded-t"
                          style={{ height: `${(entry.created / maxTimeline) * 100}%`, minHeight: entry.created > 0 ? 4 : 0 }}
                          title={`${entry.created} created`}
                        />
                        <div
                          className="w-full bg-[#059669] rounded-t mt-0.5"
                          style={{ height: `${(entry.done / maxTimeline) * 100}%`, minHeight: entry.done > 0 ? 4 : 0 }}
                          title={`${entry.done} done`}
                        />
                      </div>
                      <span className="text-[10px] text-[#737686]">
                        {new Date(entry.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-[#737686]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-[#2563EB]" />
                    Created
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-[#059669]" />
                    Done
                  </div>
                </div>
              </div>
            )}

            {widgets.includes("workload") && workload && workload.length > 0 && (
              <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h3 className="mb-4 text-sm font-semibold text-[#121C28]">Team Workload</h3>
                <div className="space-y-3">
                  {workload.slice(0, 8).map((w) => (
                    <div key={w.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF4FF] text-[9px] font-bold text-[#004AC6]">
                          {w.userId === "unassigned" ? "?" : w.userId.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-[#434655]">
                          {w.userId === "unassigned" ? "Unassigned" : w.userId.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#737686]">
                        <span>{w.assigned} tasks</span>
                        {w.urgent > 0 && <span className="text-red-500">{w.urgent} urgent</span>}
                        {w.inProgress > 0 && <span className="text-[#2563EB]">{w.inProgress} active</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {widgets.includes("activity") && stats.recentActivity.length > 0 && (
            <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="mb-4 text-sm font-semibold text-[#121C28]">Recent Activity</h3>
              <div className="divide-y divide-[#C3C6D7]/10">
                {stats.recentActivity.map((entry) => (
                  <div key={entry._id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF4FF] text-[10px] font-bold text-[#004AC6]">
                      {entry.actorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#434655]">
                        <span className="font-semibold text-[#121C28]">{entry.actorName}</span>{" "}
                        {actionLabels[entry.action] || entry.action}{" "}
                        {entry.entityName && (
                          <span className="text-[#737686]">{entry.entityName}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#737686] shrink-0">
                      {timeAgo(entry.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-[#C3C6D7]/10 pt-3">
                <Link
                  href={`/w/${workspaceId}/audit-log`}
                  className="flex items-center justify-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8]"
                >
                  View full audit log
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
