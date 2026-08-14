"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropdown, DropdownPanel } from "@/components/ui/dropdown";
import type { Task, TaskStatus, TaskPriority, UpdateTaskInput } from "@/store/taskApi";
import { useUpdateTaskMutation } from "@/store/taskApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { useGetWorkspaceCustomFieldsQuery } from "@/store/customFieldApi";
import { StatusBadge } from "./status-badge";
import { PriorityIcon } from "./priority-icon";
import { IssueTypeIcon } from "./issue-type-icon";
import { AssigneePicker } from "./assignee-picker";
import { LabelEditor } from "./label-editor";
import { MultiComponentSelector } from "./component-selector";
import { VersionSelector } from "./version-selector";
import { toastError } from "@/lib/toast";
import { useCanEdit, useCurrentMember } from "@/hooks/use-can-edit";

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

type FieldValue = string | string[] | number | null;

interface DetailRowProps {
  label: string;
  field?: string;
  children: React.ReactNode;
  onEdit?: () => void;
  isEmpty?: boolean;
  active?: boolean;
  "data-shortcut"?: string;
}

function DetailRow({ label, children, onEdit, isEmpty, active }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-text-placeholder">{label}</span>
      <div
        className={`rounded-[3px] -ml-1 px-1 py-0.5 min-h-[24px] ${
          onEdit ? "cursor-pointer hover:bg-bg-light transition-colors" : ""
        } ${active ? "bg-bg-light" : ""}`}
        onClick={() => onEdit?.()}
      >
        {children}
      </div>
      {isEmpty && !onEdit && (
        <div className="rounded-[3px] -ml-1 px-1 py-0.5 text-xs text-text-placeholder">None</div>
      )}
    </div>
  );
}

function StatusEditor({ status, onChange }: { status: TaskStatus; onChange: (value: TaskStatus) => void }) {
  const { open, setOpen, triggerRef } = useDropdown();
  return (
    <div className="relative">
      <button ref={triggerRef} type="button" onClick={() => setOpen(!open)} className="w-full text-left">
        <StatusBadge status={status} size="md" />
      </button>
      <DropdownPanel open={open} triggerRef={triggerRef} onClose={() => setOpen(false)}>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => { onChange(s.value); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${s.value === status ? "bg-bg-light font-medium" : ""}`}
          >
            <StatusBadge status={s.value} />
          </button>
        ))}
      </DropdownPanel>
    </div>
  );
}

function PriorityEditor({ priority, onChange }: { priority: TaskPriority; onChange: (value: TaskPriority) => void }) {
  const { open, setOpen, triggerRef } = useDropdown();
  return (
    <div className="relative">
      <button ref={triggerRef} type="button" onClick={() => setOpen(!open)} className="w-full text-left flex items-center gap-1.5">
        <PriorityIcon priority={priority} />
        <span className="text-xs text-text capitalize">{priority}</span>
      </button>
      <DropdownPanel open={open} triggerRef={triggerRef} onClose={() => setOpen(false)}>
        {PRIORITIES.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => { onChange(p.value); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${p.value === priority ? "bg-bg-light font-medium" : ""}`}
          >
            <PriorityIcon priority={p.value} />
            <span>{p.label}</span>
          </button>
        ))}
      </DropdownPanel>
    </div>
  );
}

export function IssueDetailDetailsPanel({ task, workspaceId }: IssueDetailDetailsPanelProps) {
  const router = useRouter();
  const [updateTask] = useUpdateTaskMutation();
  const { data: members } = useGetMembersQuery(workspaceId);
  const { data: workspaceCustomFields = [] } = useGetWorkspaceCustomFieldsQuery(workspaceId);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<FieldValue>(null);
  const canEdit = useCanEdit(workspaceId);
  const currentMember = useCurrentMember(workspaceId);
  const isViewAssignee = !canEdit && task.assignee === currentMember?.userId;

  function getUserName(userId: string): string {
    const member = members?.find((m) => m.userId === userId);
    return member?.user?.name || userId;
  }

  async function handleSave(field: string, value: FieldValue) {
    try {
      await updateTask({
        taskKey: task.taskKey,
        data: { [field]: value } as Partial<UpdateTaskInput>,
        workspaceId,
      }).unwrap();
      setEditingField(null);
    } catch (e) {
      toastError((e as { data?: { message?: string }; message?: string })?.data?.message ||
        (e as { message?: string })?.message ||
        "Update failed");
    }
  }

  function startEdit(field: string, currentValue: FieldValue) {
    setEditingField(field);
    setFieldValue(currentValue);
  }

  return (
    <div className="w-full flex-shrink-0 max-lg:w-full lg:w-80 lg:sticky lg:top-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border-light bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-placeholder">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          Details
        </h3>

        <DetailRow label="Status" field="status" active={editingField === "status"}>
          {canEdit || isViewAssignee ? (
            <div data-shortcut="status"><StatusEditor status={task.status} onChange={(value) => handleSave("status", value)} /></div>
          ) : (
            <StatusBadge status={task.status} size="md" />
          )}
        </DetailRow>

        <DetailRow label="Issue type" field="type" active={editingField === "type"}>
          <div className="flex items-center gap-1.5">
            <IssueTypeIcon type={task.type} />
            <span className="text-xs text-text capitalize">{task.type}</span>
          </div>
        </DetailRow>

        <DetailRow label="Priority" field="priority" active={editingField === "priority"}>
          {canEdit ? (
            <div data-shortcut="priority"><PriorityEditor priority={task.priority} onChange={(value) => handleSave("priority", value)} /></div>
          ) : (
            <div className="flex items-center gap-1.5">
              <PriorityIcon priority={task.priority} />
              <span className="text-xs text-text capitalize">{task.priority}</span>
            </div>
          )}
        </DetailRow>

        <DetailRow
          label="Assignee"
          field="assignee"
          onEdit={canEdit ? () => startEdit("assignee", task.assignee) : undefined}
          active={editingField === "assignee"}
          data-shortcut="assignee"
        >
          {editingField === "assignee" ? (
            <AssigneePicker
              workspaceId={workspaceId}
              value={fieldValue as string | null}
              onChange={(v) => { handleSave("assignee", v); }}
            />
          ) : (
            <span className="text-xs text-text">{task.assignee ? getUserName(task.assignee) : "Unassigned"}</span>
          )}
        </DetailRow>

        <DetailRow label="Reporter" field="reporter" active={editingField === "reporter"}>
          <span className="text-xs text-text">{getUserName(task.reporter)}</span>
        </DetailRow>

        <DetailRow
          label="Labels"
          field="labels"
          onEdit={canEdit ? () => startEdit("labels", task.labels) : undefined}
          active={editingField === "labels"}
          data-shortcut="labels"
        >
          {editingField === "labels" ? (
            <LabelEditor
              workspaceId={workspaceId}
              value={(fieldValue as string[]) || []}
              onChange={(v) => { handleSave("labels", v); }}
              projectId={task.projectId}
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

        <DetailRow
          label="Components"
          field="components"
          onEdit={canEdit ? () => startEdit("components", task.components) : undefined}
          active={editingField === "components"}
        >
          {editingField === "components" ? (
            <MultiComponentSelector
              projectId={task.projectId}
              value={(fieldValue as string[]) || []}
              onChange={(v) => { handleSave("components", v); }}
            />
          ) : task.components && task.components.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {task.components.map((c) => (
                <span key={c} className="rounded bg-bg-light px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-text-placeholder">None</span>
          )}
        </DetailRow>

        <DetailRow
          label="Fix Version"
          field="fixVersion"
          onEdit={canEdit ? () => startEdit("fixVersion", task.fixVersion || "") : undefined}
          active={editingField === "fixVersion"}
        >
          {editingField === "fixVersion" ? (
            <VersionSelector
              projectId={task.projectId}
              value={(fieldValue as string) || ""}
              onChange={(v) => { handleSave("fixVersion", v || null); }}
            />
          ) : (
            <span className="text-xs text-text">{task.fixVersion || "None"}</span>
          )}
        </DetailRow>

        <DetailRow label="Sprint" field="sprint" active={editingField === "sprint"}>
          <span className="text-xs text-text">{task.sprintId || "None"}</span>
        </DetailRow>

        <DetailRow
          label="Story points"
          field="storyPoints"
          onEdit={canEdit ? () => startEdit("storyPoints", task.storyPoints?.toString() || "") : undefined}
          active={editingField === "storyPoints"}
        >
          {editingField === "storyPoints" ? (
            <input
              type="number"
              min="0"
              value={fieldValue as string | number}
              onChange={(e) => setFieldValue(e.target.value)}
              onBlur={() => handleSave("storyPoints", fieldValue ? parseInt(fieldValue as string, 10) : null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave("storyPoints", fieldValue ? parseInt(fieldValue as string, 10) : null);
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
          onEdit={canEdit ? () => startEdit("dueDate", task.dueDate?.split("T")[0] || "") : undefined}
          active={editingField === "dueDate"}
        >
          {editingField === "dueDate" ? (
            <input
              type="date"
              value={fieldValue as string}
              onChange={(e) => setFieldValue(e.target.value)}
              onBlur={() => handleSave("dueDate", (fieldValue as string) || null)}
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
          <DetailRow label="Parent" field="parent" active={editingField === "parent"}>
            <button
              onClick={() => router.push(`/task/${task.parentTask}`)}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {task.parentTask}
            </button>
          </DetailRow>
        )}

        {task.linkedTasks.length > 0 && (
          <DetailRow label="Linked issues" field="linked" active={editingField === "linked"}>
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

        {workspaceCustomFields.length > 0 && (
          <>
            {workspaceCustomFields.map((field) => {
              const raw = task.customFields?.[field._id];
              const display =
                raw === null || raw === undefined || raw === "" ? "None" : String(raw).replace(/,/g, ", ");
              return (
                <DetailRow key={field._id} label={field.name} field={field._id} active={editingField === field._id}>
                  <span className="text-xs text-text">{display}</span>
                </DetailRow>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}