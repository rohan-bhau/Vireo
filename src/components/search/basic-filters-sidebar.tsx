"use client";

import { clsx } from "clsx";
import { useState } from "react";

interface BasicFiltersProps {
  filters: {
    project?: string[];
    type?: string[];
    status?: string[];
    priority?: string[];
    assignee?: string[];
    reporter?: string[];
    labels?: string[];
  };
  onChange: (field: string, value: string[]) => void;
  onApply: () => void;
}

const ISSUE_TYPES = [
  { value: "task", label: "Task", icon: "○" },
  { value: "bug", label: "Bug", icon: "◉" },
  { value: "story", label: "Story", icon: "☰" },
  { value: "epic", label: "Epic", icon: "◆" },
  { value: "subtask", label: "Subtask", icon: "▶" },
];

const STATUSES = [
  { value: "todo", label: "Todo", color: "bg-[#737686]" },
  { value: "in_progress", label: "In Progress", color: "bg-[#2563EB]" },
  { value: "in_review", label: "In Review", color: "bg-[#D97706]" },
  { value: "done", label: "Done", color: "bg-[#059669]" },
];

const PRIORITIES = [
  { value: "highest", label: "Highest", icon: "🔴" },
  { value: "high", label: "High", icon: "🟠" },
  { value: "medium", label: "Medium", icon: "🟡" },
  { value: "low", label: "Low", icon: "🟢" },
  { value: "lowest", label: "Lowest", icon: "⚪" },
];

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#DFE1E6] pb-3">
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#737686]">{label}</h4>
      {children}
    </div>
  );
}

export function BasicFiltersSidebar({ filters, onChange }: BasicFiltersProps) {
  const [showMore, setShowMore] = useState(false);

  function toggleValue(field: string, value: string) {
    const current = filters[field as keyof typeof filters] || [];
    const next = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    onChange(field, next);
  }

  function clearAll() {
    onChange("clear", []);
  }

  const hasAnyFilters = Object.values(filters).some((arr) => arr && arr.length > 0);

  return (
    <div className="w-56 flex-shrink-0 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737686]">Filters</h3>
        {hasAnyFilters && (
          <button onClick={clearAll} className="text-[11px] text-[#2563EB] hover:underline">
            Clear all
          </button>
        )}
      </div>

      <FilterSection label="Issue Type">
        <div className="space-y-1">
          {ISSUE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleValue("type", t.value)}
              className={clsx(
                "flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-xs text-left transition-colors",
                (filters.type || []).includes(t.value)
                  ? "bg-[#EEF4FF] text-[#2563EB]"
                  : "text-[#434655] hover:bg-[#F1F2F6]"
              )}
            >
              <span className="text-[11px]">{t.icon}</span>
              <span className="flex-1">{t.label}</span>
              {(filters.type || []).includes(t.value) && (
                <svg className="h-3 w-3 text-[#2563EB]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Status">
        <div className="space-y-1">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => toggleValue("status", s.value)}
              className={clsx(
                "flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-xs text-left transition-colors",
                (filters.status || []).includes(s.value)
                  ? "bg-[#EEF4FF] text-[#2563EB]"
                  : "text-[#434655] hover:bg-[#F1F2F6]"
              )}
            >
              <span className={clsx("h-2 w-2 rounded-full", s.color)} />
              <span className="flex-1">{s.label}</span>
              {(filters.status || []).includes(s.value) && (
                <svg className="h-3 w-3 text-[#2563EB]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Priority">
        <div className="space-y-1">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              onClick={() => toggleValue("priority", p.value)}
              className={clsx(
                "flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-xs text-left transition-colors",
                (filters.priority || []).includes(p.value)
                  ? "bg-[#EEF4FF] text-[#2563EB]"
                  : "text-[#434655] hover:bg-[#F1F2F6]"
              )}
            >
              <span>{p.icon}</span>
              <span className="flex-1">{p.label}</span>
              {(filters.priority || []).includes(p.value) && (
                <svg className="h-3 w-3 text-[#2563EB]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {showMore && (
        <>
          <FilterSection label="Reporter">
            <div className="space-y-1">
              <input
                placeholder="Search reporters..."
                className="w-full rounded-[3px] border border-[#DFE1E6] px-2 py-1 text-xs text-[#121C28] placeholder:text-[#737686] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </FilterSection>

          <FilterSection label="Labels">
            <div className="space-y-1">
              <input
                placeholder="Search labels..."
                className="w-full rounded-[3px] border border-[#DFE1E6] px-2 py-1 text-xs text-[#121C28] placeholder:text-[#737686] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </FilterSection>
        </>
      )}

      <button
        onClick={() => setShowMore(!showMore)}
        className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
      >
        {showMore ? "Show less" : "More filters..."}
      </button>
    </div>
  );
}
