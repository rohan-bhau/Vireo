"use client";

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { QuickFilterButton } from "./quick-filter-button";

interface QuickFilter {
  id: string;
  label: string;
  jql: string;
}

interface BoardFilterBarProps {
  quickFilters: QuickFilter[];
  activeFilters: string[];
  onToggleFilter: (filterId: string) => void;
  onJqlSearch: (query: string) => void;
  members?: { id: string; name: string; avatar?: string }[];
  assigneeFilter: string[];
  onToggleAssignee: (userId: string) => void;
  onClearFilters: () => void;
  swimlaneType?: string;
  onSwimlaneChange?: (type: string) => void;
}

const PREDEFINED_FILTERS: QuickFilter[] = [
  { id: "my-issues", label: "Only My Issues", jql: "assignee = currentUser()" },
  { id: "recently-updated", label: "Recently Updated", jql: "updated >= -7d" },
  { id: "unassigned", label: "Only Unassigned", jql: "assignee = null" },
];

export function BoardFilterBar({
  quickFilters = [],
  activeFilters,
  onToggleFilter,
  onJqlSearch,
  members = [],
  assigneeFilter,
  onToggleAssignee,
  onClearFilters,
  swimlaneType,
  onSwimlaneChange,
}: BoardFilterBarProps) {
  const [jqlInput, setJqlInput] = useState("");
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);

  const allFilters = [...PREDEFINED_FILTERS, ...quickFilters];
  const hasActiveFilters = activeFilters.length > 0 || assigneeFilter.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleJqlKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      onJqlSearch(jqlInput);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {allFilters.map((f) => (
        <QuickFilterButton
          key={f.id}
          label={f.label}
          active={activeFilters.includes(f.id)}
          onClick={() => onToggleFilter(f.id)}
        />
      ))}

      <div ref={assigneeRef} className="relative">
        <button
          onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
          className={clsx(
            "flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors",
            assigneeFilter.length > 0
              ? "bg-primary text-white"
              : "bg-bg-light text-text-secondary hover:bg-bg-neutral"
          )}
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          {assigneeFilter.length > 0 ? `Assignee (${assigneeFilter.length})` : "Assignee"}
        </button>
        {showAssigneeDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 rounded-lg bg-surface shadow-dropdown border border-border-light z-50 py-1">
            <div className="px-3 py-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">
              Filter by assignee
            </div>
            {members.length === 0 && (
              <div className="px-3 py-2 text-xs text-text-tertiary">No members</div>
            )}
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => onToggleAssignee(m.id)}
                className={clsx(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors",
                  assigneeFilter.includes(m.id)
                    ? "bg-primary-bg text-primary"
                    : "text-text-primary hover:bg-bg-light"
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white flex-shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1">{m.name}</span>
                {assigneeFilter.includes(m.id) && (
                  <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {onSwimlaneChange && (
        <select
          value={swimlaneType || "none"}
          onChange={(e) => onSwimlaneChange(e.target.value)}
          className="rounded-sm border border-border-input bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="none">No swimlanes</option>
          <option value="assignee">By assignee</option>
          <option value="epic">By epic</option>
          <option value="priority">By priority</option>
        </select>
      )}

      <div className="relative flex-1 min-w-[160px] max-w-[240px]">
        <svg className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          placeholder="Search JQL..."
          value={jqlInput}
          onChange={(e) => setJqlInput(e.target.value)}
          onKeyDown={handleJqlKeyDown}
          className="w-full rounded-sm border border-border-input bg-surface py-1.5 pl-7 pr-2 text-[11px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-[11px] font-medium text-text-tertiary hover:text-text-primary transition-colors whitespace-nowrap"
        >
          Clear filters ({activeFilters.length + assigneeFilter.length})
        </button>
      )}
    </div>
  );
}
