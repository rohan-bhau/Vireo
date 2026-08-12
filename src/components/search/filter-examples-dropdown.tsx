"use client";

import { useState } from "react";
import { clsx } from "clsx";

interface ExampleFilter {
  label: string;
  jql: string;
}

const EXAMPLES: ExampleFilter[] = [
  { label: "Assigned to me", jql: "assignee = currentUser()" },
  { label: "Reported by me", jql: "reporter = currentUser()" },
  { label: "Done in last week", jql: "status = done AND updated >= startOfWeek()" },
  { label: "High priority open", jql: "priority = High AND status != done" },
  { label: "My open tasks", jql: "assignee = currentUser() AND status != done" },
  { label: "Unassigned", jql: "assignee = null" },
  { label: "Recently viewed", jql: "updated >= -7d ORDER BY updated DESC" },
  { label: "Blocked issues", jql: "status = blocked" },
];

interface FilterExamplesDropdownProps {
  onSelect: (jql: string) => void;
}

export function FilterExamplesDropdown({ onSelect }: FilterExamplesDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-[3px] border border-[#DFE1E6] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#42526E] hover:bg-[#F1F2F6] transition-colors whitespace-nowrap"
      >
        Examples
        <svg className={clsx("h-3 w-3 transition-transform", open && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 cursor-pointer" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-[3px] border border-[#DFE1E6] bg-white shadow-modal py-1">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#737686]">
              Show me:
            </div>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => {
                  onSelect(ex.jql);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#434655] hover:bg-[#F1F2F6] transition-colors"
              >
                <svg className="h-3 w-3 shrink-0 text-[#737686]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <span>{ex.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
