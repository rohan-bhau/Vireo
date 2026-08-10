"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetSubtasksByParentQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "@/store/taskApi";
import { IssueTypeIcon } from "./issue-type-icon";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { useGetProjectQuery } from "@/store/projectApi";

interface SubtaskListProps {
  taskKey: string;
  workspaceId: string;
  projectId: string;
  boardId?: string | null;
  columnId?: string | null;
}

export function SubtaskList({ taskKey, workspaceId, projectId, boardId, columnId }: SubtaskListProps) {
  const router = useRouter();
  const { data: subtleSubtasks = [], refetch } = useGetSubtasksByParentQuery(taskKey);
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const { data: project } = useGetProjectQuery(projectId, { skip: !projectId });
  const subtasksEnabled =
    !project?.enabledIssueTypes?.length || project.enabledIssueTypes.includes("subtask");
  const [newSummary, setNewSummary] = useState("");
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const doneCount = subtleSubtasks.filter((t) => t.status === "done").length;

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
        boardId: boardId || undefined,
        columnId: columnId || undefined,
      }).unwrap();
      setNewSummary("");
      setAdding(false);
      refetch();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleDone(subtaskKey: string, currentStatus: string) {
    const next = currentStatus === "done" ? "todo" : "done";
    await updateTask({ taskKey: subtaskKey, data: { status: next }, workspaceId }).unwrap();
    refetch();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Subtasks</h3>
        <span className="text-xs text-text-placeholder">
          {doneCountLabel(doneCount, subtleSubtasks.length)}
        </span>
      </div>

      {subtleSubtasks.length > 0 && (
        <div className="flex flex-col gap-1">
          {subtleSubtasks.map((sk) => (
            <div
              key={sk.taskKey}
              className="flex items-center gap-2 rounded-[3px] px-2 py-1.5 hover:bg-bg-light transition-colors group"
            >
              <button
                onClick={() => handleToggleDone(sk.taskKey, sk.status)}
                title={sk.status === "done" ? "Mark as not done" : "Mark as done"}
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                  sk.status === "done"
                    ? "border-transparent bg-[#36B37E] text-white"
                    : "border-text-placeholder text-transparent hover:border-primary hover:text-primary/50"
                }`}
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>
              <IssueTypeIcon type="subtask" />
              <span className="text-xs text-text-secondary font-mono">{sk.taskKey}</span>
              <button
                onClick={() => router.push(`/task/${sk.taskKey}`)}
                className={`flex-1 text-sm text-text truncate text-left hover:text-primary transition-colors ${
                  sk.status === "done" ? "line-through text-text-placeholder" : ""
                }`}
              >
                {sk.title}
              </button>
              <StatusBadge status={sk.status} />
            </div>
          ))}
        </div>
      )}

            {subtasksEnabled && (
        <>
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
        </>
      )}
    </div>
  );

  function doneCountLabel(done: number, total: number) {
    return total > 0 ? `${done}/${total} subtasks complete` : "";
  }
}