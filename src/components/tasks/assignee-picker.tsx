"use client";

import { useState } from "react";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { useDropdown, DropdownPanel } from "@/components/ui/dropdown";

interface AssigneePickerProps {
  workspaceId: string;
  value: string | null;
  onChange: (userId: string | null) => void;
}

export function AssigneePicker({ workspaceId, value, onChange }: AssigneePickerProps) {
  const { data: members } = useGetMembersQuery(workspaceId);
  const { open, setOpen, triggerRef } = useDropdown();
  const [search, setSearch] = useState("");

  const selected = members?.find((m) => m.userId === value);
  const filtered = (members || []).filter((m) =>
    (m.user?.name || m.userId).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
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
      <DropdownPanel open={open} triggerRef={triggerRef} onClose={() => setOpen(false)} maxHeight={224}>
        <div className="sticky top-0 z-10 border-b border-border-light bg-surface px-2 py-1.5" onMouseDown={(e) => e.stopPropagation()}>
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
      </DropdownPanel>
    </div>
  );
}