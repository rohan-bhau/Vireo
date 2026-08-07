"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetTaskByKeyQuery } from "@/store/taskApi";
import { IssueDetailMain } from "./issue-detail-main";
import { IssueDetailDetailsPanel } from "./issue-detail-details-panel";
import { SkeletonTaskDetail } from "@/components/ui/skeleton";

interface TaskDetailOverlayProps {
  taskKey: string;
  workspaceId: string;
  onClose: () => void;
}

export function TaskDetailOverlay({ taskKey, workspaceId, onClose }: TaskDetailOverlayProps) {
  const { data: task, isLoading } = useGetTaskByKeyQuery(taskKey);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10]/50 p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          className={expanded
            ? "relative flex h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-l-xl border border-[#C3C6D7]/40 bg-white shadow-2xl"
            : "relative flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#C3C6D7]/40 bg-white shadow-2xl"}
          initial={{ opacity: 0, y: 24, scale: expanded ? 1 : 0.98 }}
          animate={expanded ? { x: "25vw" } : { x: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
        >
          <header className="flex items-center justify-between border-b border-[#C3C6D7]/20 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-[#737686]">
              <span className="font-mono font-semibold text-[#121C28]">{taskKey}</span>
              {task && <span className="text-[#9CA3AF]">· {task.type}</span>}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded((v) => !v)}
                title={expanded ? "Collapse to modal" : "Expand to full panel"}
                className="flex h-7 w-7 items-center justify-center rounded text-[#737686] hover:bg-[#F4F5F7] transition-colors"
              >
                {expanded ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 3L3 21M21 7V3h-4M3 17v4h4" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M3 21L21 3M17 7v3M10 10H8v-2" />
                  </svg>
                )}
              </button>
              <button
                onClick={onClose}
                title="Close"
                className="flex h-7 w-7 items-center justify-center rounded text-[#737686] hover:bg-[#F4F5F7] transition-colors"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {isLoading || !task ? (
              <SkeletonTaskDetail />
            ) : (
              <div className="flex flex-col gap-6 p-5 lg:flex-row">
                <IssueDetailMain task={task} workspaceId={workspaceId || task.workspaceId} />
                <IssueDetailDetailsPanel task={task} workspaceId={workspaceId || task.workspaceId} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}