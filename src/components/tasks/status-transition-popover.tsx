"use client";

import { useRef, useEffect, useState } from "react";
import type { Workflow, WorkflowTransition } from "@/store/workflowApi";
import { useValidateTransitionMutation } from "@/store/workflowApi";
import { useUpdateTaskMutation } from "@/store/taskApi";

interface StatusTransitionPopoverProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  transitions: WorkflowTransition[];
  workflow: Workflow | null;
  taskKey: string;
  onTransitionComplete?: () => void;
}

export function StatusTransitionPopover({
  open,
  onClose,
  anchorEl,
  transitions,
  workflow,
  taskKey,
  onTransitionComplete,
}: StatusTransitionPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [validateTransition] = useValidateTransitionMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [transitionStates, setTransitionStates] = useState<Record<string, { validating: boolean; valid: boolean; error?: string }>>({});

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) && anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, anchorEl, onClose]);

  useEffect(() => {
    if (open && workflow) {
      transitions.forEach(async (t) => {
        setTransitionStates((prev) => ({ ...prev, [t.name]: { validating: true, valid: false } }));
        try {
          const result = await validateTransition({ workflowId: workflow._id, transitionName: t.name, taskKey }).unwrap();
          setTransitionStates((prev) => ({ ...prev, [t.name]: { validating: false, valid: result.valid, error: result.errors?.[0] } }));
        } catch {
          setTransitionStates((prev) => ({ ...prev, [t.name]: { validating: false, valid: false, error: "Validation failed" } }));
        }
      });
    }
  }, [open, workflow, transitions, taskKey, validateTransition]);

  async function handleTransition(t: WorkflowTransition) {
    if (!workflow) return;
    setTransitionStates((prev) => ({ ...prev, [t.name]: { ...prev[t.name], validating: true } }));
    try {
      await updateTask({ taskKey, data: { status: t.to.toLowerCase().replace(/\s+/g, "_") as "todo" | "in_progress" | "in_review" | "done" } }).unwrap();
      onTransitionComplete?.();
      onClose();
    } catch (err) {
      console.error("Transition failed", err);
    }
  }

  if (!open || !anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <div
      ref={popoverRef}
      style={{ position: "fixed", left: rect.left, top: rect.bottom + 4, zIndex: 1000 }}
      className="w-56 rounded-xl border border-[#C3C6D7]/20 bg-white shadow-lg"
    >
      <div className="border-b border-[#C3C6D7]/20 px-3 py-2">
        <span className="text-xs font-semibold text-[#121C28]">Transitions</span>
      </div>
      <div className="p-1.5">
        {transitions.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-[#C3C6D7]">No available transitions</p>
        ) : (
          transitions.map((t) => {
            const state = transitionStates[t.name];
            const disabled = state && !state.valid;
            return (
              <button
                key={t.name}
                onClick={() => !disabled && handleTransition(t)}
                disabled={disabled || state?.validating}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[#F8F9FF] disabled:opacity-50 disabled:cursor-not-allowed"
                title={state?.error}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-[#434655] font-medium truncate">{t.name}</span>
                </div>
                <span className="shrink-0 rounded-md bg-[#F1F2F6] px-1.5 py-0.5 text-[10px] text-[#737686]">{t.to}</span>
                {state?.validating && (
                  <svg className="h-3 w-3 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {state && !state.valid && !state.validating && (
                  <svg className="h-3 w-3 shrink-0 text-[#F59E0B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                  </svg>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
