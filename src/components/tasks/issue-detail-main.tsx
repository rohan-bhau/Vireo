"use client";

import { useState } from "react";
import type { Task } from "@/store/taskApi";
import { useUpdateTaskMutation } from "@/store/taskApi";
import { RichTextEditor } from "./rich-text-editor";
import { CommentThread } from "./comment-thread";
import { ActivityLog } from "./activity-log";
import { AttachmentList } from "./attachment-list";
import { SubtaskList } from "./subtask-list";
import { IssueTypeIcon } from "./issue-type-icon";
import { Button } from "@/components/ui/button";
import { AISummaryCard } from "@/components/ai/ai-summary-card";
import { AIDescriptionGenerator } from "@/components/ai/ai-description-generator";
import { useCanEdit } from "@/hooks/use-can-edit";

interface IssueDetailMainProps {
  task: Task;
  workspaceId: string;
}

type DetailTab = "comments" | "history" | "worklog";

export function IssueDetailMain({ task, workspaceId }: IssueDetailMainProps) {
  const canEdit = useCanEdit(workspaceId);
  const [updateTask] = useUpdateTaskMutation();
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryValue, setSummaryValue] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("");
  const [activeTab, setActiveTab] = useState<DetailTab>("comments");
  const [saving, setSaving] = useState(false);

  async function handleSaveSummary() {
    if (!summaryValue.trim() || saving) return;
    setSaving(true);
    try {
      await updateTask({ taskKey: task.taskKey, data: { title: summaryValue.trim() }, workspaceId }).unwrap();
      setEditingSummary(false);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDescription() {
    if (saving) return;
    setSaving(true);
    try {
      await updateTask({ taskKey: task.taskKey, data: { description: descValue }, workspaceId }).unwrap();
      setEditingDesc(false);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-6 rounded-xl border border-border-light bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-bg">
          <IssueTypeIcon type={task.type} size="lg" />
        </div>
        <div className="min-w-0 flex-1">
          {editingSummary ? (
            <div className="flex flex-col gap-2">
              <input
                value={summaryValue}
                onChange={(e) => setSummaryValue(e.target.value)}
                className="w-full rounded-[3px] border border-primary bg-surface px-3 py-2 text-lg font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleSaveSummary(); }
                  if (e.key === "Escape") { setEditingSummary(false); }
                }}
                onBlur={handleSaveSummary}
              />
            </div>
          ) : canEdit ? (
            <h1
              data-shortcut="edit-summary"
              className="-ml-2 rounded-md px-2 py-1 text-lg font-bold text-text transition-colors hover:bg-bg-light cursor-pointer sm:text-xl"
              onClick={() => { setSummaryValue(task.title); setEditingSummary(true); }}
            >
              {task.title}
            </h1>
          ) : (
            <h1 className="text-lg font-bold text-text sm:text-xl">
              {task.title}
            </h1>
          )}
        </div>
      </div>

      <div className="mb-4">
        <AISummaryCard taskKey={task.taskKey} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-placeholder">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Description
          </h2>
          {canEdit && (
            <div className="flex items-center gap-2">
              {!editingDesc && (
                <AIDescriptionGenerator
                  title={task.title}
                  taskType={task.type}
                  projectId={task.projectId}
                  onApply={(desc) => {
                    setDescValue(desc);
                    setEditingDesc(true);
                  }}
                />
              )}
              {!editingDesc && (
                <button
                  onClick={() => { setDescValue(task.description || ""); setEditingDesc(true); }}
                  className="text-xs font-medium text-text-placeholder hover:text-primary transition-colors"
                >
                  {task.description ? "Edit" : "Add"}
                </button>
              )}
            </div>
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
              <Button size="sm" onClick={handleSaveDescription} isLoading={saving}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingDesc(false)}>Cancel</Button>
            </div>
          </div>
        ) : task.description ? (
          <div className="rounded-lg border border-border-light bg-bg-light/50 px-4 py-3">
            <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>
        ) : canEdit ? (
          <button
            onClick={() => setEditingDesc(true)}
            className="w-full rounded-lg border border-dashed border-border-input px-4 py-6 text-sm text-text-placeholder hover:border-primary hover:text-primary transition-colors text-center"
          >
            Add a description...
          </button>
        ) : (
          <p className="rounded-lg border border-dashed border-border-input px-4 py-6 text-sm text-text-placeholder text-center">
            No description
          </p>
        )}
      </div>

      <AttachmentList taskKey={task.taskKey} attachments={task.attachments} canEdit={canEdit} />

      <SubtaskList
        taskKey={task.taskKey}
        workspaceId={workspaceId}
        projectId={task.projectId}
        boardId={task.boardId}
        columnId={task.columnId}
        canEdit={canEdit}
      />

      <div>
        <div className="inline-flex rounded-lg border border-border-light bg-bg-light/50 p-0.5">
          {(["comments", "history", "worklog"] as DetailTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "bg-surface text-primary shadow-sm"
                  : "text-text-placeholder hover:text-text-secondary"
              }`}
            >
              {tab === "worklog" ? "Work log" : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "comments" && <CommentThread taskKey={task.taskKey} workspaceId={workspaceId} />}
      {activeTab === "history" && <ActivityLog taskKey={task.taskKey} workspaceId={workspaceId} />}
      {activeTab === "worklog" && (
        <div className="rounded-[3px] border border-dashed border-border-input px-4 py-8 text-center">
          <p className="text-sm text-text-placeholder">Work log tracking coming soon</p>
        </div>
      )}
    </div>
  );
}