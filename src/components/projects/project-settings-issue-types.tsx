"use client";

import { useState } from "react";
import type { Project } from "@/store/projectApi";
import { ChevronUp, ChevronDown, GripVertical, Tag } from "lucide-react";

interface IssueType {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  issueCount: number;
}

const defaultTypes: IssueType[] = [
  { id: "epic", name: "Epic", icon: "●", color: "#6554C0", enabled: true, issueCount: 3 },
  { id: "story", name: "Story", icon: "●", color: "#36B37E", enabled: true, issueCount: 12 },
  { id: "task", name: "Task", icon: "●", color: "#4C9AFF", enabled: true, issueCount: 45 },
  { id: "bug", name: "Bug", icon: "●", color: "#FF5630", enabled: true, issueCount: 8 },
  { id: "subtask", name: "Subtask", icon: "●", color: "#00B8D9", enabled: true, issueCount: 23 },
];

export function ProjectSettingsIssueTypes({ project }: { project: Project }) {
  const [types, setTypes] = useState<IssueType[]>(defaultTypes);

  function toggleEnabled(id: string) {
    setTypes((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...types];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setTypes(next);
  }

  function moveDown(index: number) {
    if (index === types.length - 1) return;
    const next = [...types];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setTypes(next);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">Issue types</h2>
        <p className="text-sm text-[#737686]">Enable or disable and reorder issue types for this project</p>
      </div>

      <div className="rounded-xl border border-[#C3C6D7]/20 overflow-hidden">
        <div className="bg-[#F8F9FF] px-4 py-2.5 border-b border-[#C3C6D7]/20">
          <div className="grid grid-cols-[32px_1fr_80px_80px_80px] max-sm:grid-cols-[32px_1fr_60px_60px] gap-3 text-xs font-semibold uppercase tracking-wider text-[#737686]">
            <span />
            <span>Name</span>
            <span className="text-center">Issues</span>
            <span className="text-center">Enabled</span>
            <span className="text-center max-sm:hidden">Reorder</span>
          </div>
        </div>
        <div className="divide-y divide-[#C3C6D7]/10">
          {types.map((type, index) => (
            <div key={type.id} className="px-4 py-3 hover:bg-[#F8F9FF] transition-colors">
              <div className="grid grid-cols-[32px_1fr_80px_80px_80px] max-sm:grid-cols-[32px_1fr_60px_60px] gap-3 items-center">
                <div className="flex items-center justify-center">
                  <GripVertical className="h-4 w-4 text-[#C3C6D7] cursor-grab" />
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg" style={{ color: type.color }}>{type.icon}</span>
                  <span className="text-sm font-medium text-[#121C28]">{type.name}</span>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-[#F8F9FF] px-2 py-0.5 text-xs font-medium text-[#737686]">
                    {type.issueCount}
                  </span>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleEnabled(type.id)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${type.enabled ? "bg-[#2563EB]" : "bg-[#C3C6D7]"}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${type.enabled ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1 max-sm:hidden">
                  <button onClick={() => moveUp(index)} className="flex h-7 w-7 items-center justify-center rounded text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors disabled:opacity-30" disabled={index === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => moveDown(index)} className="flex h-7 w-7 items-center justify-center rounded text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors disabled:opacity-30" disabled={index === types.length - 1}>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
