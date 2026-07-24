"use client";

import { useState, useRef } from "react";

interface LabelEditorProps {
  value: string[];
  onChange: (labels: string[]) => void;
  workspaceId?: string;
}

const COMMON_LABELS = ["bug", "feature", "enhancement", "documentation", "frontend", "backend", "api", "urgent", "design", "testing"];

export function LabelEditor({ value, onChange, workspaceId }: LabelEditorProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const allLabels = [...new Set([...COMMON_LABELS, ...value])];
  const filtered = allLabels.filter(
    (l) => l.toLowerCase().includes(input.toLowerCase()) && !value.includes(l)
  );

  function addLabel(label: string) {
    if (!value.includes(label)) {
      onChange([...value, label]);
    }
    setInput("");
  }

  function removeLabel(label: string) {
    onChange(value.filter((l) => l !== label));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addLabel(input.trim());
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeLabel(value[value.length - 1]);
    }
  }

  return (
    <div ref={ref} className="relative">
      <div
        className="flex flex-wrap items-center gap-1 rounded-[3px] border border-border-input bg-surface px-2 py-1.5 min-h-[32px] cursor-text"
        onClick={() => (document.querySelector(`#label-input-${workspaceId}`) as HTMLInputElement)?.focus()}
      >
        {value.map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded bg-bg-light px-1.5 py-0.5 text-[11px] font-medium text-text-secondary"
          >
            {label}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeLabel(label); }}
              className="hover:text-danger transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={`label-input-${workspaceId}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={value.length === 0 ? "Type to add labels..." : ""}
          className="min-w-[80px] flex-1 border-0 bg-transparent text-xs text-text placeholder:text-text-placeholder focus:outline-none"
        />
      </div>
      {open && input && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[3px] border border-border-light bg-surface shadow-modal max-h-40 overflow-y-auto">
          {filtered.slice(0, 8).map((label) => (
            <button
              key={label}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addLabel(label); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-bg-light"
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}