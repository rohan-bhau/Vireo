"use client";

import { Check } from "lucide-react";
import type { ProjectTemplate } from "@/store/projectApi";
import { clsx } from "clsx";

const WORKSPACE_TYPES: { id: ProjectTemplate; name: string; desc: string }[] = [
  { id: "KANBAN", name: "Kanban", desc: "Continuous flow with columns" },
  { id: "SCRUM", name: "Scrum", desc: "Sprints, backlog, velocity" },
  { id: "BUG_TRACKING", name: "Bug Tracking", desc: "Triage and resolve defects" },
  { id: "PROJECT_MANAGEMENT", name: "Project Management", desc: "Plan projects on a timeline" },
  { id: "DEVOPS", name: "DevOps", desc: "Connect dev and operations" },
  { id: "TASK_TRACKING", name: "Task Tracking", desc: "Simple to-do workflows" },
  { id: "BLANK", name: "Start from scratch", desc: "Empty board you configure" },
];

export const WORKSPACE_TYPES_LIST = WORKSPACE_TYPES;

export function WorkspaceTypePicker({
  value,
  onChange,
}: {
  value: ProjectTemplate;
  onChange: (value: ProjectTemplate) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-text-secondary">Workspace type</label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {WORKSPACE_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={clsx(
              "flex cursor-pointer items-start justify-between rounded-[3px] border p-3 text-left transition-all",
              value === t.id
                ? "border-primary bg-primary-bg"
                : "border-border-light hover:border-border hover:bg-bg-light"
            )}
          >
            <div>
              <div className="text-sm font-semibold text-text">{t.name}</div>
              <div className="mt-0.5 text-xs text-text-tertiary">{t.desc}</div>
            </div>
            {value === t.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}