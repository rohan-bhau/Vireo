"use client";

import { useState } from "react";
import { useGetProjectEpicsQuery, useCreateEpicMutation, type Epic } from "@/store/epicApi";
import { clsx } from "clsx";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EpicSidebarProps {
  projectId: string;
  workspaceId: string;
}

const EPIC_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6",
];

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

export function EpicSidebar({ projectId, workspaceId }: EpicSidebarProps) {
  const { data: epics = [] } = useGetProjectEpicsQuery(projectId);
  const [createEpic] = useCreateEpicMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(EPIC_COLORS[0]);

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createEpic({
        name: newName.trim(),
        projectId,
        workspaceId,
        color: selectedColor,
      }).unwrap();
      setNewName("");
      setSelectedColor(EPIC_COLORS[0]);
      setShowCreate(false);
    } catch {}
  }

  return (
    <div className="w-56 flex-shrink-0 border-l border-[#C3C6D7]/20 bg-white p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Epics</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded p-1 text-[#737686] hover:bg-[#F1F2F6] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {showCreate && (
        <div className="mb-3 rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-2">
          <input
            autoFocus
            placeholder="Epic name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setShowCreate(false);
            }}
            className="mb-2 w-full rounded border border-[#C3C6D7] px-2 py-1 text-xs text-[#121C28] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
          <div className="mb-2 flex flex-wrap gap-1">
            {EPIC_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={clsx(
                  "h-4 w-4 rounded-full transition-transform",
                  selectedColor === color && "scale-125 ring-1 ring-offset-1 ring-[#121C28]"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button size="sm" onClick={handleCreate} className="flex-1 text-xs py-1 h-auto min-h-0">Add</Button>
            <Button size="sm" variant="outline" onClick={() => setShowCreate(false)} className="text-xs py-1 h-auto min-h-0">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {epics.map((epic) => (
          <EpicItem key={epic._id} epic={epic} />
        ))}
        {epics.length === 0 && !showCreate && (
          <p className="text-xs text-[#C3C6D7] text-center py-4">No epics yet</p>
        )}
      </div>
    </div>
  );
}

function EpicItem({ epic }: { epic: Epic }) {
  return (
    <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-[#F1F2F6] transition-colors cursor-pointer">
      <div
        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: epic.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="truncate text-[#434655] font-medium">{epic.name}</p>
        <p className="text-[10px] text-[#C3C6D7] font-mono">{epic.epicKey}</p>
      </div>
      <span className={clsx(
        "text-[10px] font-medium px-1.5 py-0.5 rounded",
        epic.status === "done" && "bg-green-100 text-green-700",
        epic.status === "in_progress" && "bg-blue-100 text-blue-700",
        epic.status === "open" && "bg-gray-100 text-gray-600",
        epic.status === "cancelled" && "bg-red-100 text-red-600",
      )}>
        {STATUS_LABELS[epic.status]}
      </span>
    </div>
  );
}
