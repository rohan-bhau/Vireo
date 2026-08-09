"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetWorkspaceProjectsQuery, useSetEnabledIssueTypesMutation } from "@/store/projectApi";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { Check, Server } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { clsx } from "clsx";

const ALL_ISSUE_TYPES = ["epic", "story", "task", "bug", "subtask"] as const;
type IssueTypeKey = (typeof ALL_ISSUE_TYPES)[number];

const ISSUE_TYPES: { key: IssueTypeKey; label: string; desc: string }[] = [
  { key: "epic", label: "Epic", desc: "A large body of work split into smaller stories" },
  { key: "story", label: "Story", desc: "A feature or user story broken down into tasks" },
  { key: "task", label: "Task", desc: "A unit of work that needs to be completed" },
  { key: "bug", label: "Bug", desc: "A problem or defect that impairs functionality" },
  { key: "subtask", label: "Sub-task", desc: "A smaller task under a parent issue" },
];

export function WorkspaceSettingsIssueTypes() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { data: projects = [], isLoading } = useGetWorkspaceProjectsQuery(workspaceId);
  const [setEnabled, { isLoading: saving }] = useSetEnabledIssueTypesMutation();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [enabled, setEnabledState] = useState<IssueTypeKey[]>([]);
  const [lastSynced, setLastSynced] = useState<string>("");

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  if (projects.length > 0 && selectedProject && lastSynced !== selectedProject.id) {
    setLastSynced(selectedProject.id);
    setSelectedProjectId(selectedProject.id);
    const current = selectedProject.enabledIssueTypes?.length
      ? selectedProject.enabledIssueTypes
      : (ALL_ISSUE_TYPES as unknown as string[]);
    setEnabledState(current as IssueTypeKey[]);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="rounded-xl border border-border-light bg-surface">
        <EmptyState
          icon={<Server className="h-8 w-8" />}
          title="No projects yet"
          message="Create a project before configuring issue types."
        />
      </div>
    );
  }

  function toggle(key: IssueTypeKey) {
    setEnabledState((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      return next;
    });
  }

  async function handleSave() {
    if (enabled.length === 0) {
      toastError("At least one issue type must remain enabled");
      return;
    }
    try {
      const isAll = ALL_ISSUE_TYPES.every((t) => enabled.includes(t));
      await setEnabled({
        workspaceId,
        projectId: selectedProject.id,
        enabledIssueTypes: isAll ? [] : enabled,
      }).unwrap();
      toastSuccess("Issue types updated");
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not update issue types");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Issue types</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            Choose which issue types can be created in <strong className="text-text">{selectedProject.name}</strong>. Disabled types are hidden from the Create Issue modal.
          </p>
        </div>
        <select
          value={selectedProject.id}
          onChange={(e) => {
            const project = projects.find((p) => p.id === e.target.value);
            if (!project) return;
            setSelectedProjectId(project.id);
            const current = project.enabledIssueTypes?.length
              ? project.enabledIssueTypes
              : (ALL_ISSUE_TYPES as unknown as string[]);
            setEnabledState(current as IssueTypeKey[]);
            setLastSynced(project.id);
          }}
          className="rounded-[3px] border border-border-light bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="divide-y divide-border-light overflow-hidden rounded-xl border border-border-light bg-surface">
        {ISSUE_TYPES.map((type) => {
          const isOn = enabled.includes(type.key);
          return (
            <div key={type.key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className={clsx("flex items-center gap-3")}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-light">
                  <Check className={clsx("h-4 w-4", isOn ? "text-primary" : "text-text-tertiary")} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">{type.label}</p>
                  <p className="text-xs text-text-tertiary">{type.desc}</p>
                </div>
              </div>
              <Switch
                checked={isOn}
                onChange={() => toggle(type.key)}
                disabled={isOn && enabled.length === 1}
                aria-label={`Toggle ${type.label}`}
              />
            </div>
          );
        })}
      </div>

      {enabled.length <= 1 && (
        <p className="text-xs text-text-tertiary">At least one issue type must stay enabled.</p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} isLoading={saving}>Save changes</Button>
        <span className="text-xs text-text-tertiary">
          Applies to the selected project and filters its Create Issue modal.
        </span>
      </div>
    </div>
  );
}