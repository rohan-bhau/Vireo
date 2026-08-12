"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { useUpdateBoardConfigMutation, useUpdateColumnMutation, useAddColumnMutation, useRemoveColumnMutation, useReorderColumnsMutation } from "@/store/projectApi";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Board, Column, BoardConfig } from "@/store/projectApi";

interface BoardConfigPanelProps {
  open: boolean;
  onClose: () => void;
  board: Board;
  projectId: string;
}

type ConfigTab = "columns" | "swimlanes" | "card-layout" | "quick-filters";

type SwimlaneType = "none" | "assignee" | "epic" | "priority" | "custom";

type ColumnWithWip = Column & { wipLimit?: number | null };

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
          {activeTab === "columns" && <ColumnsTab board={board} projectId={projectId} />}
          {activeTab === "swimlanes" && <SwimlanesTab board={board} />}
          {activeTab === "card-layout" && <CardLayoutTab board={board} />}
          {activeTab === "quick-filters" && <QuickFiltersTab board={board} />}
        </div>
      </div>
    </Dialog>
  );
}

function ColumnsTab({ board, projectId }: { board: Board; projectId: string }) {
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

  async function handleMoveUp(_col: Column, index: number) {
    if (index === 0) return;
    const cols = [...sortedColumns];
    const ids = cols.map((c) => c.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    await reorderColumns({ boardId: board.id, projectId: projectId, columnIds: ids });
  }

  async function handleMoveDown(_col: Column, index: number) {
    if (index === sortedColumns.length - 1) return;
    const cols = [...sortedColumns];
    const ids = cols.map((c) => c.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    await reorderColumns({ boardId: board.id, projectId: projectId, columnIds: ids });
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
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
            </button>
            <button onClick={() => handleMoveDown(col, index)} className="text-[#737686] hover:text-[#121C28] p-0.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <span className="flex-1 text-sm text-[#172B4D]">{col.name}</span>
            {editingWip === col.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="number" min={0}
                  defaultValue={(col as ColumnWithWip).wipLimit ?? ""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      handleWipLimit(col.id, val ? parseInt(val) : null);
                    }
                    if (e.key === "Escape") setEditingWip(null);
                  }}
                  className="w-16 rounded-[3px] border border-[#DFE1E6] px-2 py-1 text-xs text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="None" autoFocus
                />
                <button onClick={() => setEditingWip(null)} className="text-[#737686] hover:text-[#121C28] p-0.5">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingWip(col.id)} className="text-xs text-[#737686] hover:text-[#2563EB] transition-colors">
                {(col as ColumnWithWip).wipLimit != null ? `WIP: ${(col as ColumnWithWip).wipLimit}` : "Set WIP"}
              </button>
            )}
            <button onClick={() => removeColumn({ boardId: board.id, columnId: col.id })} className="text-[#737686] hover:text-[#DC2626] p-0.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
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

function SwimlanesTab({ board }: { board: Board }) {
  const [updateConfig] = useUpdateBoardConfigMutation();
  const config = board.config || {};
  const swimConfig = config.swimlanes || { enabled: false, type: "none" as const };

  const [enabled, setEnabled] = useState(swimConfig.enabled);
  const [swimType, setSwimType] = useState<SwimlaneType>(swimConfig.type);
  const [customJql, setCustomJql] = useState(swimConfig.customJql || "");

  async function handleSave() {
    await updateConfig({
      boardId: board.id,
      config: {
        swimlanes: { enabled, type: swimType, customJql: swimType === "custom" ? customJql : undefined },
      },
    });
  }

  return (
    <div>
      <p className="text-xs text-[#737686] mb-4">
        Swimlanes group issues into horizontal rows spanning all columns.
      </p>
      <label className="flex items-center gap-3 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-[#DFE1E6] text-[#2563EB] focus:ring-[#2563EB]"
        />
        <span className="text-sm text-[#172B4D] font-medium">Enable swimlanes</span>
      </label>
      {enabled && (
        <>
          <div className="mb-3">
            <label className="text-xs text-[#737686] block mb-1.5">Swimlane type</label>
            <select
              value={swimType}
              onChange={(e) => setSwimType(e.target.value as SwimlaneType)}
              className="w-full rounded-[3px] border border-[#DFE1E6] px-3 py-1.5 text-sm text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="assignee">By assignee</option>
              <option value="epic">By epic</option>
              <option value="priority">By priority</option>
              <option value="custom">Custom JQL</option>
            </select>
          </div>
          {swimType === "custom" && (
            <div className="mb-3">
              <label className="text-xs text-[#737686] block mb-1.5">JQL query</label>
              <input
                value={customJql}
                onChange={(e) => setCustomJql(e.target.value)}
                placeholder="e.g. component = frontend"
                className="w-full rounded-[3px] border border-[#DFE1E6] px-3 py-1.5 text-sm text-[#172B4D] placeholder:text-[#737686] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          )}
          <Button size="sm" onClick={handleSave}>Save swimlane settings</Button>
        </>
      )}
      {!enabled && (
        <p className="text-xs text-[#737686]">Swimlanes are disabled. Toggle the switch above to configure.</p>
      )}
    </div>
  );
}

const CARD_FIELDS: { key: keyof NonNullable<BoardConfig["cardLayout"]>; label: string }[] = [
  { key: "showTypeIcon", label: "Issue type icon" },
  { key: "showKey", label: "Issue key" },
  { key: "showPriority", label: "Priority" },
  { key: "showAssignee", label: "Assignee" },
  { key: "showLabels", label: "Labels" },
  { key: "showDueDate", label: "Due date" },
  { key: "showStoryPoints", label: "Story points" },
  { key: "showEpicColor", label: "Epic color strip" },
];

function CardLayoutTab({ board }: { board: Board }) {
  const [updateConfig] = useUpdateBoardConfigMutation();
  const config = board.config || {};
  const cardConfig = config.cardLayout || {
    showTypeIcon: true, showKey: true, showPriority: true,
    showAssignee: true, showLabels: true, showDueDate: true,
    showStoryPoints: true, showEpicColor: true,
  };

  const [layout, setLayout] = useState(cardConfig);

  function toggle(key: keyof typeof layout) {
    setLayout((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    await updateConfig({ boardId: board.id, config: { cardLayout: layout } });
  }

  return (
    <div>
      <p className="text-xs text-[#737686] mb-4">
        Toggle which fields appear on issue cards.
      </p>
      <div className="space-y-2">
        {CARD_FIELDS.map((field) => (
          <label key={field.key} className="flex items-center gap-3 cursor-pointer py-1.5">
            <input
              type="checkbox"
              checked={layout[field.key] ?? true}
              onChange={() => toggle(field.key)}
              className="h-4 w-4 rounded border-[#DFE1E6] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-sm text-[#172B4D]">{field.label}</span>
          </label>
        ))}
      </div>
      <Button size="sm" className="mt-4 cursor-pointer" onClick={handleSave}>Save card layout</Button>
    </div>
  );
}

function QuickFiltersTab({ board }: { board: Board }) {
  const [updateConfig] = useUpdateBoardConfigMutation();
  const config = board.config || {};
  const savedFilters = config.quickFilters || [];

  const [filters, setFilters] = useState(savedFilters);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editJql, setEditJql] = useState("");

  function startAdd() {
    setEditingIdx(filters.length);
    setEditName("");
    setEditJql("");
  }

  function startEdit(index: number) {
    setEditingIdx(index);
    setEditName(filters[index].name);
    setEditJql(filters[index].jql);
  }

  function handleSaveFilter() {
    if (!editName.trim() || !editJql.trim()) return;
    const updated = [...filters];
    if (editingIdx !== null && editingIdx < filters.length) {
      updated[editingIdx] = { id: filters[editingIdx].id, name: editName.trim(), jql: editJql.trim() };
    } else {
      updated.push({ id: `qf-${Date.now()}`, name: editName.trim(), jql: editJql.trim() });
    }
    setFilters(updated);
    setEditingIdx(null);
  }

  function handleRemove(index: number) {
    setFilters(filters.filter((_, i) => i !== index));
  }

  async function handleSaveAll() {
    await updateConfig({ boardId: board.id, config: { quickFilters: filters } });
  }

  return (
    <div>
      <p className="text-xs text-[#737686] mb-4">
        Create custom quick filters using JQL snippets.
      </p>
      <div className="space-y-2 mb-4">
        {filters.map((f, i) => (
          <div key={f.id} className="flex items-center gap-2 py-1.5 px-3 bg-[#F4F5F7] rounded-[3px]">
            <svg className="h-3.5 w-3.5 text-[#737686] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 22 15 16 15 16 21 2 21 2 3" /><line x1="6" y1="7" x2="18" y2="7" /><line x1="6" y1="11" x2="14" y2="11" />
            </svg>
            <span className="flex-1 text-sm text-[#172B4D]">{f.name}</span>
            <code className="text-[10px] text-[#737686] hidden sm:block truncate max-w-[120px]">{f.jql}</code>
            <button onClick={() => startEdit(i)} className="text-[#737686] hover:text-[#2563EB] p-0.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button onClick={() => handleRemove(i)} className="text-[#737686] hover:text-[#DC2626] p-0.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        {filters.length === 0 && (
          <p className="text-xs text-text-tertiary py-2">No custom quick filters yet. Add one below.</p>
        )}
      </div>

      {editingIdx !== null && (
        <div className="border border-border-light rounded-[3px] p-3 mb-4 space-y-2">
          <input
            placeholder="Filter name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded-[3px] border border-[#DFE1E6] px-3 py-1.5 text-sm text-[#172B4D] placeholder:text-[#737686] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
          <input
            placeholder="JQL query (e.g. priority = High)"
            value={editJql}
            onChange={(e) => setEditJql(e.target.value)}
            className="w-full rounded-[3px] border border-[#DFE1E6] px-3 py-1.5 text-sm text-[#172B4D] placeholder:text-[#737686] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveFilter}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setEditingIdx(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {editingIdx === null && (
          <Button size="sm" variant="outline" onClick={startAdd}>+ Add filter</Button>
        )}
        <Button size="sm" onClick={handleSaveAll} disabled={filters === savedFilters}>Save all</Button>
      </div>
    </div>
  );
}
