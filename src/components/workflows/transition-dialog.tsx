"use client";

import { useState } from "react";
import type { WorkflowStatus, WorkflowTransition } from "@/store/workflowApi";
import { ConditionEditor } from "./condition-editor";
import { ValidatorEditor } from "./validator-editor";
import { PostFunctionEditor } from "./post-function-editor";

interface TransitionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (transition: WorkflowTransition) => void;
  statuses: WorkflowStatus[];
  editTransition?: WorkflowTransition | null;
  from?: string;
  to?: string;
}

export function TransitionDialog({ open, onClose, onSave, statuses, editTransition, from: presetFrom, to: presetTo }: TransitionDialogProps) {
  const [from, setFrom] = useState(presetFrom || editTransition?.from || "");
  const [to, setTo] = useState(presetTo || editTransition?.to || "");
  const [name, setName] = useState(editTransition?.name || (presetFrom && presetTo ? `${presetFrom} → ${presetTo}` : ""));
  const [conditions, setConditions] = useState<WorkflowTransition["conditions"]>(editTransition?.conditions || []);
  const [validators, setValidators] = useState<WorkflowTransition["validators"]>(editTransition?.validators || []);
  const [postFunctions, setPostFunctions] = useState<WorkflowTransition["postFunctions"]>(editTransition?.postFunctions || []);
  const [tab, setTab] = useState<"basic" | "conditions" | "validators" | "post-functions">("basic");
  const [initialized, setInitialized] = useState(false);

  if (open && !initialized) {
    setFrom(presetFrom || editTransition?.from || "");
    setTo(presetTo || editTransition?.to || "");
    setName(editTransition?.name || (presetFrom && presetTo ? `${presetFrom} → ${presetTo}` : ""));
    setConditions(editTransition?.conditions || []);
    setValidators(editTransition?.validators || []);
    setPostFunctions(editTransition?.postFunctions || []);
    setTab("basic");
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  if (!open) return null;

  function handleSave() {
    if (!from || !to || !name.trim()) return;
    onSave({ from, to, name: name.trim(), conditions, validators, postFunctions });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 cursor-pointer" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl cursor-pointer" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-semibold text-[#121C28]">
          {editTransition ? "Edit Transition" : "Add Transition"}
        </h3>

        <div className="mb-4 flex gap-1 rounded-lg bg-[#F1F2F6] p-1">
          {(["basic", "conditions", "validators", "post-functions"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === t ? "bg-white text-[#121C28] shadow-sm" : "text-[#737686] hover:text-[#121C28]"}`}>
              {t === "basic" ? "Basic" : t === "conditions" ? "Conditions" : t === "validators" ? "Validators" : "Post-functions"}
            </button>
          ))}
        </div>

        {tab === "basic" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-[#434655]">From</label>
                <select value={from} onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28]">
                  <option value="">Select status...</option>
                  {statuses.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <svg className="mt-5 h-4 w-4 shrink-0 text-[#737686]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-[#434655]">To</label>
                <select value={to} onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28]">
                  <option value="">Select status...</option>
                  {statuses.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#434655]">Transition name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Start Progress"
                className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            </div>
          </div>
        )}

        {tab === "conditions" && <ConditionEditor conditions={conditions} onChange={setConditions} />}
        {tab === "validators" && <ValidatorEditor validators={validators} onChange={setValidators} />}
        {tab === "post-functions" && <PostFunctionEditor postFunctions={postFunctions} onChange={setPostFunctions} />}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose}
            className="rounded-lg border border-[#C3C6D7] px-4 py-2 text-sm text-[#434655] hover:bg-[#F1F2F6] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors">
            {editTransition ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
