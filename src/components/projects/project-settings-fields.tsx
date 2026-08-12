"use client";

import { useState } from "react";
import type { Project } from "@/store/projectApi";
import { Search, Eye, EyeOff, List, Lock } from "lucide-react";

interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  enabled: boolean;
  visible: boolean;
  category: "system" | "custom";
}

const defaultFields: Field[] = [
  { id: "summary", name: "Summary", type: "Text", required: true, enabled: true, visible: true, category: "system" },
  { id: "description", name: "Description", type: "Textarea", required: false, enabled: true, visible: true, category: "system" },
  { id: "issue_type", name: "Issue Type", type: "Select", required: true, enabled: true, visible: true, category: "system" },
  { id: "status", name: "Status", type: "Select", required: true, enabled: true, visible: true, category: "system" },
  { id: "priority", name: "Priority", type: "Select", required: true, enabled: true, visible: true, category: "system" },
  { id: "assignee", name: "Assignee", type: "User", required: false, enabled: true, visible: true, category: "system" },
  { id: "reporter", name: "Reporter", type: "User", required: true, enabled: true, visible: true, category: "system" },
  { id: "labels", name: "Labels", type: "Tags", required: false, enabled: true, visible: true, category: "system" },
  { id: "fix_version", name: "Fix Version", type: "Select", required: false, enabled: true, visible: true, category: "system" },
  { id: "component", name: "Component", type: "Select", required: false, enabled: true, visible: true, category: "system" },
  { id: "due_date", name: "Due Date", type: "Date", required: false, enabled: true, visible: true, category: "system" },
  { id: "story_points", name: "Story Points", type: "Number", required: false, enabled: true, visible: true, category: "system" },
  { id: "sprint", name: "Sprint", type: "Select", required: false, enabled: true, visible: true, category: "system" },
  { id: "epic_link", name: "Epic Link", type: "Select", required: false, enabled: false, visible: false, category: "custom" },
  { id: "team", name: "Team", type: "Select", required: false, enabled: false, visible: false, category: "custom" },
  { id: "customer_impact", name: "Customer Impact", type: "Text", required: false, enabled: false, visible: false, category: "custom" },
];

export function ProjectSettingsFields({}: { project: Project }) {
  const [fields, setFields] = useState<Field[]>(defaultFields);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "system" | "custom">("all");

  const q = search.toLowerCase();
  const filtered = fields.filter((f) => {
    if (filterCategory !== "all" && f.category !== filterCategory) return false;
    return f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
  });

  function toggleEnabled(id: string) {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled } : f));
  }

  function toggleVisible(id: string) {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, visible: !f.visible } : f));
  }

  const systemFields = filtered.filter((f) => f.category === "system");
  const customFields = filtered.filter((f) => f.category === "custom");

  function renderFieldList(list: Field[]) {
    return list.map((field) => (
      <div key={field.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F8F9FF] transition-colors">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8F9FF] text-[#737686]">
            <List className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#121C28] truncate">{field.name}</p>
            <p className="text-xs text-[#737686] flex items-center gap-1.5">
              <span className="rounded bg-[#F0F4FF] px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB]">{field.type}</span>
              {field.required && <span className="text-[#FF5630]">Required</span>}
              <span className={field.category === "system" ? "text-[#737686]" : "text-[#6554C0]"}>
                {field.category === "system" ? "System" : "Custom"}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <button
            onClick={() => toggleVisible(field.id)}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
              field.visible ? "bg-[#EEF4FF] text-[#2563EB]" : "text-[#737686] hover:bg-[#F8F9FF]"
            }`}
            title={field.visible ? "Visible" : "Hidden"}
          >
            {field.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <span className="max-sm:hidden">{field.visible ? "Visible" : "Hidden"}</span>
          </button>
          <button
            onClick={() => toggleEnabled(field.id)}
            className={`relative h-5 w-9 rounded-full transition-colors ${field.enabled ? "bg-[#2563EB]" : "bg-[#C3C6D7]"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${field.enabled ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>
    ));
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">Fields</h2>
        <p className="text-sm text-[#737686]">Manage fields available in this project</p>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737686]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fields..."
            className="w-full rounded-lg border border-[#C3C6D7] bg-white py-2 pl-9 pr-3 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-[#F8F9FF] p-1">
          {(["all", "system", "custom"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterCategory === cat ? "bg-white text-[#121C28] shadow-sm" : "text-[#737686] hover:text-[#121C28]"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {systemFields.length > 0 && (
          <div className="rounded-xl border border-[#C3C6D7]/20 overflow-hidden">
            <div className="bg-[#F8F9FF] px-4 py-2 border-b border-[#C3C6D7]/20">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#737686]" />
                <span className="text-xs font-semibold text-[#737686]">System Fields ({systemFields.length})</span>
              </div>
            </div>
            <div className="divide-y divide-[#C3C6D7]/10">
              {renderFieldList(systemFields)}
            </div>
          </div>
        )}
        {customFields.length > 0 && (
          <div className="rounded-xl border border-[#C3C6D7]/20 overflow-hidden">
            <div className="bg-[#F8F9FF] px-4 py-2 border-b border-[#C3C6D7]/20">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-[#6554C0]" />
                <span className="text-xs font-semibold text-[#737686]">Custom Fields ({customFields.length})</span>
              </div>
            </div>
            <div className="divide-y divide-[#C3C6D7]/10">
              {renderFieldList(customFields)}
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-16 text-center">
            <List className="mb-3 h-10 w-10 text-[#C3C6D7]" />
            <h3 className="text-base font-semibold text-[#121C28]">No fields found</h3>
            <p className="mt-1 text-sm text-[#737686]">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
