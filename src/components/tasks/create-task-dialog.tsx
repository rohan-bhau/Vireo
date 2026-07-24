"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  type TaskType,
  type TaskStatus,
  type TaskPriority,
  type Task,
} from "@/store/taskApi";
import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";
import { RichTextEditor } from "./rich-text-editor";
import { IssueTypeIcon } from "./issue-type-icon";
import { PriorityIcon } from "./priority-icon";
import { AssigneePicker } from "./assignee-picker";
import { LabelEditor } from "./label-editor";

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  projectId?: string;
  boardId?: string;
  columnId?: string;
  editTask?: Task | null;
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
}: CreateTaskDialogProps) {
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const { data: projects } = useGetWorkspaceProjectsQuery(workspaceId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("task");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || "");
  const [showMore, setShowMore] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const project = projects?.find((p) => p.id === selectedProjectId);
  const isScrum = project?.template === "SCRUM";

  useEffect(() => {
    if (open) {
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description || "");
        setType(editTask.type);
        setStatus(editTask.status);
        setPriority(editTask.priority);
        setAssignee(editTask.assignee);
        setLabels(editTask.labels || []);
        setDueDate(editTask.dueDate ? editTask.dueDate.split("T")[0] : "");
        setStoryPoints(editTask.storyPoints?.toString() || "");
        setSelectedProjectId(editTask.projectId);
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
        setSelectedProjectId(defaultProjectId || projects?.[0]?.id || "");
        setShowMore(false);
        setCreateAnother(false);
      }
    }
  }, [editTask, open, defaultProjectId, projects]);

  async function handleSubmit() {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description,
        type,
        status,
        priority,
        assignee: assignee || undefined,
        labels,
        dueDate: dueDate || undefined,
        storyPoints: storyPoints ? parseInt(storyPoints, 10) : undefined,
        projectId: selectedProjectId || undefined,
        boardId,
        columnId,
        workspaceId,
      };

      if (editTask) {
        await updateTask({ taskKey: editTask.taskKey, data: payload }).unwrap();
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
        {!editTask && projects && projects.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-[3px] border border-border-input bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Issue type</label>
          <div className="flex flex-wrap gap-1.5">
            {ISSUE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  type === t.value
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
              <AssigneePicker workspaceId={workspaceId} value={assignee} onChange={setAssignee} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Labels</label>
              <LabelEditor value={labels} onChange={setLabels} workspaceId={workspaceId} />
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
          </div>
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