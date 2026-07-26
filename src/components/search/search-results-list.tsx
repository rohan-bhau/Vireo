"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import type { Task } from "@/store/taskApi";

type SortField = "taskKey" | "title" | "status" | "priority" | "assignee" | "updatedAt";

interface SearchResultsListProps {
  tasks: Task[];
  total: number;
  loading: boolean;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onSort: (field: string, dir: string) => void;
  sortField: string;
  sortDir: string;
  onTaskClick?: (task: Task) => void;
  focusedIndex?: number;
  onFocusedIndexChange?: (index: number) => void;
}

const PRIORITY_ICONS: Record<string, string> = {
  highest: "🔴", high: "🟠", medium: "🟡", low: "🟢", lowest: "⚪",
};

const STATUS_STYLES: Record<string, string> = {
  todo: "bg-[#F1F2F6] text-[#737686]",
  in_progress: "bg-[#DBEAFE] text-[#2563EB]",
  in_review: "bg-[#FEF3C7] text-[#D97706]",
  done: "bg-[#D1FAE5] text-[#059669]",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "Todo", in_progress: "In Progress", in_review: "In Review", done: "Done",
};

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  checkbox: 40,
  taskKey: 100,
  title: 300,
  status: 110,
  priority: 100,
  assignee: 140,
  updatedAt: 100,
};

export function SearchResultsList({
  tasks, total, loading, selectedIds, onSelect, onSort, sortField, sortDir, onTaskClick,
  focusedIndex = -1, onFocusedIndexChange,
}: SearchResultsListProps) {
  const router = useRouter();
  const [selectAll, setSelectAll] = useState(false);
  const [colWidths, setColWidths] = useState<Record<string, number>>(DEFAULT_COL_WIDTHS);
  const resizing = useRef<{ field: string; startX: number; startWidth: number } | null>(null);

  function toggleSelect(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((s) => s !== id)
      : [...selectedIds, id];
    onSelect(next);
  }

  function toggleSelectAll() {
    if (selectAll) {
      onSelect([]);
    } else {
      onSelect(tasks.map((t) => t._id));
    }
    setSelectAll(!selectAll);
  }

  function handleSort(field: SortField) {
    const dir = sortField === field && sortDir === "asc" ? "desc" : "asc";
    onSort(field, dir);
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing.current) return;
    const diff = e.clientX - resizing.current.startX;
    const newWidth = Math.max(60, resizing.current.startWidth + diff);
    setColWidths((prev) => ({ ...prev, [resizing.current!.field]: newWidth }));
  }, []);

  const handleMouseUp = useCallback(() => {
    resizing.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    if (resizing.current) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  function initResize(field: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = { field, startX: e.clientX, startWidth: colWidths[field] || 100 };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return (
        <svg className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-50 text-[#737686]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3l4 4-4 4M16 21l-4-4 4-4" />
        </svg>
      );
    }
    if (sortDir === "asc") {
      return (
        <svg className="ml-1 h-3 w-3 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7-7 7 7" />
        </svg>
      );
    }
    return (
      <svg className="ml-1 h-3 w-3 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19V5M5 12l7 7 7-7" />
      </svg>
    );
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[3px] border border-[#DFE1E6] bg-white">
      <table className="w-full text-left" style={{ tableLayout: "fixed" }}>
        <thead>
          <tr className="border-b border-[#DFE1E6] text-[11px] font-semibold uppercase tracking-wider text-[#737686]">
            <th className="px-3 py-2.5" style={{ width: colWidths.checkbox }}>
              <input
                type="checkbox"
                checked={selectAll && tasks.length > 0}
                onChange={toggleSelectAll}
                className="h-3.5 w-3.5 rounded border-[#DFE1E6] text-[#2563EB] focus:ring-[#2563EB]"
              />
            </th>
            <Th sortable field="taskKey" onClick={handleSort} width={colWidths.taskKey} onResize={(e) => initResize("taskKey", e)}><SortIcon field="taskKey" />Key</Th>
            <Th sortable field="title" onClick={handleSort} width={colWidths.title} onResize={(e) => initResize("title", e)}><SortIcon field="title" />Summary</Th>
            <Th sortable field="status" onClick={handleSort} width={colWidths.status} onResize={(e) => initResize("status", e)}><SortIcon field="status" />Status</Th>
            <Th sortable field="priority" onClick={handleSort} width={colWidths.priority} onResize={(e) => initResize("priority", e)}><SortIcon field="priority" />Priority</Th>
            <Th sortable field="assignee" onClick={handleSort} width={colWidths.assignee} onResize={(e) => initResize("assignee", e)}><SortIcon field="assignee" />Assignee</Th>
            <Th sortable field="updatedAt" onClick={handleSort} width={colWidths.updatedAt} onResize={(e) => initResize("updatedAt", e)}><SortIcon field="updatedAt" />Updated</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DFE1E6]/50">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#737686]">
                <div className="flex flex-col items-center gap-2">
                  <svg className="h-8 w-8 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  No issues match this search
                </div>
              </td>
            </tr>
          ) : (
            tasks.map((task, idx) => (
              <tr
                key={task._id}
                onClick={() => onTaskClick ? onTaskClick(task) : router.push(`/task/${task.taskKey}`)}
                className={clsx(
                  "cursor-pointer text-xs text-[#434655] transition-colors",
                  selectedIds.includes(task._id) ? "bg-[#EEF4FF]" : focusedIndex === idx ? "bg-[#F0F5FF]" : "hover:bg-[#F8F9FF]"
                )}
                data-task-index={idx}
              >
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(task._id)}
                    onChange={() => toggleSelect(task._id)}
                    className="h-3.5 w-3.5 rounded border-[#DFE1E6] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#2563EB]" style={{ width: colWidths.taskKey }}>{task.taskKey}</td>
                <td className="px-3 py-2.5 font-medium text-[#121C28] truncate" style={{ width: colWidths.title, maxWidth: colWidths.title }}>{task.title}</td>
                <td className="px-3 py-2.5" style={{ width: colWidths.status }}>
                  <span className={`inline-block rounded-[3px] px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[task.status] || STATUS_STYLES.todo}`}>
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[11px]" style={{ width: colWidths.priority }}>{PRIORITY_ICONS[task.priority] || "⚪"} {task.priority}</td>
                <td className="px-3 py-2.5 truncate" style={{ width: colWidths.assignee, maxWidth: colWidths.assignee }}>
                  {task.assignee || <span className="text-[#C3C6D7]">Unassigned</span>}
                </td>
                <td className="px-3 py-2.5 text-[#737686]" style={{ width: colWidths.updatedAt }}>{formatDate(task.updatedAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-[#DFE1E6] px-3 py-2 text-[11px] text-[#737686]">
        <span>{total} issue{total !== 1 ? "s" : ""}</span>
        {selectedIds.length > 0 && (
          <span className="font-medium text-[#2563EB]">{selectedIds.length} selected</span>
        )}
      </div>
    </div>
  );
}

function Th({ children, sortable, field, onClick, width, onResize }: {
  children: React.ReactNode; sortable?: boolean; field?: SortField;
  onClick?: (field: SortField) => void; width?: number; onResize?: (e: React.MouseEvent) => void;
}) {
  return (
    <th
      className={clsx("group px-3 py-2.5 font-normal relative", sortable && "cursor-pointer hover:text-[#121C28]")}
      onClick={() => sortable && field && onClick?.(field)}
      style={{ width }}
    >
      <div className="flex items-center gap-0.5">{children}</div>
      {onResize && (
        <div
          onMouseDown={onResize}
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-[#2563EB]/30 transition-colors"
        />
      )}
    </th>
  );
}
