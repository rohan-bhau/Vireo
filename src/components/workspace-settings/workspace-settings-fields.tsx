"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { GripVertical, Plus } from "lucide-react";

const SYSTEM_FIELDS: { name: string; type: string; description: string }[] = [
  { name: "Summary", type: "Text", description: "The issue title" },
  { name: "Description", type: "Textarea", description: "Rich detail about the issue" },
  { name: "Type", type: "Select", description: "Epic, Story, Task, Bug or Subtask" },
  { name: "Status", type: "Select", description: "Current workflow position" },
  { name: "Priority", type: "Select", description: "Importance of the issue" },
  { name: "Assignee", type: "User", description: "Who the issue is assigned to" },
  { name: "Reporter", type: "User", description: "Who created the issue" },
  { name: "Due date", type: "Date", description: "Deadline for the issue" },
  { name: "Labels", type: "Multi-select", description: "Free-form tags" },
  { name: "Story points", type: "Number", description: "Estimate of effort" },
];

export function WorkspaceSettingsFields() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Fields</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Standard fields are built into every issue. Custom fields are on the roadmap.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-light bg-surface">
        <div className="border-b border-border-light px-5 py-3">
          <h3 className="text-sm font-semibold text-text">System fields</h3>
          <p className="mt-0.5 text-xs text-text-tertiary">Read-only — used across all issues.</p>
        </div>
        <ul className="divide-y divide-border-light">
          {SYSTEM_FIELDS.map((field) => (
            <li key={field.name} className="flex items-center gap-3 px-5 py-3">
              <GripVertical className="h-4 w-4 shrink-0 text-text-tertiary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">{field.name}</p>
                <p className="truncate text-xs text-text-tertiary">{field.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-bg-light px-2.5 py-0.5 text-[11px] font-medium text-text-secondary">
                {field.type}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border-light bg-surface">
        <EmptyState
          icon={<Plus className="h-8 w-8" />}
          title="Custom fields — coming soon"
          message="Create bespoke fields to capture workspace-specific data. This is planned for a follow-up release."
        />
      </div>
    </div>
  );
}