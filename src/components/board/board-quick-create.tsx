"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { useCreateTaskMutation, type TaskType } from "@/store/taskApi";
import { useGetProjectQuery } from "@/store/projectApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import type { WorkspaceMember } from "@/store/workspaceApi";
import { TypeIcon } from "@/components/tasks/type-icons";
import { DropdownPanel } from "@/components/ui/dropdown";

const TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "story", label: "Story" },
  { value: "epic", label: "Epic" },
  { value: "bug", label: "Bug" },
];

interface BoardQuickCreateProps {
  workspaceId: string;
  projectId: string;
  boardId: string;
  columnId: string;
  onClose: () => void;
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : "";
  return (first + second).toUpperCase();
}

export function BoardQuickCreate({ workspaceId, projectId, boardId, columnId, onClose }: BoardQuickCreateProps) {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { data: members = [] } = useGetMembersQuery(workspaceId);
  const { data: project } = useGetProjectQuery(projectId, { skip: !projectId });

  const typeOptions = project?.enabledIssueTypes?.length
    ? TYPE_OPTIONS.filter((t) => project!.enabledIssueTypes!.includes(t.value))
    : TYPE_OPTIONS;

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("task");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState<string | null>(null);

  const [typeOpen, setTypeOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [dueOpen, setDueOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const typeAnchorRef = useRef<HTMLButtonElement>(null);
  const dueAnchorRef = useRef<HTMLButtonElement>(null);
  const assigneeAnchorRef = useRef<HTMLButtonElement>(null);

  const closeAll = useCallback(() => {
    setTypeOpen(false);
    setAssigneeOpen(false);
    setDueOpen(false);
  }, [setTypeOpen, setAssigneeOpen, setDueOpen]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest?.("[data-dropdown-panel]")
      ) {
        closeAll();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [closeAll]);

  function closePopup(kind: "type" | "assignee" | "due") {
    if (kind === "type") setTypeOpen(false);
    if (kind === "assignee") setAssigneeOpen(false);
    if (kind === "due") setDueOpen(false);
  }

  const selectedType = typeOptions.find((t) => t.value === type) || typeOptions[0];
  const effectiveType = selectedType.value;
  const assigneeMember = members.find((m) => m.userId === assignee);

  async function handleCreate() {
    if (!title.trim() || isLoading) return;
    try {
      await createTask({
        title: title.trim(),
        type: effectiveType,
        workspaceId,
        projectId,
        boardId,
        columnId,
        ...(dueDate ? { dueDate } : {}),
        ...(assignee ? { assignee } : {}),
      }).unwrap();
      onClose();
    } catch {
      // keep form open so user can fix input
    }
  }

  return (
    <div ref={rootRef} className="rounded-lg bg-white border border-[#C3C6D7]/40 shadow-card p-2 space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreate();
          if (e.key === "Escape") { closeAll(); onClose(); }
        }}
        placeholder="What needs to be done?"
        className="w-full rounded-[3px] border border-[#C3C6D7] bg-[#F8F9FF] px-2.5 py-1.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
      />

      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            ref={typeAnchorRef}
            type="button"
            onClick={() => (typeOpen ? closePopup("type") : (closePopup("assignee"), closePopup("due"), setTypeOpen(true)))}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#F4F5F7] transition-colors"
            title={selectedType.label}
          >
            <TypeIcon type={selectedType.value} className="h-4 w-4" />
            <svg className="h-3 w-3 text-[#737686]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <DropdownPanel open={typeOpen} triggerRef={typeAnchorRef} onClose={() => setTypeOpen(false)} width={176}>
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setType(opt.value); setTypeOpen(false); }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#F8F9FF] text-left",
                  opt.value === effectiveType && "bg-[#F0F6FF] font-medium"
                )}
              >
                <TypeIcon type={opt.value} className="h-3.5 w-3.5 shrink-0" />
                {opt.label}
              </button>
            ))}
          </DropdownPanel>
        </div>

        <div className="relative">
          <button
            ref={dueAnchorRef}
            type="button"
            onClick={() => (dueOpen ? closePopup("due") : (closePopup("type"), closePopup("assignee"), setDueOpen(true)))}
            className={clsx(
              "flex h-6 items-center gap-1 rounded px-1.5 text-[#737686] hover:bg-[#F4F5F7] transition-colors",
              dueDate && "text-[#2563EB]"
            )}
            title="Due date"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {dueDate && <span className="text-[10px] font-medium">{dueDate.slice(5)}</span>}
          </button>
          <DropdownPanel open={dueOpen} triggerRef={dueAnchorRef} onClose={() => setDueOpen(false)} width={208}>
            <div className="p-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); }}
                onKeyDown={(e) => { if (e.key === "Escape") setDueOpen(false); }}
                className="w-full rounded border border-[#C3C6D7] px-2 py-1 text-xs text-[#121C28] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </DropdownPanel>
        </div>

        <div className="relative">
          <button
            ref={assigneeAnchorRef}
            type="button"
            onClick={() => (assigneeOpen ? closePopup("assignee") : (closePopup("type"), closePopup("due"), setAssigneeOpen(true)))}
            className={clsx(
              "flex h-6 items-center justify-center rounded px-1 hover:bg-[#F4F5F7] transition-colors",
              assigneeMember && "bg-[#2563EB] text-white"
            )}
            title={assigneeMember?.user?.name || "Assignee"}
          >
            {assigneeMember ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-semibold text-[#2563EB]">
                {getInitials(assigneeMember.user?.name || "")}
              </span>
            ) : (
              <svg className="h-3.5 w-3.5 text-[#737686]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            )}
          </button>
          <DropdownPanel open={assigneeOpen} triggerRef={assigneeAnchorRef} onClose={() => setAssigneeOpen(false)} width={192} maxHeight={224}>
            <button
              type="button"
              onClick={() => { setAssignee(null); setAssigneeOpen(false); }}
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
            {members.map((m: WorkspaceMember) => (
              <button
                key={m.userId}
                type="button"
                onClick={() => { setAssignee(m.userId); setAssigneeOpen(false); }}
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

        <button
          type="button"
          onClick={handleCreate}
          disabled={!title.trim() || isLoading}
          className="ml-auto rounded-[3px] bg-[#0065FF] px-3 py-1 text-xs font-medium text-white hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}