"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Task, TaskStatus, TaskPriority } from "@/store/taskApi";
import { useUpdateTaskMutation } from "@/store/taskApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { StatusBadge } from "./status-badge";
import { PriorityIcon } from "./priority-icon";
import { IssueTypeIcon } from "./issue-type-icon";
import { AssigneePicker } from "./assignee-picker";
import { LabelEditor } from "./label-editor";

interface IssueDetailDetailsPanelProps {
  task: Task;
  workspaceId: string;
}

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "highest", label: "Highest" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "lowest", label: "Lowest" },
];

export function IssueDetailDetailsPanel({ task, workspaceId }: IssueDetailDetailsPanelProps) {
  const router = useRouter();
  const [updateTask] = useUpdateTaskMutation();
  const { data: members } = useGetMembersQuery(workspaceId);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<any>(null);

  function getUserName(userId: string): string {
    const member = members?.find((m) => m.userId === userId);
    return member?.user?.name || userId;
  }

  async function handleSave(field: string, value: any) {
    try {
      await updateTask({ taskKey: task.taskKey, data: { [field]: value } }).unwrap();
      setEditingField(null);
    } catch {}
  }

  function startEdit(field: string, currentValue: any) {
    setEditingField(field);
    setFieldValue(currentValue);
  }

  const DetailRow = ({
    label,
    field,
    children,
    onEdit,
    isEmpty,
  }: {
    label: string;
    field: string;
    children: React.ReactNode;
    onEdit?: () => void;
    isEmpty?: boolean;
  }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-text-placeholder">{label}</span>
      <div
        className={`rounded-[3px] -ml-1 px-1 py-0.5 min-h-[24px] cursor-pointer hover:bg-bg-light transition-colors ${
          editingField === field ? "bg-bg-light" : ""
        }`}
        onClick={() => onEdit?.()}
      >
        {children}
      </div>
      {isEmpty && !onEdit && (
        <div className="rounded-[3px] -ml-1 px-1 py-0.5 text-xs text-text-placeholder">None</div>
      )}
    </div>
  );

  function StatusEditor() {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
          <StatusBadge status={task.status} size="md" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[3px] border border-border-light bg-surface shadow-modal">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => { handleSave("status", s.value); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${s.value === task.status ? "bg-bg-light font-medium" : ""}`}
                >
                  <StatusBadge status={s.value} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  function PriorityEditor() {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)} className="w-full text-left flex items-center gap-1.5">
          <PriorityIcon priority={task.priority} />
          <span className="text-xs text-text capitalize">{task.priority}</span>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[3px] border border-border-light bg-surface shadow-modal">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { handleSave("priority", p.value); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${p.value === task.priority ? "bg-bg-light font-medium" : ""}`}
                >
                  <PriorityIcon priority={p.value} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 max-lg:w-full">
      <div className="flex flex-col gap-3 rounded-[3px] border border-border-light bg-surface p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-placeholder">
          Details
        </h3>

        <DetailRow label="Status" field="status">
          <StatusEditor />
        </DetailRow>

        <DetailRow label="Issue type" field="type">
          <div className="flex items-center gap-1.5">
            <IssueTypeIcon type={task.type} />
            <span className="text-xs text-text capitalize">{task.type}</span>
          </div>
        </DetailRow>

        <DetailRow label="Priority" field="priority">
          <PriorityEditor />
        </DetailRow>

        <DetailRow
          label="Assignee"
          field="assignee"
          onEdit={() => startEdit("assignee", task.assignee)}
        >
          {editingField === "assignee" ? (
            <AssigneePicker
              workspaceId={workspaceId}
              value={fieldValue}
              onChange={(v) => { handleSave("assignee", v); }}
            />
          ) : (
            <span className="text-xs text-text">{task.assignee ? getUserName(task.assignee) : "Unassigned"}</span>
          )}
        </DetailRow>

        <DetailRow label="Reporter" field="reporter">
          <span className="text-xs text-text">{getUserName(task.reporter)}</span>
        </DetailRow>

        <DetailRow
          label="Labels"
          field="labels"
          onEdit={() => startEdit("labels", task.labels)}
        >
          {editingField === "labels" ? (
            <LabelEditor
              workspaceId={workspaceId}
              value={fieldValue || []}
              onChange={(v) => { handleSave("labels", v); }}
            />
          ) : task.labels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {task.labels.map((l) => (
                <span key={l} className="rounded bg-bg-light px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
                  {l}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-text-placeholder">None</span>
          )}
        </DetailRow>

        <DetailRow label="Sprint" field="sprint">
          <span className="text-xs text-text">{task.sprintId || "None"}</span>
        </DetailRow>

        <DetailRow
          label="Story points"
          field="storyPoints"
          onEdit={() => startEdit("storyPoints", task.storyPoints?.toString() || "")}
        >
          {editingField === "storyPoints" ? (
            <input
              type="number"
              min="0"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              onBlur={() => handleSave("storyPoints", fieldValue ? parseInt(fieldValue, 10) : null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave("storyPoints", fieldValue ? parseInt(fieldValue, 10) : null);
                if (e.key === "Escape") setEditingField(null);
              }}
              className="w-full rounded border border-primary bg-surface px-2 py-0.5 text-xs text-text focus:outline-none"
              autoFocus
            />
          ) : (
            <span className="text-xs text-text">
              {task.storyPoints !== null ? `${task.storyPoints} pts` : "None"}
            </span>
          )}
        </DetailRow>

        <DetailRow
          label="Due date"
          field="dueDate"
          onEdit={() => startEdit("dueDate", task.dueDate?.split("T")[0] || "")}
        >
          {editingField === "dueDate" ? (
            <input
              type="date"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              onBlur={() => handleSave("dueDate", fieldValue || null)}
              className="w-full rounded border border-primary bg-surface px-2 py-0.5 text-xs text-text focus:outline-none"
              autoFocus
            />
          ) : (
            <span className="text-xs text-text">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}
            </span>
          )}
        </DetailRow>

        {task.parentTask && (
          <DetailRow label="Parent" field="parent">
            <button
              onClick={() => router.push(`/task/${task.parentTask}`)}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {task.parentTask}
            </button>
          </DetailRow>
        )}

        {task.linkedTasks.length > 0 && (
          <DetailRow label="Linked issues" field="linked">
            <div className="flex flex-col gap-1">
              {task.linkedTasks.map((link) => (
                <button
                  key={link.taskId}
                  onClick={() => router.push(`/task/${link.taskId}`)}
                  className="flex items-center gap-1 text-xs"
                >
                  <span className="text-[10px] uppercase text-text-placeholder">
                    {link.type.replace("_", " ")}
                  </span>
                  <span className="font-medium text-primary hover:text-primary-dark">
                    {link.taskId}
                  </span>
                </button>
              ))}
            </div>
          </DetailRow>
        )}
      </div>
    </div>
  );
}