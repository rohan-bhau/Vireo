"use client";

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import type { Board } from "@/store/projectApi";

interface BoardSwitcherProps {
  boards: Board[];
  activeBoardId: string;
  onSelect: (boardId: string) => void;
}

export function BoardSwitcher({ boards, activeBoardId, onSelect }: BoardSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={clsx(
            "flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium text-text-primary",
            "hover:bg-bg-light transition-colors"
          )}
        >
          <svg className="h-4 w-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>{activeBoard?.name || "Select board"}</span>
          <svg className={clsx("h-4 w-4 text-text-tertiary transition-transform", open && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 w-56 rounded-lg bg-surface shadow-dropdown border border-border-light z-50 py-1">
            <div className="px-3 py-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">
              Boards
            </div>
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => {
                  onSelect(board.id);
                  setOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                  board.id === activeBoardId
                    ? "bg-primary-bg text-primary font-medium"
                    : "text-text-primary hover:bg-bg-light"
                )}
              >
                <span className={clsx(
                  "h-2 w-2 rounded-full flex-shrink-0",
                  board.type === "SCRUM" ? "bg-primary" : "bg-success"
                )} />
                <span className="flex-1">{board.name}</span>
                <span className="text-[10px] text-text-tertiary uppercase">{board.type}</span>
              </button>
            ))}
          </div>
        )}
    </div>
  );
}
