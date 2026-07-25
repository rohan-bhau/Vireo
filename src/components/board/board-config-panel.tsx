"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { useGetProjectQuery, useUpdateColumnMutation, useAddColumnMutation, useRemoveColumnMutation, useReorderColumnsMutation } from "@/store/projectApi";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Board, Column } from "@/store/projectApi";

interface BoardConfigPanelProps {
  open: boolean;
  onClose: () => void;
  board: Board;
  projectId: string;
}

type ConfigTab = "columns" | "swimlanes" | "card-layout" | "quick-filters";

export function BoardConfigPanel({ open, onClose, board, projectId }: BoardConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>("columns");

  const tabs: { id: ConfigTab; label: string }[] = [
    { id: "columns", label: "Columns" },
    { id: "swimlanes", label: "Swimlanes" },
    { id: "card-layout", label: "Card layout" },
    { id: "quick-filters", label: "Quick filters" },
  ];

  return (
    <Dialog open={open} onClose={onClose} title="Board settings" className="max-w-2xl">
      <div className="flex gap-6">
        <div className="flex flex-col gap-1 w-36 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "text-left px-3 py-2 text-sm rounded-[3px] transition-colors",
                activeTab === tab.id
                  ? "bg-[#EEF4FF] text-[#2563EB] font-medium"
                  : "text-[#42526E] hover:bg-[#F4F5F7]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          {activeTab === "columns" && (
            <ColumnsTab board={board} />
          )}
          {activeTab === "swimlanes" && (
            <SwimlanesTab board={board} projectId={projectId} />
          )}
          {activeTab === "card-layout" && (
            <CardLayoutTab board={board} />
          )}
          {activeTab === "quick-filters" && (
            <QuickFiltersTab board={board} />
          )}
        </div>
      </div>
    </Dialog>
  );
}

function ColumnsTab({ board }: { board: Board }) {
  const [addColumn] = useAddColumnMutation();
  const [updateColumn] = useUpdateColumnMutation();
  const [removeColumn] = useRemoveColumnMutation();
  const [reorderColumns] = useReorderColumnsMutation();
  const [newColName, setNewColName] = useState("");
  const [editingWip, setEditingWip] = useState<string | null>(null);

  const sortedColumns = [...(board.columns || [])].sort((a, b) => a.position - b.position);

  async function handleAdd() {
    if (!newColName.trim()) return;
    await addColumn({ boardId: board.id, name: newColName.trim() });
    setNewColName("");
  }

  async function handleWipLimit(columnId: string, wipLimit: number | null) {
    await updateColumn({ boardId: board.id, columnId, wipLimit });
    setEditingWip(null);
  }

  async function handleMoveUp(col: Column, index: number) {
    if (index === 0) return;
    const cols = [...sortedColumns];
    const ids = cols.map((c) => c.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    await reorderColumns({ boardId: board.id, columnIds: ids });
  }

  async function handleMoveDown(col: Column, index: number) {
    if (index === sortedColumns.length - 1) return;
    const cols = [...sortedColumns];
    const ids = cols.map((c) => c.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    await reorderColumns({ boardId: board.id, columnIds: ids });
  }

  return (
    <div>
      <p className="text-xs text-[#737686] mb-4">
        Add, remove, and reorder columns. Set WIP limits for Kanban boards.
      </p>
      <div className="space-y-2">
        {sortedColumns.map((col, index) => (
          <div key={col.id} className="flex items-center gap-3 py-2 px-3 bg-[#F4F5F7] rounded-[3px]">
            <button onClick={() => handleMoveUp(col, index)} className="text-[#737686] hover:text-[#121C28] p-0.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
            <button onClick={() => handleMoveDown(col, index)} className="text-[#737686] hover:text-[#121C28] p-0.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <span className="flex-1 text-sm text-[#172B4D]">{col.name}</span>
            {editingWip === col.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  defaultValue={(col as any).wipLimit ?? ""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      handleWipLimit(col.id, val ? parseInt(val) : null);
                    }
                    if (e.key === "Escape") setEditingWip(null);
                  }}
                  className="w-16 rounded-[3px] border border-[#DFE1E6] px-2 py-1 text-xs text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="None"
                  autoFocus
                />
                <button onClick={() => setEditingWip(null)} className="text-[#737686] hover:text-[#121C28] p-0.5">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingWip(col.id)}
                className="text-xs text-[#737686] hover:text-[#2563EB] transition-colors"
              >
                {(col as any).wipLimit !== null && (col as any).wipLimit !== undefined
                  ? `WIP: ${(col as any).wipLimit}`
                  : "Set WIP"}
              </button>
            )}
            <button
              onClick={() => removeColumn({ boardId: board.id, columnId: col.id })}
              className="text-[#737686] hover:text-[#DC2626] p-0.5"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <input
          placeholder="New column name"
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          className="flex-1 rounded-[3px] border border-[#DFE1E6] px-3 py-1.5 text-sm text-[#172B4D] placeholder:text-[#737686] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
        />
        <Button size="sm" onClick={handleAdd}>Add</Button>
      </div>
    </div>
  );
}

function SwimlanesTab({ board, projectId }: { board: Board; projectId: string }) {
  return (
    <div>
      <p className="text-xs text-[#737686] mb-4">
        Swimlanes group issues into horizontal rows. Enable and configure swimlane types here.
      </p>
      <p className="text-sm text-[#42526E]">
        Coming soon. Swimlane support will be added in a future update.
      </p>
    </div>
  );
}

function CardLayoutTab({ board }: { board: Board }) {
  return (
    <div>
      <p className="text-xs text-[#737686] mb-4">
        Choose which fields appear on issue cards in this board.
      </p>
      <p className="text-sm text-[#42526E]">
        Coming soon. Card layout customization will be added in a future update.
      </p>
    </div>
  );
}

function QuickFiltersTab({ board }: { board: Board }) {
  return (
    <div>
      <p className="text-xs text-[#737686] mb-4">
        Create custom quick filters using JQL snippets. Filters appear in the board filter bar.
      </p>
      <p className="text-sm text-[#42526E]">
        Coming soon. Custom quick filter management will be added in a future update.
      </p>
    </div>
  );
}
