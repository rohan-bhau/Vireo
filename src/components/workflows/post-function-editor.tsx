"use client";

import type { TransitionPostFunction } from "@/store/workflowApi";

interface PostFunctionEditorProps {
  postFunctions: TransitionPostFunction[];
  onChange: (postFunctions: TransitionPostFunction[]) => void;
}

const FIELD_OPTIONS = [
  { value: "priority", label: "Priority" },
  { value: "resolution", label: "Resolution" },
  { value: "labels", label: "Labels" },
  { value: "storyPoints", label: "Story Points" },
];

const RESOLUTION_OPTIONS = [
  { value: "Fixed", label: "Fixed" },
  { value: "Won't Fix", label: "Won&apos;t Fix" },
  { value: "Duplicate", label: "Duplicate" },
  { value: "Incomplete", label: "Incomplete" },
  { value: "Cannot Reproduce", label: "Cannot Reproduce" },
  { value: "Done", label: "Done" },
];

export function PostFunctionEditor({ postFunctions, onChange }: PostFunctionEditorProps) {
  function addPostFunction() {
    onChange([...postFunctions, { type: "update_field" }]);
  }

  function removePostFunction(index: number) {
    onChange(postFunctions.filter((_, i) => i !== index));
  }

  function updatePostFunction(index: number, updates: Partial<TransitionPostFunction>) {
    onChange(postFunctions.map((pf, i) => i === index ? { ...pf, ...updates } : pf));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-[#121C28]">Post Functions</h5>
        <button onClick={addPostFunction} className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]">+ Add function</button>
      </div>
      <p className="text-xs text-[#737686]">Actions that run automatically after transition</p>
      {postFunctions.map((pf, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-3">
          <div className="flex items-center gap-2">
            <select value={pf.type} onChange={(e) => updatePostFunction(i, { type: e.target.value as "update_field" | "add_comment" | "send_notification", field: e.target.value === "update_field" ? "resolution" : undefined, comment: e.target.value === "add_comment" ? "" : undefined })}
              className="rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]">
              <option value="update_field">Update field value</option>
              <option value="add_comment">Add comment</option>
              <option value="send_notification">Send notification</option>
            </select>
            <button onClick={() => removePostFunction(i)} className="ml-auto text-[#C3C6D7] hover:text-red-500">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          {pf.type === "update_field" && (
            <div className="flex items-center gap-2 pl-2">
              <select value={pf.field || "resolution"} onChange={(e) => updatePostFunction(i, { field: e.target.value })}
                className="rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]">
                {FIELD_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              {pf.field === "resolution" ? (
                <select value={pf.value || "Fixed"} onChange={(e) => updatePostFunction(i, { value: e.target.value })}
                  className="rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]">
                  {RESOLUTION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              ) : (
                <input value={pf.value || ""} onChange={(e) => updatePostFunction(i, { value: e.target.value })}
                  placeholder="Value" className="flex-1 rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]" />
              )}
            </div>
          )}
          {pf.type === "add_comment" && (
            <textarea value={pf.comment || ""} onChange={(e) => updatePostFunction(i, { comment: e.target.value })}
              placeholder="Comment to add..." rows={2}
              className="w-full rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655] resize-none" />
          )}
        </div>
      ))}
      {postFunctions.length === 0 && (
        <p className="text-xs text-[#C3C6D7] italic">No post functions — nothing happens automatically</p>
      )}
    </div>
  );
}
