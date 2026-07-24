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

interface IssueDetailMainProps {
  task: Task;
  workspaceId: string;
}

type DetailTab = "comments" | "history" | "worklog";

export function IssueDetailMain({ task, workspaceId }: IssueDetailMainProps) {
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
      await updateTask({ taskKey: task.taskKey, data: { title: summaryValue.trim() } }).unwrap();
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
      await updateTask({ taskKey: task.taskKey, data: { description: descValue } }).unwrap();
      setEditingDesc(false);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-start gap-3">
        <IssueTypeIcon type={task.type} size="lg" />
        <div className="flex-1">
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
          ) : (
            <h1
              className="text-lg font-bold text-text cursor-pointer hover:bg-bg-light rounded-[3px] -ml-2 px-2 py-1 transition-colors"
              onClick={() => { setSummaryValue(task.title); setEditingSummary(true); }}
            >
              {task.title}
            </h1>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-placeholder">Description</h2>
          {!editingDesc && (
            <button
              onClick={() => { setDescValue(task.description || ""); setEditingDesc(true); }}
              className="text-xs font-medium text-text-placeholder hover:text-primary transition-colors"
            >
              {task.description ? "Edit" : "Add"}
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
              <Button size="sm" onClick={handleSaveDescription} isLoading={saving}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingDesc(false)}>Cancel</Button>
            </div>
          </div>
        ) : task.description ? (
          <div className="rounded-[3px] border border-border-light bg-surface px-4 py-3">
            <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setEditingDesc(true)}
            className="w-full rounded-[3px] border border-dashed border-border-input px-4 py-6 text-sm text-text-placeholder hover:border-primary hover:text-primary transition-colors text-center"
          >
            Add a description...
          </button>
        )}
      </div>

      <AttachmentList taskKey={task.taskKey} attachments={task.attachments} />

      <SubtaskList
        taskKey={task.taskKey}
        workspaceId={workspaceId}
        projectId={task.projectId}
        parentTask={task.parentTask}
        subtaskKeys={[]}
      />

      <div className="border-b border-border-light">
        <div className="flex gap-0">
          {(["comments", "history", "worklog"] as DetailTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-text-placeholder hover:text-text-secondary hover:border-border-light"
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