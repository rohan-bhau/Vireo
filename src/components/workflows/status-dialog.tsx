"use client";

import { useState } from "react";
import type { WorkflowStatus } from "@/store/workflowApi";

const STATUS_COLORS = [
  "#6B7280", "#2563EB", "#F59E0B", "#10B981",
  "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6",
  "#F97316", "#6366F1",
];

interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (status: WorkflowStatus) => void;
  editStatus?: WorkflowStatus | null;
}

export function StatusDialog({ open, onClose, onSave, editStatus }: StatusDialogProps) {
  const [name, setName] = useState(editStatus?.name || "");
  const [color, setColor] = useState(editStatus?.color || "#6B7280");
  const [category, setCategory] = useState<"todo" | "in_progress" | "done">(editStatus?.category || "todo");
  const [description, setDescription] = useState(editStatus?.description || "");
  const [initialized, setInitialized] = useState(false);

  if (open && !initialized) {
    setName(editStatus?.name || "");
    setColor(editStatus?.color || "#6B7280");
    setCategory(editStatus?.category || "todo");
    setDescription(editStatus?.description || "");
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 cursor-pointer" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl cursor-pointer" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-semibold text-[#121C28]">
          {editStatus ? "Edit Status" : "Add Status"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#434655]">Name</label>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g., In QA"
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#434655]">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as "todo" | "in_progress" | "done")}
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <p className="mt-1 text-xs text-[#737686]">
              Category determines board column mapping: To Do columns on the left, In Progress in the middle, Done on the right
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#434655]">Color</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${color === c ? "border-[#121C28] scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-full border border-[#C3C6D7]" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#434655]">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this status mean?"
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none" rows={2} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose}
            className="rounded-lg border border-[#C3C6D7] px-4 py-2 text-sm text-[#434655] hover:bg-[#F1F2F6] transition-colors">
            Cancel
          </button>
          <button onClick={() => { if (name.trim()) { onSave({ name: name.trim(), color, category, position: editStatus?.position ?? 0, description: description.trim() || undefined }); onClose(); } }}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors">
            {editStatus ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
