"use client";

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import type { Board } from "@/store/projectApi";

interface BoardHeaderProps {
  board: Board;
  boardCount: number;
  onOpenConfig: () => void;
}

export function BoardHeader({ board, boardCount, onOpenConfig }: BoardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <div className={clsx(
          "h-2.5 w-2.5 rounded-full",
          board.type === "SCRUM" ? "bg-primary" : "bg-success"
        )} />
        <div>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight">{board.name}</h1>
          <p className="text-[11px] text-text-tertiary">
            {board.type === "SCRUM" ? "Scrum" : "Kanban"} board
            {boardCount > 1 && ` · ${boardCount} boards in project`}
          </p>
        </div>
      </div>
      <div ref={ref} className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-text-tertiary hover:bg-bg-light transition-colors"
          title="Board menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-surface shadow-dropdown border border-border-light z-50 py-1">
            <button
              onClick={() => { onOpenConfig(); setMenuOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-light transition-colors"
            >
              <svg className="h-4 w-4 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Board settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
