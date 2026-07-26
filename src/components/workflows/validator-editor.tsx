"use client";

import type { TransitionValidator } from "@/store/workflowApi";

interface ValidatorEditorProps {
  validators: TransitionValidator[];
  onChange: (validators: TransitionValidator[]) => void;
}

const COMMON_FIELDS = [
  { value: "description", label: "Description" },
  { value: "priority", label: "Priority" },
  { value: "assignee", label: "Assignee" },
  { value: "dueDate", label: "Due Date" },
  { value: "storyPoints", label: "Story Points" },
  { value: "labels", label: "Labels" },
];

export function ValidatorEditor({ validators, onChange }: ValidatorEditorProps) {
  function addValidator() {
    onChange([...validators, { field: "description", operator: "not_empty" }]);
  }

  function removeValidator(index: number) {
    onChange(validators.filter((_, i) => i !== index));
  }

  function updateValidator(index: number, updates: Partial<TransitionValidator>) {
    onChange(validators.map((v, i) => i === index ? { ...v, ...updates } : v));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-[#121C28]">Validators</h5>
        <button onClick={addValidator} className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]">+ Add validator</button>
      </div>
      <p className="text-xs text-[#737686]">Conditions that must be met before transition</p>
      {validators.map((v, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-3">
          <select value={v.field} onChange={(e) => updateValidator(i, { field: e.target.value })}
            className="rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]">
            {COMMON_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={v.operator} onChange={(e) => updateValidator(i, { operator: e.target.value as "not_empty" | "equals" | "not_equals" })}
            className="rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]">
            <option value="not_empty">Must not be empty</option>
            <option value="equals">Must equal</option>
            <option value="not_equals">Must not equal</option>
          </select>
          {(v.operator === "equals" || v.operator === "not_equals") && (
            <input value={v.value || ""} onChange={(e) => updateValidator(i, { value: e.target.value })}
              placeholder="Value" className="flex-1 rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]" />
          )}
          <button onClick={() => removeValidator(i)} className="text-[#C3C6D7] hover:text-red-500">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      {validators.length === 0 && (
        <p className="text-xs text-[#C3C6D7] italic">No validators — no preconditions required</p>
      )}
    </div>
  );
}
