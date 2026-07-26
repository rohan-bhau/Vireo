"use client";

import { clsx } from "clsx";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onBulkTransition?: (status: string) => void;
  onBulkAssign?: (userId: string) => void;
  onBulkDelete?: () => void;
}

const TRANSITION_STATUSES = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

export function BulkActionBar({ selectedCount, onClear, onBulkTransition, onBulkAssign, onBulkDelete }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-[3px] bg-[#2563EB] px-4 py-2 text-white shadow-sm">
      <span className="text-xs font-medium">{selectedCount} selected</span>

      <div className="flex items-center gap-1.5 ml-2">
        <span className="text-[10px] text-white/70">Status:</span>
        {TRANSITION_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => onBulkTransition?.(s.value)}
            className="rounded-[2px] bg-white/15 px-2 py-0.5 text-[10px] font-medium hover:bg-white/25 transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onBulkAssign ? () => onBulkAssign("") : undefined}
          className="flex items-center gap-1 rounded-[2px] bg-white/15 px-2 py-0.5 text-[10px] font-medium hover:bg-white/25 transition-colors"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          Assign
        </button>

        {onBulkDelete && (
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1 rounded-[2px] bg-red-500/20 px-2 py-0.5 text-[10px] font-medium hover:bg-red-500/40 transition-colors"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>
        )}

        <button
          onClick={onClear}
          className="rounded-[2px] bg-white/15 px-2 py-0.5 text-[10px] font-medium hover:bg-white/25 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
