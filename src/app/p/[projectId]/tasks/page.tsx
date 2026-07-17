"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetProjectTasksQuery } from "@/store/taskApi";
import { useGetProjectQuery } from "@/store/projectApi";
import { useGetWorkspaceFiltersQuery, useCreateSavedFilterMutation, useDeleteSavedFilterMutation } from "@/store/savedFilterApi";
import type { Task } from "@/store/taskApi";
import { clsx } from "clsx";

type SortField = "taskKey" | "title" | "status" | "priority" | "assignee" | "updatedAt";
type SortDir = "asc" | "desc";

const priorityOrder: Record<string, number> = { highest: 5, high: 4, medium: 3, low: 2, lowest: 1 };

export default function TasksPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { data: project } = useGetProjectQuery(projectId);
  const { data: tasks = [], isLoading } = useGetProjectTasksQuery(projectId);
  const { data: savedFilters = [] } = useGetWorkspaceFiltersQuery(project?.workspaceId ?? "", { skip: !project });
  const [createFilter] = useCreateSavedFilterMutation();
  const [deleteFilter] = useDeleteSavedFilterMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");

  const filtered = useMemo(() => {
    let result = [...tasks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.taskKey.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter);
    if (typeFilter !== "all") result = result.filter((t) => t.type === typeFilter);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "taskKey": cmp = a.taskKey.localeCompare(b.taskKey); break;
        case "title": cmp = a.title.localeCompare(b.title); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "priority": cmp = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0); break;
        case "assignee": cmp = (a.assignee || "").localeCompare(b.assignee || ""); break;
        case "updatedAt": cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tasks, search, statusFilter, priorityFilter, typeFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDownIcon className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-50" />;
    return sortDir === "asc" ? <ArrowUpIcon className="ml-1 h-3 w-3 text-[#2563EB]" /> : <ArrowDownIcon className="ml-1 h-3 w-3 text-[#2563EB]" />;
  }

  async function handleSaveFilter() {
    if (!filterName.trim() || !project) return;
    const conditions: any[] = [];
    if (statusFilter !== "all") conditions.push({ field: "status", operator: "equals", value: statusFilter });
    if (priorityFilter !== "all") conditions.push({ field: "priority", operator: "equals", value: priorityFilter });
    if (typeFilter !== "all") conditions.push({ field: "type", operator: "equals", value: typeFilter });
    await createFilter({
      name: filterName.trim(),
      workspaceId: project.workspaceId,
      projectId,
      conditions,
      sortField,
      sortOrder: sortDir,
    });
    setFilterName("");
    setShowSaveDialog(false);
  }

  function applySavedFilter(filter: typeof savedFilters[0]) {
    for (const c of filter.conditions) {
      if (c.field === "status") setStatusFilter(c.value);
      else if (c.field === "priority") setPriorityFilter(c.value);
      else if (c.field === "type") setTypeFilter(c.value);
    }
    if (filter.sortField) setSortField(filter.sortField as SortField);
    if (filter.sortOrder) setSortDir(filter.sortOrder);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#C3C6D7] bg-white py-2 pl-9 pr-3 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
            <option value="all">All statuses</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
            <option value="all">All priorities</option>
            <option value="highest">Highest</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="lowest">Lowest</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
            <option value="all">All types</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="story">Story</option>
            <option value="epic">Epic</option>
            <option value="subtask">Subtask</option>
          </select>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#C3C6D7] bg-white px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#F1F2F6] transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            Save filter
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#C3C6D7]/20 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#C3C6D7]/20 text-xs font-semibold uppercase tracking-wider text-[#737686]">
                <Th sortable field="taskKey" onClick={toggleSort}><SortIcon field="taskKey" />Key</Th>
                <Th sortable field="title" onClick={toggleSort}><SortIcon field="title" />Title</Th>
                <Th sortable field="status" onClick={toggleSort}><SortIcon field="status" />Status</Th>
                <Th sortable field="priority" onClick={toggleSort}><SortIcon field="priority" />Priority</Th>
                <Th sortable field="assignee" onClick={toggleSort}><SortIcon field="assignee" />Assignee</Th>
                <Th sortable field="updatedAt" onClick={toggleSort}><SortIcon field="updatedAt" />Updated</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3C6D7]/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#737686]">No tasks found</td>
                </tr>
              ) : (
                filtered.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => router.push(`/task/${task.taskKey}`)}
                    className="cursor-pointer text-sm text-[#434655] transition-colors hover:bg-[#F8F9FF]"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-[#2563EB]">{task.taskKey}</td>
                    <td className="px-4 py-3 font-medium text-[#121C28]">{task.title}</td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3">{task.assignee || <span className="text-[#C3C6D7]">Unassigned</span>}</td>
                    <td className="px-4 py-3 text-xs text-[#737686]">{formatDate(task.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowSaveDialog(false)}>
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-[#121C28] mb-2">Save current filter</h3>
              <input
                autoFocus
                placeholder="Filter name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveFilter(); if (e.key === "Escape") setShowSaveDialog(false); }}
                className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowSaveDialog(false)} className="rounded-lg border border-[#C3C6D7] px-4 py-2 text-sm text-[#434655] hover:bg-[#F1F2F6]">Cancel</button>
                <button onClick={handleSaveFilter} className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {savedFilters.length > 0 && (
        <div className="w-60 flex-shrink-0">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">Saved Filters</h3>
          <div className="space-y-1">
            {savedFilters.map((filter) => (
              <div key={filter._id} className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#434655] hover:bg-[#F1F2F6] cursor-pointer">
                <button onClick={() => applySavedFilter(filter)} className="flex-1 text-left truncate">{filter.name}</button>
                <button onClick={() => deleteFilter(filter._id)} className="hidden group-hover:block text-[#C3C6D7] hover:text-red-500">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, sortable, field, onClick }: { children: React.ReactNode; sortable?: boolean; field?: SortField; onClick?: (field: SortField) => void }) {
  return (
    <th
      className={clsx("group px-4 py-3", sortable && "cursor-pointer hover:text-[#121C28]")}
      onClick={() => sortable && field && onClick?.(field)}
    >
      <div className="flex items-center">{children}</div>
    </th>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    todo: "bg-[#F1F2F6] text-[#737686]",
    in_progress: "bg-[#DBEAFE] text-[#2563EB]",
    in_review: "bg-[#FEF3C7] text-[#D97706]",
    done: "bg-[#D1FAE5] text-[#059669]",
  };
  const labels: Record<string, string> = {
    todo: "Todo",
    in_progress: "In Progress",
    in_review: "In Review",
    done: "Done",
  };
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${styles[status] || styles.todo}`}>
      {labels[status] || status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const icons: Record<string, string> = {
    highest: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🟢",
    lowest: "⚪",
  };
  return <span className="text-xs">{icons[priority] || "⚪"} {priority}</span>;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function ArrowUpDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3l4 4-4 4M16 21l-4-4 4-4" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12l7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7 7 7-7" />
    </svg>
  );
}
