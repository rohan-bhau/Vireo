"use client";

import { useState } from "react";

interface VersionSelectorProps {
  value: string;
  onChange: (version: string) => void;
  versions?: string[];
}

export function VersionSelector({ value, onChange, versions = [] }: VersionSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text hover:border-border-default transition-colors text-left"
      >
        {value || <span className="text-text-placeholder">None</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[3px] border border-border-light bg-surface shadow-modal max-h-40 overflow-y-auto">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-placeholder hover:bg-bg-light"
            >
              None
            </button>
            {versions.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => { onChange(v); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${v === value ? "bg-bg-light font-medium" : ""}`}
              >
                {v}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}