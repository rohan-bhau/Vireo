"use client";

import { useState, useRef } from "react";
import { useGetMembersQuery } from "@/store/workspaceApi";

interface AssigneePickerProps {
  workspaceId: string;
  value: string | null;
  onChange: (userId: string | null) => void;
}

export function AssigneePicker({ workspaceId, value, onChange }: AssigneePickerProps) {
  const { data: members } = useGetMembersQuery(workspaceId);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = members?.find((m) => m.userId === value);
  const filtered = (members || []).filter((m) =>
    (m.user?.name || m.userId).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text hover:border-border-default transition-colors text-left"
      >
        {selected ? (
          <>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white">
              {(selected.user?.name || selected.userId).charAt(0).toUpperCase()}
            </span>
            <span>{selected.user?.name || selected.userId}</span>
          </>
        ) : (
          <span className="text-text-placeholder">Unassigned</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[3px] border border-border-light bg-surface shadow-modal max-h-56 overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-border-light px-2 py-1.5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full rounded border border-border-input px-2 py-1 text-xs text-text placeholder:text-text-placeholder focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:bg-bg-light"
            >
              Unassigned
            </button>
            {filtered.map((m) => (
              <button
                key={m.userId}
                type="button"
                onClick={() => { onChange(m.userId); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-light ${m.userId === value ? "bg-bg-light font-medium" : ""}`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white">
                  {(m.user?.name || m.userId).charAt(0).toUpperCase()}
                </span>
                <span>{m.user?.name || m.userId}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}