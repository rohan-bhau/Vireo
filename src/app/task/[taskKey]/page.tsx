"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetTaskByKeyQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  type TaskStatus,
  type TaskPriority,
  type TaskType,
} from "@/store/taskApi";
import { Button } from "@/components/ui/button";
import { SkeletonTaskDetail } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/tasks/rich-text-editor";
import { CommentThread } from "@/components/tasks/comment-thread";
import { ActivityLog } from "@/components/tasks/activity-log";
import { AttachmentList } from "@/components/tasks/attachment-list";
import { AISummarizer } from "@/components/ai/ai-summarizer";

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "todo", label: "Todo", color: "bg-[#E5E7EF] text-[#434655]" },
  { value: "in_progress", label: "In Progress", color: "bg-[#DBEAFE] text-[#2563EB]" },
  { value: "in_review", label: "In Review", color: "bg-[#FEF3C7] text-[#D97706]" },
  { value: "done", label: "Done", color: "bg-[#D1FAE5] text-[#059669]" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: "lowest", label: "Lowest", color: "bg-[#F1F2F6] text-[#737686]" },
  { value: "low", label: "Low", color: "bg-[#F1F2F6] text-[#737686]" },
  { value: "medium", label: "Medium", color: "bg-[#DBEAFE] text-[#2563EB]" },
  { value: "high", label: "High", color: "bg-[#FEF3C7] text-[#D97706]" },
  { value: "highest", label: "Highest", color: "bg-[#FEE2E2] text-[#DC2626]" },
];

const TYPE_ICONS: Record<TaskType, string> = {
  task: "☐",
  bug: "🐛",
  epic: "★",
  story: "📖",
  subtask: "↳",
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskKey = params.taskKey as string;

  const { data: task, isLoading, error } = useGetTaskByKeyQuery(taskKey);
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);

  const [deleting, setDeleting] = useState(false);

  if (isLoading) {
    return <SkeletonTaskDetail />;
  }

  if (error || !task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg font-semibold text-[#121C28]">Task not found</p>
        <p className="text-sm text-[#737686]">Task {taskKey} does not exist or you don't have access.</p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const statusStyle = STATUS_OPTIONS.find((s) => s.value === task!.status);
  const priorityStyle = PRIORITY_OPTIONS.find((p) => p.value === task!.priority);

  async function handleSaveDescription() {
    if (savingDesc) return;
    setSavingDesc(true);
    try {
      await updateTask({ taskKey, data: { description: descValue } }).unwrap();
      setEditingDesc(false);
    } catch {
    } finally {
      setSavingDesc(false);
    }
  }

  function startEditDescription() {
    setDescValue(task!.description || "");
    setEditingDesc(true);
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${task!.taskKey}?`)) return;
    setDeleting(true);
    try {
      await deleteTask(taskKey).unwrap();
      router.back();
    } catch {
      setDeleting(false);
    }
  }

  async function handleStatusChange(newStatus: TaskStatus) {
    try {
      await updateTask({ taskKey, data: { status: newStatus } }).unwrap();
    } catch {}
  }

  async function handlePriorityChange(newPriority: TaskPriority) {
    try {
      await updateTask({ taskKey, data: { priority: newPriority } }).unwrap();
    } catch {}
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-6 max-sm:px-4 max-sm:py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737686] hover:bg-[#F1F2F6] hover:text-[#121C28] transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-mono font-medium text-[#737686]">
          {task.taskKey}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-lg">{TYPE_ICONS[task.type]}</span>
              <h1 className="text-xl font-bold text-[#121C28] max-sm:text-lg">
                {task.title}
              </h1>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${statusStyle?.color}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${priorityStyle?.color}`}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-[#EEF4FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-[#121C28]">Description</h2>
              {!editingDesc && (
                <button
                  onClick={startEditDescription}
                  className="text-xs font-medium text-[#737686] hover:text-[#2563EB] transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            {editingDesc ? (
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  value={descValue}
                  onChange={setDescValue}
                  placeholder="Add a description..."
                  minRows={4}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveDescription} isLoading={savingDesc}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingDesc(false)}>Cancel</Button>
                </div>
              </div>
            ) : task.description ? (
              <div className="rounded-lg border border-[#C3C6D7]/20 bg-white px-4 py-3">
                <p className="text-sm text-[#434655] whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              </div>
            ) : (
              <button
                onClick={startEditDescription}
                className="w-full rounded-lg border border-dashed border-[#C3C6D7]/30 px-4 py-6 text-sm text-[#C3C6D7] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors text-center"
              >
                Add a description
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <AISummarizer taskKey={taskKey} />
            <button
              onClick={() => router.push(`/ai-assistant`)}
              className="flex items-center gap-1.5 rounded-lg border border-[#C3C6D7]/50 px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Ask AI
            </button>
          </div>

          <AttachmentList taskKey={taskKey} attachments={task.attachments} />

          <CommentThread taskKey={taskKey} />

          {task.linkedTasks.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-[#121C28]">Linked tasks</h3>
              <div className="flex flex-col gap-1">
                {task.linkedTasks.map((link) => (
                  <div
                    key={link.taskId + link.type}
                    className="flex items-center gap-2 rounded-lg border border-[#C3C6D7]/20 bg-white px-3 py-2"
                  >
                    <span className="text-[11px] font-medium uppercase text-[#737686]">
                      {link.type.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => router.push(`/task/${link.taskId}`)}
                      className="text-sm font-medium text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
                    >
                      {link.taskId}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-72 flex-shrink-0 max-lg:w-full">
          <div className="flex flex-col gap-4 rounded-xl border border-[#C3C6D7]/20 bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737686]">
              Details
            </h3>

            <DetailField label="Type" value={task.type} />
            <DetailField label="Status" value={task.status.replace("_", " ")} />
            <DetailField label="Priority" value={task.priority} />
            <DetailField label="Assignee" value={task.assignee || "Unassigned"} />
            <DetailField
              label="Reporter"
              value={task.reporter}
            />
            <DetailField
              label="Created"
              value={new Date(task.createdAt).toLocaleDateString()}
            />
            <DetailField
              label="Updated"
              value={new Date(task.updatedAt).toLocaleDateString()}
            />
            {task.dueDate && (
              <DetailField
                label="Due date"
                value={new Date(task.dueDate).toLocaleDateString()}
              />
            )}
            {task.storyPoints !== null && (
              <DetailField label="Story points" value={`${task.storyPoints} pts`} />
            )}
            {task.parentTask && (
              <DetailField
                label="Parent"
                value={
                  <button
                    onClick={() => router.push(`/task/${task.parentTask}`)}
                    className="text-sm text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
                  >
                    {task.parentTask}
                  </button>
                }
              />
            )}
          </div>

          <div className="mt-4">
            <ActivityLog taskKey={taskKey} />
          </div>

          <div className="mt-4">
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#737686]">{label}</span>
      <span className="text-sm font-medium text-[#121C28] capitalize">{value}</span>
    </div>
  );
}
