"use client";

import { useState } from "react";
import type { Project } from "@/store/projectApi";
import { Plus, X } from "lucide-react";

interface ScreenField {
  id: string;
  name: string;
}

interface Screen {
  id: string;
  name: string;
  description: string;
  fields: ScreenField[];
}

const standardFields: ScreenField[] = [
  { id: "summary", name: "Summary" },
  { id: "description", name: "Description" },
  { id: "issue_type", name: "Issue Type" },
  { id: "priority", name: "Priority" },
  { id: "assignee", name: "Assignee" },
  { id: "reporter", name: "Reporter" },
  { id: "labels", name: "Labels" },
  { id: "fix_version", name: "Fix Version" },
  { id: "component", name: "Component" },
  { id: "due_date", name: "Due Date" },
  { id: "story_points", name: "Story Points" },
  { id: "sprint", name: "Sprint" },
  { id: "epic_link", name: "Epic Link" },
  { id: "attachment", name: "Attachment" },
  { id: "comment", name: "Comment" },
];

const defaultScreens: Screen[] = [
  {
    id: "create",
    name: "Create screen",
    description: "Fields shown when creating an issue",
    fields: standardFields.filter((f) => ["summary", "description", "issue_type", "priority", "assignee", "labels", "fix_version", "component", "sprint", "epic_link"].includes(f.id)),
  },
  {
    id: "edit",
    name: "Edit screen",
    description: "Fields shown when editing an issue",
    fields: [...standardFields],
  },
  {
    id: "view",
    name: "View screen",
    description: "Fields shown when viewing an issue",
    fields: [...standardFields],
  },
];

export function ProjectSettingsScreens({}: { project: Project }) {
  const [screens, setScreens] = useState<Screen[]>(defaultScreens);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  function getAvailableFields(screenId: string) {
    const screen = screens.find((s) => s.id === screenId);
    if (!screen) return [];
    const usedIds = new Set(screen.fields.map((f) => f.id));
    return standardFields.filter((f) => !usedIds.has(f.id));
  }

  function addField(screenId: string, fieldId: string) {
    const field = standardFields.find((f) => f.id === fieldId);
    if (!field) return;
    setScreens((prev) => prev.map((s) => s.id === screenId ? { ...s, fields: [...s.fields, field] } : s));
    setAddingTo(null);
  }

  function removeField(screenId: string, fieldId: string) {
    setScreens((prev) => prev.map((s) => s.id === screenId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s));
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">Screens</h2>
        <p className="text-sm text-[#737686]">Configure which fields appear on create, edit, and view screens</p>
      </div>

      <div className="space-y-6">
        {screens.map((screen) => (
          <div key={screen.id} className="rounded-xl border border-[#C3C6D7]/20 bg-white">
            <div className="flex items-center justify-between border-b border-[#C3C6D7]/20 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-[#121C28]">{screen.name}</h3>
                <p className="text-xs text-[#737686]">{screen.description}</p>
              </div>
              <span className="text-xs text-[#737686]">{screen.fields.length} fields</span>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {screen.fields.map((field) => (
                  <span key={field.id} className="inline-flex items-center gap-1.5 rounded-lg border border-[#C3C6D7]/30 bg-[#F8F9FF] px-2.5 py-1.5 text-xs font-medium text-[#121C28]">
                    {field.name}
                    <button
                      onClick={() => removeField(screen.id, field.id)}
                      className="text-[#C3C6D7] hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {addingTo === screen.id ? (
                <div className="mt-3 flex items-center gap-2">
                  <select
                    autoFocus
                    className="flex-1 rounded-lg border border-[#C3C6D7] bg-white px-3 py-1.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    value=""
                    onChange={(e) => { if (e.target.value) addField(screen.id, e.target.value); }}
                    onBlur={() => setAddingTo(null)}
                  >
                    <option value="">Select a field...</option>
                    {getAvailableFields(screen.id).map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setAddingTo(null)}
                    className="text-xs text-[#737686] hover:text-[#121C28]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTo(screen.id)}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add field
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
