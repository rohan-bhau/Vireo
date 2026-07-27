"use client";

import { useState } from "react";
import { useGetProjectEpicsQuery, useCreateEpicMutation } from "@/store/epicApi";
import type { Task } from "@/store/taskApi";
import { EpicColorBar } from "./epic-color-bar";
import { clsx } from "clsx";
import { Plus, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EpicPanelProps {
  projectId: string;
  workspaceId: string;
  allTasks: Task[];
  selectedEpicKey: string | null;
  onEpicSelect: (epicKey: string | null) => void;
}

const EPIC_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6",
];

export function EpicPanel({ projectId, workspaceId, allTasks, selectedEpicKey, onEpicSelect }: EpicPanelProps) {
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

  function countEpicIssues(epicKey: string): number {
    return allTasks.filter((t) => t.parentTask === epicKey).length;
  }

  function epicProgress(epicKey: string): { done: number; total: number } {
    const epicTasks = allTasks.filter((t) => t.parentTask === epicKey);
    const total = epicTasks.length;
    const done = epicTasks.filter((t) => t.status === "done").length;
    return { done, total };
  }

  return (
    <div className="w-56 flex-shrink-0 border-l border-[#DFE1E6] bg-white flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#EBECF0]">
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-[#5E6C84]" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#5E6C84]">Epics</h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-[3px] p-1 text-[#5E6C84] hover:bg-[#F4F5F7] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showCreate && (
          <div className="border-b border-[#EBECF0] p-2 bg-[#F4F5F7]">
            <input
              autoFocus
              placeholder="Epic name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowCreate(false);
              }}
              className="w-full rounded-[3px] border border-[#DFE1E6] px-2 py-1 text-xs text-[#172B4D] placeholder:text-[#8993A4] focus:outline-none focus:ring-1 focus:ring-[#4C9AFF] mb-1.5"
            />
            <div className="flex flex-wrap gap-1 mb-1.5">
              {EPIC_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={clsx(
                    "h-4 w-4 rounded-full transition-transform",
                    selectedColor === color && "scale-125 ring-1 ring-offset-1 ring-[#172B4D]"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <Button size="sm" onClick={handleCreate} className="flex-1 text-xs py-1 h-auto min-h-0">Add</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)} className="text-xs py-1 h-auto min-h-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {selectedEpicKey && (
          <button
            onClick={() => onEpicSelect(null)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#0065FF] hover:bg-[#DEEBFF] transition-colors border-b border-[#EBECF0]"
          >
            <X className="h-3 w-3" />
            Clear filter
          </button>
        )}

        <div className="py-1">
          {epics.map((epic) => {
            const { done, total } = epicProgress(epic.epicKey);
            const issueCount = countEpicIssues(epic.epicKey);
            const isSelected = selectedEpicKey === epic.epicKey;

            return (
              <button
                key={epic._id}
                onClick={() => onEpicSelect(isSelected ? null : epic.epicKey)}
                className={clsx(
                  "w-full flex items-start gap-2 px-3 py-2 text-xs hover:bg-[#F4F5F7] transition-colors text-left",
                  isSelected && "bg-[#DEEBFF]"
                )}
              >
                <EpicColorBar color={epic.color} />
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    "truncate font-medium",
                    isSelected ? "text-[#0065FF]" : "text-[#172B4D]"
                  )}>
                    {epic.name}
                  </p>
                  <p className="text-[10px] text-[#5E6C84] font-mono mt-0.5">{epic.epicKey}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] text-[#5E6C84]">{issueCount} issues</span>
                  {total > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-10 h-1 rounded-full bg-[#EBECF0] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#00875A]"
                          style={{ width: `${(done / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-[#5E6C84]">{done}/{total}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {epics.length === 0 && !showCreate && (
            <p className="text-xs text-text-tertiary text-center py-8">No epics yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
