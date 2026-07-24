"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetTaskByKeyQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  type Task,
} from "@/store/taskApi";
import { IssueTypeIcon } from "./issue-type-icon";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";

interface SubtaskListProps {
  taskKey: string;
  workspaceId: string;
  projectId: string;
  parentTask: string | null;
  subtaskKeys: string[];
}

export function SubtaskList({ taskKey, workspaceId, projectId, parentTask, subtaskKeys }: SubtaskListProps) {
  const router = useRouter();
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [newSummary, setNewSummary] = useState("");
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const doneCount = subtaskKeys.filter((k) => k).length;

  async function handleAdd() {
    if (!newSummary.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createTask({
        title: newSummary.trim(),
        type: "subtask",
        status: "todo",
        workspaceId,
        projectId,
        parentTask: taskKey,
      }).unwrap();
      setNewSummary("");
      setAdding(false);
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Subtasks</h3>
        <span className="text-xs text-text-placeholder">{doneCount} subtasks</span>
      </div>

      {subtaskKeys.length > 0 && (
        <div className="flex flex-col gap-1">
          {subtaskKeys.map((sk) => (
            <SubtaskItem key={sk} taskKey={sk} />
          ))}
        </div>
      )}

      {adding ? (
        <div className="flex gap-2">
          <input
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-xs text-text placeholder:text-text-placeholder focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            autoFocus
          />
          <Button size="sm" onClick={handleAdd} isLoading={submitting} disabled={!newSummary.trim()}>
            Add
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 rounded-[3px] px-2 py-1.5 text-xs text-text-placeholder hover:bg-bg-light hover:text-text-secondary transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add subtask
        </button>
      )}
    </div>
  );
}

function SubtaskItem({ taskKey }: { taskKey: string }) {
  const router = useRouter();
  const { data: task } = useGetTaskByKeyQuery(taskKey);
  const [updateTask] = useUpdateTaskMutation();

  if (!task) return null;

  return (
    <div className="flex items-center gap-2 rounded-[3px] px-2 py-1.5 hover:bg-bg-light transition-colors group cursor-pointer"
      onClick={() => router.push(`/task/${taskKey}`)}
    >
      <IssueTypeIcon type="subtask" />
      <span className="text-xs text-text-secondary font-mono">{task.taskKey}</span>
      <span className="flex-1 text-sm text-text truncate">{task.title}</span>
      <StatusBadge status={task.status} />
    </div>
  );
}