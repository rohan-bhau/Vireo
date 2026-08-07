"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { clsx } from "clsx";
import type { RootState } from "@/store";
import { useGetWorkspaceTasksQuery } from "@/store/taskApi";
import { useGetWorkspaceProjectsQuery, useGetProjectBoardsQuery } from "@/store/projectApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { SkeletonTableRows } from "@/components/ui/skeleton";
import { BoardQuickCreate } from "@/components/board/board-quick-create";
import { TypeIcon } from "@/components/tasks/type-icons";
import { joinWorkspaceRoom, leaveWorkspaceRoom, onTaskCreated, onTaskUpdated, onTaskMoved, onTaskDeleted, onTaskReordered } from "@/lib/socket";

type SortKey = "key" | "title" | "status" | "priority" | "assignee" | "updated";
type SortDir = "asc" | "desc";

interface ListTabProps {
  workspaceId: string;
}

const STATUS_LABELS: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

const PRIORITY_LABELS: Record<string, string> = {
  lowest: "Lowest",
  low: "Low",
  medium: "Medium",
  high: "High",
  highest: "Highest",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-[#E5E7EF] text-[#434655]",
  in_progress: "bg-[#DBEAFE] text-[#2563EB]",
  in_review: "bg-[#FEF3C7] text-[#D97706]",
  done: "bg-[#D1FAE5] text-[#059669]",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ListTab({ workspaceId }: ListTabProps) {
  const router = useRouter();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const { data: tasks = [], isLoading, refetch: refetchTasks } = useGetWorkspaceTasksQuery(workspaceId);
  const { data: projects = [] } = useGetWorkspaceProjectsQuery(workspaceId);
  const { data: members = [] } = useGetMembersQuery(workspaceId);
  const firstProject = projects[0];
  const boards = useGetProjectBoardsQuery(firstProject?.id || "", { skip: !firstProject });

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) if (m.user?.name) map[m.userId] = m.user.name;
    return map;
  }, [members]);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [quickCreating, setQuickCreating] = useState(false);

  useEffect(() => {
    joinWorkspaceRoom(workspaceId);
    return () => leaveWorkspaceRoom(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    const refresh = () => { if (refetchTasks) refetchTasks(); };
    const offs = [
      onTaskCreated((data) => { if (data.actorId !== currentUserId) refresh(); }),
      onTaskUpdated((data) => { if (data.actorId !== currentUserId) refresh(); }),
      onTaskMoved((data) => { if (data.actorId !== currentUserId) refresh(); }),
      onTaskDeleted((data) => { if (data.actorId !== currentUserId) refresh(); }),
      onTaskReordered((data) => { if ((data as { actorId?: string }).actorId !== currentUserId) refresh(); }),
    ];
    return () => offs.forEach((off) => off());
  }, [refetchTasks, currentUserId]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "updated" ? "desc" : "asc");
    }
  }

  const filtered = tasks
    .filter((t) => {
      if (statusFilter !== "all") {
        const filterVal = statusFilter.replace("-", "_");
        if (t.status !== filterVal) return false;
      }
      if (searchText) {
        const q = searchText.toLowerCase();
        return (
          t.taskKey.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "updated" && sortDir === "desc" && !searchText && statusFilter === "all") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "key": return a.taskKey.localeCompare(b.taskKey) * dir;
        case "title": return a.title.localeCompare(b.title) * dir;
        case "status": return a.status.localeCompare(b.status) * dir;
        case "priority": return priorityOrder(a.priority) - priorityOrder(b.priority) * (dir > 0 ? 1 : -1);
        case "assignee": return (a.assignee || "").localeCompare(b.assignee || "") * dir;
        case "updated": return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime() * (dir > 0 ? 1 : -1);
        default: return 0;
      }
    });

  function priorityOrder(p: string): number {
    const order: Record<string, number> = {
      lowest: 0, low: 1, medium: 2, high: 3, highest: 4,
    };
    return order[p] ?? 2;
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "key", label: "Task" },
    { key: "title", label: "Title" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "assignee", label: "Assignee" },
    { key: "updated", label: "Updated" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-lg border border-[#C3C6D7] bg-white py-2 pl-9 pr-3 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="all">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="done">Done</option>
        </select>
        <Button size="sm" onClick={() => setQuickCreating((v) => !v)}>
          + Create task
        </Button>
      </div>

      {quickCreating && firstProject && (
        <div className="mb-4 rounded-xl border border-[#C3C6D7]/20 bg-white p-3">
          <BoardQuickCreate
            workspaceId={workspaceId}
            projectId={firstProject.id}
            boardId={boards.data?.[0]?.id || ""}
            columnId={boards.data?.[0]?.columns?.[0]?.id || ""}
            onClose={() => setQuickCreating(false)}
          />
        </div>
      )}

      <div className="flex-1 overflow-x-auto rounded-xl border border-[#C3C6D7]/20 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#C3C6D7]/20">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#737686] hover:text-[#121C28] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <svg className={clsx("h-3 w-3 transition-transform", sortDir === "desc" && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonTableRows rows={5} />
            ) : filtered.length > 0 ? (
              filtered.map((task) => (
                <tr
                  key={task.taskKey}
                  onClick={() => router.push(`/task/${task.taskKey}`)}
                  className="border-b border-[#C3C6D7]/10 cursor-pointer transition-colors hover:bg-[#F8F9FF]"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium text-[#2563EB]">
                      {task.taskKey}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TaskTypeBadge type={task.type} />
                      <span className="text-sm font-medium text-[#121C28] truncate max-w-[250px]">
                        {task.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_COLORS[task.status])}>
                      {STATUS_LABELS[task.status] || task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#434655]">
                      {PRIORITY_LABELS[task.priority] || task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-semibold text-white">
                          {task.assignee.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm text-[#434655]">{memberMap[task.assignee || ""] || task.assignee || "Unassigned"}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-[#C3C6D7]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#737686]">{timeAgo(task.updatedAt)}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="h-8 w-8 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 14l2 2 4-4" />
                    </svg>
                    <p className="text-sm text-text-tertiary">No tasks found</p>
                    <p className="text-xs text-text-tertiary">
                      {searchText || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Create your first task to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaskTypeBadge({ type }: { type: string }) {
  return <TypeIcon type={type} className="h-3.5 w-3.5" />;
}
