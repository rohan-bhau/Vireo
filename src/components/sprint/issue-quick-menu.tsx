"use client";

import { useState, useRef, useEffect } from "react";
import type { Task } from "@/store/taskApi";
import type { Sprint } from "@/store/sprintApi";
import { useAssignTasksToSprintMutation, useRemoveTasksFromSprintMutation } from "@/store/sprintApi";
import { useUpdateTaskMutation } from "@/store/taskApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { clsx } from "clsx";
import { Pencil, ArrowRight, Flag, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IssueQuickMenuProps {
  task: Task;
  sprints?: Sprint[];
  projectId?: string;
  workspaceId?: string;
  onClose: () => void;
}

export function IssueQuickMenu({ task, sprints = [], projectId, workspaceId, onClose }: IssueQuickMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [assignTasks] = useAssignTasksToSprintMutation();
  const [removeTasks] = useRemoveTasksFromSprintMutation();
  const [updateTask] = useUpdateTaskMutation();
  const { data: members = [] } = useGetMembersQuery(workspaceId ?? "", { skip: !workspaceId });
  const [showEstimateInput, setShowEstimateInput] = useState(false);
  const [showAssignSearch, setShowAssignSearch] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [estimateValue, setEstimateValue] = useState(task.storyPoints?.toString() || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  async function handleMoveToSprint(sprintId: string | null) {
    if (!projectId) return;
    setSubmitting(true);
    try {
      if (sprintId) {
        await assignTasks({ sprintId, taskKeys: [task.taskKey], projectId }).unwrap();
      } else {
        if (task.sprintId) {
          await removeTasks({ sprintId: task.sprintId, taskKeys: [task.taskKey], projectId }).unwrap();
        }
      }
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssign(userId: string | null) {
    setSubmitting(true);
    try {
      await updateTask({
        taskKey: task.taskKey,
        data: { assignee: userId },
      }).unwrap();
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFlag() {
    try {
      await updateTask({
        taskKey: task.taskKey,
        data: { labels: task.labels.includes("flagged") ? task.labels.filter((l) => l !== "flagged") : [...task.labels, "flagged"] },
      }).unwrap();
      onClose();
    } catch {}
  }

  async function handleEstimate() {
    const pts = parseInt(estimateValue, 10);
    if (isNaN(pts) || pts < 0) return;
    setSubmitting(true);
    try {
      await updateTask({
        taskKey: task.taskKey,
        data: { storyPoints: pts },
      }).unwrap();
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${task.taskKey}?`)) return;
    setSubmitting(true);
    try {
      await updateTask({
        taskKey: task.taskKey,
        data: { status: "done" },
      }).unwrap();
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  const isFlagged = task.labels?.includes("flagged");
  const filteredMembers = members.filter((m) =>
    (m.user?.name || m.userId).toLowerCase().includes(assignSearch.toLowerCase())
  );
  const currentAssignee = members.find((m) => m.userId === task.assignee);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-56 origin-top-right rounded-[3px] border border-[#DFE1E6] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 text-[11px] font-medium text-[#5E6C84] uppercase tracking-wider border-b border-[#EBECF0]">
        {task.taskKey}
      </div>

      {showAssignSearch ? (
        <div className="px-3 py-2 border-b border-[#EBECF0]">
          <input
            autoFocus
            placeholder="Search members..."
            value={assignSearch}
            onChange={(e) => setAssignSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowAssignSearch(false);
            }}
            className="w-full rounded-[3px] border border-[#DFE1E6] px-2 py-1 text-xs text-[#172B4D] placeholder:text-[#8993A4] focus:outline-none focus:ring-1 focus:ring-[#4C9AFF] mb-1"
          />
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            <button
              onClick={() => handleAssign(null)}
              className="w-full flex items-center gap-2 px-2 py-1 text-xs text-[#5E6C84] hover:bg-[#F4F5F7] rounded-[3px]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F4F5F7] text-[9px] text-[#5E6C84]">—</span>
              Unassign
            </button>
            {filteredMembers.map((m) => (
              <button
                key={m.userId}
                onClick={() => handleAssign(m.userId)}
                className={clsx(
                  "w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-[#F4F5F7] rounded-[3px]",
                  m.userId === task.assignee ? "text-[#0065FF] font-medium" : "text-[#172B4D]"
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0065FF] text-[9px] font-semibold text-white flex-shrink-0">
                  {(m.user?.name || m.userId).charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{m.user?.name || m.userId}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAssignSearch(true)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#172B4D] hover:bg-[#F4F5F7] transition-colors text-left"
        >
          <User className="h-3.5 w-3.5 text-[#5E6C84]" />
          <span>
            {currentAssignee
              ? `Assign to ${currentAssignee.user?.name || currentAssignee.userId}`
              : "Assign"}
          </span>
        </button>
      )}

      {showEstimateInput ? (
        <div className="px-3 py-2 border-b border-[#EBECF0]">
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="number"
              min="0"
              value={estimateValue}
              onChange={(e) => setEstimateValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEstimate();
                if (e.key === "Escape") setShowEstimateInput(false);
              }}
              className="w-16 rounded-[3px] border border-[#DFE1E6] px-2 py-1 text-xs text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#4C9AFF]"
              placeholder="pts"
            />
            <Button size="sm" onClick={handleEstimate} disabled={submitting}>Save</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowEstimateInput(true)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#172B4D] hover:bg-[#F4F5F7] transition-colors text-left"
        >
          <Pencil className="h-3.5 w-3.5 text-[#5E6C84]" />
          <span>Change estimate{task.storyPoints ? ` (${task.storyPoints}pts)` : ""}</span>
        </button>
      )}

      {sprints.length > 0 && (
        <div className="border-b border-[#EBECF0] py-1">
          <div className="px-3 py-1 text-[11px] font-medium text-[#5E6C84] uppercase tracking-wider">
            Move to sprint
          </div>
          {sprints.map((s) => (
            <button
              key={s.id}
              onClick={() => handleMoveToSprint(s.id)}
              disabled={submitting}
              className={clsx(
                "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#172B4D] hover:bg-[#F4F5F7] transition-colors text-left",
                task.sprintId === s.id && "text-[#0065FF] font-medium"
              )}
            >
              <ArrowRight className="h-3.5 w-3.5 text-[#5E6C84]" />
              <span>{s.name}</span>
              <span className="ml-auto text-[10px] text-[#5E6C84]">{s.status === "ACTIVE" ? "Active" : s.status === "PLANNING" ? "Planning" : "Done"}</span>
            </button>
          ))}
          {task.sprintId && (
            <button
              onClick={() => handleMoveToSprint(null)}
              disabled={submitting}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#172B4D] hover:bg-[#F4F5F7] transition-colors text-left"
            >
              <ArrowRight className="h-3.5 w-3.5 text-[#5E6C84]" />
              <span>Backlog</span>
            </button>
          )}
        </div>
      )}

      <button
        onClick={handleFlag}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#172B4D] hover:bg-[#F4F5F7] transition-colors text-left"
      >
        <Flag className={clsx("h-3.5 w-3.5", isFlagged ? "text-[#FF8F5E] fill-[#FF8F5E]" : "text-[#5E6C84]")} />
        <span>{isFlagged ? "Remove flag" : "Flag"}</span>
      </button>

      <button
        onClick={handleDelete}
        disabled={submitting}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#DE350B] hover:bg-[#FFEBE6] transition-colors text-left border-t border-[#EBECF0]"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete</span>
      </button>
    </div>
  );
}
