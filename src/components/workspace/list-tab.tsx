"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { clsx } from "clsx";
import { useDropdown, DropdownPanel } from "@/components/ui/dropdown";
import type { RootState } from "@/store";
import { useGetWorkspaceTasksQuery, useUpdateTaskMutation, type Task } from "@/store/taskApi";
import type { WorkspaceMember } from "@/store/workspaceApi";
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
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [updateTask] = useUpdateTaskMutation();
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
  const [assigneeEditingKey, setAssigneeEditingKey] = useState<string | null>(null);

  async function handleAssigneeChange(taskKey: string, userId: string | null) {
    try {
      await updateTask({ taskKey, data: { assignee: userId }, workspaceId }).unwrap();
    } catch {
      // surface nothing; query invalidation revalidates on failure too
    }
    setAssigneeEditingKey(null);
  }

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

  const childrenOf = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filtered) {
      if (!t.parentTask) continue;
      const list = map.get(t.parentTask) || [];
      list.push(t);
      map.set(t.parentTask, list);
    }
    return map;
  }, [filtered]);

  const topLevel = useMemo(
    () => filtered.filter((t) => !t.parentTask || !filtered.some((p) => p.taskKey === t.parentTask)),
    [filtered]
  );

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
              topLevel.map((task) => (
                <TaskRowGroup
                  key={task.taskKey}
                  task={task}
                  childrenTasks={childrenOf.get(task.taskKey) || []}
                  memberMap={memberMap}
                  members={members}
                  assigneeEditingKey={assigneeEditingKey}
                  onToggleEdit={(k) => setAssigneeEditingKey((cur) => (cur === k ? null : k))}
                  onAssigneeChange={(k, userId) => handleAssigneeChange(k, userId)}
                />
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

interface TaskRowGroupProps {
  task: Task;
  childrenTasks: Task[];
  memberMap: Record<string, string>;
  members: WorkspaceMember[];
  assigneeEditingKey: string | null;
  onToggleEdit: (taskKey: string) => void;
  onAssigneeChange: (taskKey: string, userId: string | null) => void;
}

function TaskRowGroup({
  task,
  childrenTasks,
  memberMap,
  members,
  assigneeEditingKey,
  onToggleEdit,
  onAssigneeChange,
}: TaskRowGroupProps) {
  return (
    <>
      <TaskRow
        task={task}
        isSubtaskRow={false}
        memberMap={memberMap}
        members={members}
        editing={assigneeEditingKey === task.taskKey}
        onToggleEdit={onToggleEdit}
        onAssigneeChange={onAssigneeChange}
      />
      {childrenTasks.map((sub) => (
        <TaskRow
          key={sub.taskKey}
          task={sub}
          isSubtaskRow
          memberMap={memberMap}
          members={members}
          editing={assigneeEditingKey === sub.taskKey}
          onToggleEdit={onToggleEdit}
          onAssigneeChange={onAssigneeChange}
        />
      ))}
    </>
  );
}

interface TaskRowProps {
  task: Task;
  isSubtaskRow: boolean;
  memberMap: Record<string, string>;
  members: WorkspaceMember[];
  editing: boolean;
  onToggleEdit: (taskKey: string) => void;
  onAssigneeChange: (taskKey: string, userId: string | null) => void;
}

function TaskRow({ task, isSubtaskRow, memberMap, members, editing, onToggleEdit, onAssigneeChange }: TaskRowProps) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(`/task/${task.taskKey}`)}
      className={clsx(
        "border-b border-[#C3C6D7]/10 cursor-pointer transition-colors hover:bg-[#F8F9FF]",
        isSubtaskRow && "bg-[#FCFCFE]"
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {isSubtaskRow && (
            <svg className="h-3 w-3 text-[#C3C6D7] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
          <span className={clsx("text-sm font-mono font-medium text-[#2563EB]", isSubtaskRow && "text-xs")}>
            {task.taskKey}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <TaskTypeBadge type={task.type} />
          <span className={clsx("text-sm font-medium text-[#121C28] truncate max-w-[250px]", isSubtaskRow && "text-xs text-[#434655]")}>
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
        <ListAssigneeCell
          assignee={task.assignee}
          assigneeName={memberMap[task.assignee || ""]}
          members={members}
          editing={editing}
          onToggleEdit={() => onToggleEdit(task.taskKey)}
          onChange={(userId) => onAssigneeChange(task.taskKey, userId)}
        />
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-[#737686]">{timeAgo(task.updatedAt)}</span>
      </td>
    </tr>
  );
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : "";
  return (first + second).toUpperCase();
}

interface ListAssigneeCellProps {
  assignee: string | null;
  assigneeName?: string;
  members: WorkspaceMember[];
  editing: boolean;
  onToggleEdit: () => void;
  onChange: (userId: string | null) => void;
}

function ListAssigneeCell({
  assignee,
  assigneeName,
  members,
  editing,
  onToggleEdit,
  onChange,
}: ListAssigneeCellProps) {
  const { open, setOpen, triggerRef } = useDropdown();

  useEffect(() => {
    if (!editing) setOpen(false);
  }, [editing, setOpen]);

  const assignedMember = members.find((m) => m.userId === assignee);
  const displayName = assigneeName || assignedMember?.user?.name || "";

  return (
    <div className="relative flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleEdit();
        }}
        title={displayName || "Unassigned"}
        className={clsx(
          "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-opacity hover:opacity-80",
          assignee ? "bg-[#2563EB] text-white" : "bg-[#F4F5F7] text-[#737686]"
        )}
      >
        {assignee ? (
          getInitials(displayName)
        ) : (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
          </svg>
        )}
      </button>
      {assignee && (
        <span className="ml-2 text-sm text-[#434655]">{displayName}</span>
      )}
      {!assignee && (
        <span className="ml-2 text-sm text-[#C3C6D7]">Unassigned</span>
      )}

      <DropdownPanel open={Boolean(open && editing)} triggerRef={triggerRef} onClose={onToggleEdit} width={192}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
            setOpen(false);
          }}
          className={clsx(
            "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#F6F9FF] text-left",
            !assignee && "bg-[#F0F6FF] font-medium"
          )}
        >
          <svg className="h-3.5 w-3.5 text-[#737686]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
          Unassigned
        </button>
        {members.map((m) => (
          <button
            key={m.userId}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(m.userId);
              setOpen(false);
            }}
            className={clsx(
              "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#F6F9FF] text-left",
              assignee === m.userId && "bg-[#F0F6FF] font-medium"
            )}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[8px] font-semibold text-white">
              {getInitials(m.user?.name || "")}
            </span>
            <span className="truncate">{m.user?.name || "Unknown"}</span>
          </button>
        ))}
      </DropdownPanel>
    </div>
  );
}
