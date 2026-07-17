"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import { useGetBoardQuery, useReorderColumnsMutation, useAddColumnMutation } from "@/store/projectApi";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth";

interface ColumnData {
  id: string;
  name: string;
  position: number;
  boardId: string;
}

export default function BoardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project } = useGetProjectQuery(projectId);
  const [boardId, setBoardId] = useState<string | null>(null);
  const { data: board, isLoading, refetch } = useGetBoardQuery(boardId ?? "", { skip: !boardId });

  const [reorderColumns] = useReorderColumnsMutation();
  const [addColumn] = useAddColumnMutation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (project?.boards && project.boards.length > 0 && !boardId) {
      setBoardId(project.boards[0].id);
    }
  }, [project, boardId]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !boardId) return;

    const s: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });

    s.on("connect", () => {
      s.emit("join-board", boardId);
    });

    s.on("board-updated", () => {
      refetch();
    });

    return () => {
      if (boardId) s.emit("leave-board", boardId);
      s.disconnect();
    };
  }, [boardId, refetch]);

  const columns: ColumnData[] = board?.columns ?? [];
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  const filteredColumns = searchQuery
    ? sortedColumns.filter((col) =>
        col.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedColumns;

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sortedColumns.findIndex((c) => c.id === active.id);
    const newIndex = sortedColumns.findIndex((c) => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sortedColumns, oldIndex, newIndex);
    const columnIds = reordered.map((c) => c.id);

    try {
      if (boardId) await reorderColumns({ boardId, columnIds }).unwrap();
    } catch (err) {
      console.error("Failed to reorder columns:", err);
    }
  }

  async function handleAddColumn() {
    if (!newColumnName.trim() || !boardId) return;
    try {
      await addColumn({ boardId, name: newColumnName.trim() }).unwrap();
      setNewColumnName("");
      setShowAddColumn(false);
    } catch (err) {
      console.error("Failed to add column:", err);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
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

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredColumns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
              {filteredColumns.map((column) => (
                <BoardColumn key={column.id} column={column} />
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

          <div className="flex-shrink-0 w-72">
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
      )}
    </div>
  );
}

function BoardColumn({ column }: { column: ColumnData }) {
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
      className="flex w-72 flex-shrink-0 flex-col rounded-xl bg-[#F1F2F6]"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between rounded-t-xl px-4 py-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#C3C6D7]" />
          <h3 className="text-sm font-semibold text-[#121C28]">{column.name}</h3>
          <span className="rounded-md bg-[#E5E7EF] px-1.5 py-0.5 text-[11px] font-medium text-[#737686]">0</span>
        </div>
        <button
          className="rounded p-1 text-[#737686] hover:bg-[#E5E7EF] hover:text-[#121C28] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg className="mb-2 h-8 w-8 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          <p className="text-xs text-[#737686]">No tasks yet</p>
          <p className="text-[11px] text-[#C3C6D7] mt-0.5">Tasks will appear here in Phase 1.8</p>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#737686] transition-colors hover:bg-[#E5E7EF] hover:text-[#121C28]">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create task
        </button>
      </div>
    </div>
  );
}
