"use client";

import { useState } from "react";
import { useCreateSavedFilterMutation } from "@/store/savedFilterApi";
import { clsx } from "clsx";

interface SaveFilterDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId?: string;
  jql: string;
  sortField?: string;
  sortOrder?: string;
  columns?: string[];
}

export function SaveFilterDialog({ open, onClose, workspaceId, jql, sortField, sortOrder, columns }: SaveFilterDialogProps) {
  const [name, setName] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [createFilter, { isLoading }] = useCreateSavedFilterMutation();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSave() {
    if (!name.trim()) {
      setError("Filter name is required");
      return;
    }
    if (!workspaceId) {
      setError("Workspace context required");
      return;
    }
    try {
      await createFilter({
        name: name.trim(),
        workspaceId,
        jql: jql || undefined,
        conditions: [],
        sortField: sortField || undefined,
        sortOrder: (sortOrder as "asc" | "desc") || undefined,
        columns: columns || undefined,
        isShared,
      }).unwrap();
      setName("");
      setIsShared(false);
      setError(null);
      onClose();
    } catch {
      setError("Failed to save filter");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-[3px] bg-white p-6 shadow-modal border border-[#DFE1E6]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-[#121C28] mb-4">Save current search as filter</h3>

        {error && (
          <div className="mb-3 rounded-[3px] bg-red-50 p-2.5 text-xs text-red-600">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-[#434655]">Name</label>
            <input
              autoFocus
              placeholder="e.g. My High Priority Issues"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onClose(); }}
              className="w-full rounded-[3px] border border-[#DFE1E6] px-2.5 py-1.5 text-xs text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {jql && (
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#434655]">JQL</label>
              <div className="rounded-[3px] bg-[#FAFBFC] border border-[#DFE1E6] px-2.5 py-1.5 text-[11px] font-mono text-[#434655] truncate">
                {jql}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[#DFE1E6] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-xs text-[#434655]">Share with workspace members</span>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-[3px] border border-[#DFE1E6] px-3 py-1.5 text-xs font-medium text-[#434655] hover:bg-[#F1F2F6] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={clsx(
              "rounded-[3px] px-3 py-1.5 text-xs font-medium text-white transition-colors",
              isLoading ? "bg-[#93B5F5] cursor-not-allowed" : "bg-[#2563EB] hover:bg-[#1D4ED8]"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
