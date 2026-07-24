"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetTaskByKeyQuery,
  useDeleteTaskMutation,
} from "@/store/taskApi";
import { Button } from "@/components/ui/button";
import { SkeletonTaskDetail } from "@/components/ui/skeleton";
import { IssueDetailMain } from "@/components/tasks/issue-detail-main";
import { IssueDetailDetailsPanel } from "@/components/tasks/issue-detail-details-panel";
import { LinkIssueDialog } from "@/components/tasks/link-issue-dialog";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskKey = params.taskKey as string;

  const { data: task, isLoading, error } = useGetTaskByKeyQuery(taskKey);
  const [deleteTask] = useDeleteTaskMutation();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const workspaceId = useSelector((state: RootState) => state.workspace.activeWorkspaceId);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isLoading) {
    return <SkeletonTaskDetail />;
  }

  if (error || !task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg font-semibold text-text">Task not found</p>
        <p className="text-sm text-text-placeholder">Task {taskKey} does not exist or you don't have access.</p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm(`Are you sure you want to delete ${task.taskKey}?`)) return;
    setDeleting(true);
    try {
      await deleteTask(taskKey).unwrap();
      router.back();
    } catch {
      setDeleting(false);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-6 max-sm:px-4 max-sm:py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-[3px] text-text-placeholder hover:bg-bg-light hover:text-text transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <nav className="flex items-center gap-2 text-xs text-text-placeholder">
            <button
              onClick={() => router.push(`/w/${task.workspaceId}`)}
              className="hover:text-primary transition-colors"
            >
              {task.projectId}
            </button>
            <span>&gt;</span>
            <span className="font-mono font-medium text-text">{task.taskKey}</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-[3px] border border-border-light px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-light transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            Share
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-[3px] text-text-placeholder hover:bg-bg-light hover:text-text transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-[3px] border border-border-light bg-surface shadow-modal">
                  <button
                    onClick={() => { setShowMoreMenu(false); setShowLinkDialog(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-bg-light"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                    </svg>
                    Link issue
                  </button>
                  <button
                    onClick={() => { setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-bg-light"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" />
                    </svg>
                    Clone
                  </button>
                  <div className="border-t border-border-light" />
                  <button
                    onClick={() => { setShowMoreMenu(false); handleDelete(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-bg-light"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <IssueDetailMain task={task} workspaceId={workspaceId || task.workspaceId} />
        <IssueDetailDetailsPanel task={task} workspaceId={workspaceId || task.workspaceId} />
      </div>

      <LinkIssueDialog
        open={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        taskKey={taskKey}
        existingLinks={task.linkedTasks}
      />
    </div>
  );
}