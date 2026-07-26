"use client";

import type { TransitionCondition } from "@/store/workflowApi";

interface ConditionEditorProps {
  conditions: TransitionCondition[];
  onChange: (conditions: TransitionCondition[]) => void;
}

export function ConditionEditor({ conditions, onChange }: ConditionEditorProps) {
  function addCondition() {
    onChange([...conditions, { type: "assignee" }]);
  }

  function removeCondition(index: number) {
    onChange(conditions.filter((_, i) => i !== index));
  }

  function updateCondition(index: number, updates: Partial<TransitionCondition>) {
    onChange(conditions.map((c, i) => i === index ? { ...c, ...updates } : c));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-[#121C28]">Conditions</h5>
        <button onClick={addCondition} className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]">+ Add condition</button>
      </div>
      <p className="text-xs text-[#737686]">Restrict who can perform this transition</p>
      {conditions.map((cond, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-3">
          <select value={cond.type} onChange={(e) => updateCondition(i, { type: e.target.value as "assignee" | "reporter" | "role" | "project_admin", role: e.target.value === "role" ? cond.role || "admin" : undefined })}
            className="rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]">
            <option value="assignee">Only assignee</option>
            <option value="reporter">Only reporter</option>
            <option value="role">Only role</option>
            <option value="project_admin">Only project admin</option>
          </select>
          {cond.type === "role" && (
            <select value={cond.role || "admin"} onChange={(e) => updateCondition(i, { role: e.target.value })}
              className="rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]">
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          )}
          <button onClick={() => removeCondition(i)} className="ml-auto text-[#C3C6D7] hover:text-red-500">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      {conditions.length === 0 && (
        <p className="text-xs text-[#C3C6D7] italic">No conditions — anyone can perform this transition</p>
      )}
    </div>
  );
}
