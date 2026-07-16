"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";

interface Column {
  id: string;
  name: string;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", name: "Todo" },
  { id: "in-progress", name: "In Progress" },
  { id: "in-review", name: "In Review" },
  { id: "done", name: "Done" },
];

const STORAGE_KEY_PREFIX = "vireo_board_columns_";

function loadColumns(workspaceId: string): Column[] {
  if (typeof window === "undefined") return DEFAULT_COLUMNS.map((c) => ({ ...c }));
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${workspaceId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_COLUMNS.map((c) => ({ ...c }));
}

function saveColumns(workspaceId: string, columns: Column[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${workspaceId}`, JSON.stringify(columns));
  } catch {}
}

interface BoardTabProps {
  workspaceId: string;
}

export function BoardTab({ workspaceId }: BoardTabProps) {
  const [columns, setColumns] = useState<Column[]>(() => loadColumns(workspaceId));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    saveColumns(workspaceId, columns);
  }, [columns, workspaceId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const sortedColumns = columns;

  const filteredColumns = searchQuery
    ? sortedColumns.filter((col) =>
        col.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedColumns;

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = sortedColumns.findIndex((c) => c.id === active.id);
    const newIndex = sortedColumns.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setColumns(arrayMove(sortedColumns, oldIndex, newIndex));
  }

  function handleAddColumn() {
    if (!newColumnName.trim()) return;
    const id = `col-${Date.now()}`;
    setColumns([...columns, { id, name: newColumnName.trim() }]);
    setNewColumnName("");
    setShowAddColumn(false);
  }

  function handleRemoveColumn(columnId: string) {
    setColumns(columns.filter((c) => c.id !== columnId));
    setConfirmRemove(null);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              placeholder="Filter columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-lg border border-[#C3C6D7] bg-white py-2 pl-9 pr-3 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <select
            className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2 text-sm text-[#434655] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            defaultValue="none"
          >
            <option value="none">No swimlanes</option>
            <option value="assignee" disabled>By assignee (coming soon)</option>
            <option value="priority" disabled>By priority (coming soon)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4 max-sm:px-1 max-sm:gap-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredColumns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            {filteredColumns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                onRemove={() => setConfirmRemove(column.id)}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="rounded-lg bg-white px-4 py-3 shadow-lg border border-[#2563EB]/30 w-72">
                <p className="text-sm font-medium text-[#121C28]">
                  {sortedColumns.find((c) => c.id === activeId)?.name}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="flex-shrink-0 w-72 max-sm:w-64">
          {showAddColumn ? (
            <div className="rounded-xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#C3C6D7]/20">
              <input
                autoFocus
                placeholder="Column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") setShowAddColumn(false);
                }}
                className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent mb-2"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddColumn}>Add</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddColumn(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-[#C3C6D7]/30 p-4 text-sm font-medium text-[#737686] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add column
            </button>
          )}
        </div>
      </div>

      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-[#121C28]">Remove column</h3>
            <p className="mt-2 text-sm text-[#737686]">
              Are you sure you want to remove this column? Issues in this column will not be deleted.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmRemove(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleRemoveColumn(confirmRemove)}>Remove</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardColumn({
  column,
  onRemove,
}: {
  column: Column;
  onRemove: () => void;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-72 max-sm:w-64 flex-shrink-0 flex-col rounded-xl bg-[#F1F2F6]"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between rounded-t-xl px-4 py-3 cursor-grab active:cursor-grabbing min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#C3C6D7]" />
          <h3 className="text-sm font-semibold text-[#121C28]">{column.name}</h3>
          <span className="rounded-md bg-[#E5E7EF] px-1.5 py-0.5 text-[11px] font-medium text-[#737686]">0</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded p-1 text-[#737686] hover:bg-[#E5E7EF] hover:text-red-500 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg className="mb-2 h-8 w-8 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          <p className="text-xs text-[#737686]">No issues yet</p>
          <p className="text-[11px] text-[#C3C6D7] mt-0.5">Issues will appear here in Phase 1.8</p>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#737686] transition-colors hover:bg-[#E5E7EF] hover:text-[#121C28]">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create issue
        </button>
      </div>
    </div>
  );
}
