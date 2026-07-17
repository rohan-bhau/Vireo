"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  type TaskType,
  type TaskStatus,
  type TaskPriority,
  type Task,
} from "@/store/taskApi";
import { RichTextEditor } from "./rich-text-editor";

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  projectId?: string;
  boardId?: string;
  columnId?: string;
  editTask?: Task | null;
}

const TYPES: { value: TaskType; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "epic", label: "Epic" },
  { value: "story", label: "Story" },
  { value: "subtask", label: "Sub-task" },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "lowest", label: "Lowest" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "highest", label: "Highest" },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

export function CreateTaskDialog({
  open,
  onClose,
  workspaceId,
  projectId,
  boardId,
  columnId,
  editTask,
}: CreateTaskDialogProps) {
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("task");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [labelsStr, setLabelsStr] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setType(editTask.type);
      setStatus(editTask.status);
      setPriority(editTask.priority);
      setAssignee(editTask.assignee || "");
      setLabelsStr((editTask.labels || []).join(", "));
      setDueDate(editTask.dueDate ? editTask.dueDate.split("T")[0] : "");
      setStoryPoints(editTask.storyPoints?.toString() || "");
    } else {
      setTitle("");
      setDescription("");
      setType("task");
      setStatus("todo");
      setPriority("medium");
      setAssignee("");
      setLabelsStr("");
      setDueDate("");
      setStoryPoints("");
    }
  }, [editTask, open]);

  async function handleSubmit() {
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      const labels = labelsStr
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      if (editTask) {
        await updateTask({
          taskKey: editTask.taskKey,
          data: {
            title: title.trim(),
            description,
            type,
            status,
            priority,
            assignee: assignee || null,
            labels,
            dueDate: dueDate || null,
            storyPoints: storyPoints ? parseInt(storyPoints, 10) : null,
          },
        }).unwrap();
      } else {
        await createTask({
          title: title.trim(),
          description,
          type,
          status,
          priority,
          assignee: assignee || undefined,
          projectId: projectId || undefined,
          boardId,
          columnId,
          labels,
          dueDate: dueDate || undefined,
          storyPoints: storyPoints ? parseInt(storyPoints, 10) : undefined,
          workspaceId,
        }).unwrap();
      }
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editTask ? `Edit ${editTask.taskKey}` : "Create task"}
      className="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
        />

        <div>
          <label className="text-xs font-semibold text-[#434655] mb-1.5 block">
            Description
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Describe the task..."
            minRows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Assignee ID</label>
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="User ID"
              className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Labels</label>
            <input
              value={labelsStr}
              onChange={(e) => setLabelsStr(e.target.value)}
              placeholder="bug, frontend, urgent"
              className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Story points</label>
            <input
              type="number"
              min="0"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              placeholder="e.g. 3"
              className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            isLoading={submitting}
          >
            {editTask ? "Save changes" : "Create task"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
