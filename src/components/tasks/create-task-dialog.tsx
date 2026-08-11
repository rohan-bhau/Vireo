"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetWorkspacesQuery } from "@/store/workspaceApi";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetWorkspaceTasksQuery,
  type TaskType,
  type TaskStatus,
  type TaskPriority,
  type Task,
} from "@/store/taskApi";
import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";
import { useGetProjectEpicsQuery } from "@/store/epicApi";
import { useGetWorkspaceCustomFieldsQuery, type CustomField as WorkspaceCustomField } from "@/store/customFieldApi";
import { RichTextEditor } from "./rich-text-editor";
import { IssueTypeIcon } from "./issue-type-icon";
import { PriorityIcon } from "./priority-icon";
import { AssigneePicker } from "./assignee-picker";
import { LabelEditor } from "./label-editor";
import { MultiComponentSelector } from "./component-selector";
import { VersionSelector } from "./version-selector";

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId?: string;
  projectId?: string;
  boardId?: string;
  columnId?: string;
  editTask?: Task | null;
  prefill?: TaskPrefill | null;
}

export interface TaskPrefill {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  labels?: string[];
}

const ISSUE_TYPES: { value: TaskType; label: string }[] = [
  { value: "epic", label: "Epic" },
  { value: "story", label: "Story" },
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "subtask", label: "Sub-task" },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "highest", label: "Highest" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "lowest", label: "Lowest" },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

export function CreateTaskDialog({
  open,
  onClose,
  workspaceId,
  projectId: defaultProjectId,
  boardId,
  columnId,
  editTask,
  prefill,
}: CreateTaskDialogProps) {
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const { data: workspaces = [] } = useGetWorkspacesQuery(undefined, { skip: !open });
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaceId || "");
  const effectiveWorkspaceId =
    selectedWorkspaceId || workspaceId || workspaces[0]?.id || "";
  const { data: projects } = useGetWorkspaceProjectsQuery(effectiveWorkspaceId, {
    skip: !effectiveWorkspaceId,
  });
  const { data: workspaceCustomFields = [] } = useGetWorkspaceCustomFieldsQuery(effectiveWorkspaceId, {
    skip: !effectiveWorkspaceId,
  });
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const ownedWorkspaces = workspaces.filter((ws) => ws.ownerId === currentUser?.id);
  const alwaysIncludeCurrent =
    workspaceId && !ownedWorkspaces.some((ws) => ws.id === workspaceId)
      ? workspaces.filter((ws) => ws.id === workspaceId)
      : [];
  const availableWorkspaces =
    ownedWorkspaces.length > 0 ? [...ownedWorkspaces, ...alwaysIncludeCurrent] : workspaces;
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || "");
  const { data: epics = [] } = useGetProjectEpicsQuery(selectedProjectId, { skip: !selectedProjectId });
  const { data: allTasks = [] } = useGetWorkspaceTasksQuery(effectiveWorkspaceId, { skip: !effectiveWorkspaceId });

  const resolveDefaultProject = useCallback(() => {
    if (defaultProjectId) return defaultProjectId;
    const firstWithBoard = projects?.find((p) => p.boards?.length > 0);
    if (firstWithBoard) return firstWithBoard.id;
    return projects?.[0]?.id || "";
  }, [defaultProjectId, projects]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("task");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState<string | null>(null);
  const [reporter, setReporter] = useState<string | null>(currentUser?.id || null);
  const [parentTask, setParentTask] = useState<string>("");
  const [labels, setLabels] = useState<string[]>([]);
  const [components, setComponents] = useState<string[]>([]);
  const [fixVersion, setFixVersion] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [customError, setCustomError] = useState<string | null>(null);

  const project = projects?.find((p) => p.id === selectedProjectId);
  const isScrum = project?.template === "SCRUM";

  const availableIssueTypes = useMemo(() => {
    const enabled = project?.enabledIssueTypes;
    if (!enabled || enabled.length === 0) return ISSUE_TYPES;
    return ISSUE_TYPES.filter((t) => enabled.includes(t.value));
  }, [project]);

  const effectiveType =
    availableIssueTypes.some((t) => t.value === type) && !editTask
      ? type
      : availableIssueTypes[0]?.value || type;

  const resetFields = useCallback(() => {
    const startingWorkspaceId = workspaceId || workspaces[0]?.id || "";
    setSelectedWorkspaceId(startingWorkspaceId);
    setTitle("");
    setDescription("");
    setType("task");
    setStatus("todo");
    setPriority("medium");
    setAssignee(null);
    setReporter(currentUser?.id || null);
    setParentTask("");
    setLabels([]);
    setComponents([]);
    setFixVersion("");
    setDueDate("");
    setStoryPoints("");
    setShowMore(false);
    setCreateAnother(false);
    setCustomValues({});
    setCustomError(null);
  }, [workspaceId, workspaces, currentUser]);

  useEffect(() => {
    if (open) {
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description || "");
        setType(editTask.type);
        setStatus(editTask.status);
        setPriority(editTask.priority);
        setAssignee(editTask.assignee);
        setReporter(editTask.reporter || currentUser?.id || null);
        setParentTask(editTask.parentTask || "");
        setLabels(editTask.labels || []);
        setComponents(editTask.components || []);
        setFixVersion(editTask.fixVersion || "");
        setDueDate(editTask.dueDate ? editTask.dueDate.split("T")[0] : "");
        setStoryPoints(editTask.storyPoints?.toString() || "");
        setSelectedProjectId(editTask.projectId);
        setCustomValues(
          Object.fromEntries(
            Object.entries((editTask.customFields as Record<string, string | number | null>) || {}).map(([k, v]) => [k, v === null || v === undefined ? "" : String(v)])
          )
        );
        setCustomError(null);
      } else {
        resetFields();
        setSelectedProjectId(resolveDefaultProject());
        if (prefill) {
          if (prefill.title) setTitle(prefill.title);
          if (prefill.description !== undefined) setDescription(prefill.description);
          if (prefill.type) setType(prefill.type);
          if (prefill.priority) setPriority(prefill.priority);
          if (prefill.labels && prefill.labels.length > 0) setLabels(prefill.labels);
        }
      }
    }
  }, [editTask, open, resetFields, resolveDefaultProject, prefill]);

  async function handleSubmit() {
    if (!title.trim() || submitting) return;
    if (workspaceCustomFields.length > 0) {
      const missing = workspaceCustomFields.find((f) => {
        if (!f.required) return false;
        const v = (customValues[f._id] || "").trim();
        return v === "";
      });
      if (missing) {
        setCustomError(`"${missing.name}" is required`);
        return;
      }
    }
    setCustomError(null);
    setSubmitting(true);
    try {
      const effectiveProjectId = selectedProjectId || resolveDefaultProject();
      const selectedProject = projects?.find((p) => p.id === effectiveProjectId);
      const effectiveBoard = selectedProject?.boards?.[0];
      const effectiveColumn = effectiveBoard?.columns?.[0];
      const payload = {
        title: title.trim(),
        description,
        type: effectiveType,
        status,
        priority,
        assignee: assignee || undefined,
        reporter: reporter || currentUser?.id || undefined,
        parentTask: parentTask || undefined,
        labels,
        components: components.length > 0 ? components : undefined,
        fixVersion: fixVersion || undefined,
        dueDate: dueDate || undefined,
        storyPoints: storyPoints ? parseInt(storyPoints, 10) : undefined,
        projectId: effectiveProjectId || undefined,
        boardId: boardId || effectiveBoard?.id,
        columnId: columnId || effectiveColumn?.id,
        workspaceId: effectiveWorkspaceId,
        customFields:
          workspaceCustomFields.length > 0
            ? Object.fromEntries(
                Object.entries(customValues).map(([k, v]) => [k, v.trim() === "" ? null : v])
              )
            : undefined,
      };

      if (editTask) {
        await updateTask({
          taskKey: editTask.taskKey,
          data: payload,
          workspaceId: effectiveWorkspaceId,
        }).unwrap();
        onClose();
      } else {
        await createTask(payload).unwrap();
        if (!createAnother) {
          onClose();
        } else {
          setTitle("");
          setDescription("");
          setType("task");
          setStatus("todo");
          setPriority("medium");
          setAssignee(null);
          setLabels([]);
          setDueDate("");
          setStoryPoints("");
          setShowMore(false);
          setCreateAnother(true);
        }
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editTask ? `Edit ${editTask.taskKey}` : "Create issue"}
      className="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        {!editTask && availableWorkspaces.length > 0 && (
          <div className="flex items-center gap-3 rounded-[3px] border border-border-light bg-bg-light px-3 py-2.5">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-bg text-[10px] font-bold text-primary">
              {availableWorkspaces.find((ws) => ws.id === effectiveWorkspaceId)?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={availableWorkspaces.find((ws) => ws.id === effectiveWorkspaceId)?.avatar || ""}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                (availableWorkspaces.find((ws) => ws.id === effectiveWorkspaceId)?.name ||
                  "").charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Workspace
              </p>
              <p className="truncate text-sm font-medium text-text">
                {availableWorkspaces.find((ws) => ws.id === effectiveWorkspaceId)?.name || "Workspace"}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Issue type</label>
          <div className="flex flex-wrap gap-1.5">
            {availableIssueTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  effectiveType === t.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border-input text-text-secondary hover:border-border-default hover:bg-bg-light"
                }`}
              >
                <IssueTypeIcon type={t.value} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">
            Summary <span className="text-danger">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="rounded-[3px] border border-border-input bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Description</label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Add a description..."
            minRows={3}
          />
        </div>

        {!editTask && (
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark transition-colors self-start"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
            {showMore ? "Fewer fields" : "More fields"}
          </button>
        )}

        {(showMore || editTask) && (
          <>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="rounded-[3px] border border-border-input bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="rounded-[3px] border border-border-input bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Assignee</label>
              <AssigneePicker workspaceId={effectiveWorkspaceId} value={assignee} onChange={setAssignee} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Reporter</label>
              <AssigneePicker workspaceId={effectiveWorkspaceId} value={reporter} onChange={setReporter} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Labels</label>
              <LabelEditor value={labels} onChange={setLabels} workspaceId={effectiveWorkspaceId} projectId={selectedProjectId} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Components</label>
              <MultiComponentSelector value={components} onChange={setComponents} projectId={selectedProjectId} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Fix Version</label>
              <VersionSelector value={fixVersion} onChange={setFixVersion} projectId={selectedProjectId} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-[3px] border border-border-input bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {isScrum && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Story points</label>
                <input
                  type="number"
                  min="0"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="e.g. 3"
                  className="rounded-[3px] border border-border-input bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-semibold text-text-secondary">Parent</label>
              <select
                value={parentTask}
                onChange={(e) => setParentTask(e.target.value)}
                className="rounded-[3px] border border-border-input bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">None</option>
                {epics.map((epic) => (
                  <option key={epic._id || epic.epicKey} value={epic.epicKey}>
                    {epic.epicKey}: {epic.name}
                  </option>
                ))}
                {allTasks
                  .filter((t) => t.projectId === selectedProjectId && t.type !== "subtask" && t.taskKey !== parentTask)
                  .map((t) => (
                    <option key={t.taskKey} value={t.taskKey}>
                      {t.taskKey}: {t.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {workspaceCustomFields.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Custom fields
              </p>
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                {workspaceCustomFields.map((field) => (
                  <CustomFieldEditor
                    key={field._id}
                    field={field}
                    value={customValues[field._id] || ""}
                    onChange={(v) => {
                      setCustomValues((prev) => ({ ...prev, [field._id]: v }));
                      setCustomError(null);
                    }}
                  />
                ))}
              </div>
              {customError && (
                <p className="text-xs font-medium text-danger">{customError}</p>
              )}
            </div>
          )}
          </>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border-light">
          {!editTask && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createAnother}
                onChange={(e) => setCreateAnother(e.target.checked)}
                className="h-4 w-4 rounded border-border-input text-primary focus:ring-primary"
              />
              <span className="text-xs text-text-secondary">Create another</span>
            </label>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || submitting}
              isLoading={submitting}
            >
              {editTask ? "Save changes" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function CustomFieldEditor({
  field,
  value,
  onChange,
}: {
  field: WorkspaceCustomField;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputClass =
    "rounded-[3px] border border-border-input bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary";

  const selected = value.split(",").filter(Boolean);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-text-secondary">
        {field.name}
        {field.required && <span className="ml-1 text-danger">*</span>}
      </label>
      {field.type === "TEXT" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.name}
          className={inputClass}
        />
      )}
      {field.type === "TEXTAREA" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={field.name}
          className={inputClass}
        />
      )}
      {field.type === "NUMBER" && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={inputClass}
        />
      )}
      {field.type === "DATE" && (
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
      {field.type === "SELECT" && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          <option value="">—</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {field.type === "MULTISELECT" && (
        <div className="flex flex-wrap gap-1.5">
          {field.options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const next = active
                    ? selected.filter((s) => s !== opt)
                    : [...selected, opt];
                  onChange(next.join(","));
                }}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border-input text-text-secondary hover:border-border-default hover:bg-bg-light"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}