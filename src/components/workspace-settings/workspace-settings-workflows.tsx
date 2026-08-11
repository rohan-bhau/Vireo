"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useGetWorkspaceWorkflowsQuery,
  useUpdateWorkflowMutation,
  type WorkflowStatus,
  type WorkflowTransition,
} from "@/store/workflowApi";
import { useGetSubscriptionQuery } from "@/store/billingApi";
import { hasFeature } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowDown, ArrowUp, Plus, GitBranch, Loader2 } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { clsx } from "clsx";
import { SkeletonSettingsPage } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<WorkflowStatus["category"], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_COLORS = ["#6B7280", "#2563EB", "#F59E0B", "#10B981", "#7C3AED", "#DB2777", "#DC2626", "#0D9488"];

export function WorkspaceSettingsWorkflows() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { data: workflows = [], isLoading } = useGetWorkspaceWorkflowsQuery(workspaceId);
  const [updateWorkflow, { isLoading: saving }] = useUpdateWorkflowMutation();

  const { data: subscription } = useGetSubscriptionQuery(workspaceId, { skip: !workspaceId });
  const canEditWorkflows = hasFeature(subscription?.plan, "customWorkflows");

  const [selectedId, setSelectedId] = useState<string>("");
  const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [defaultStatus, setDefaultStatus] = useState<string>("");
  const [lastSynced, setLastSynced] = useState<string>("");

  const selected = workflows.find((w) => w._id === selectedId) || workflows[0];

  if (selected && lastSynced !== selected._id) {
    setLastSynced(selected._id);
    setSelectedId(selected._id);
    setStatuses(cloneStatuses(selected.statuses));
    setTransitions(cloneTransitions(selected.transitions));
    setDefaultStatus(selected.defaultStatus);
  }

  const [showAddStatus, setShowAddStatus] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState(STATUS_COLORS[0]);
  const [newStatusCategory, setNewStatusCategory] = useState<WorkflowStatus["category"]>("todo");
  const [newStatusError, setNewStatusError] = useState<string | null>(null);

  if (isLoading) {
    return <SkeletonSettingsPage />;
  }

  if (workflows.length === 0) {
    return (
      <div className="rounded-xl border border-border-light bg-surface">
        <EmptyState
          icon={<GitBranch className="h-8 w-8" />}
          title="No workflows yet"
          message="Workflows define the statuses and transitions available to issues in this workspace."
        />
      </div>
    );
  }

  function moveStatus(index: number, dir: -1 | 1) {
    setStatuses((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, position: i }));
    });
  }

  function updateStatus(index: number, patch: Partial<WorkflowStatus>) {
    setStatuses((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeStatus(index: number) {
    const name = statuses[index].name;
    setStatuses((prev) => prev.map((s, i) => ({ ...s, position: i })).filter((s, i) => i !== index));
    setTransitions((prev) => prev.filter((t) => t.from !== name && t.to !== name));
  }

  function toggleTransition(from: string, to: string) {
    setTransitions((prev) => {
      const existing = prev.find((t) => t.from === from && t.to === to);
      if (existing) return prev.filter((t) => t !== existing);
      const name = `Move from ${from} to ${to}`;
      return [...prev, { from, to, name, conditions: [], validators: [], postFunctions: [] }];
    });
  }

  function handleAddStatus() {
    const name = newStatusName.trim();
    if (!name) {
      setNewStatusError("Status name is required");
      return;
    }
    if (statuses.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setNewStatusError("A status with this name already exists");
      return;
    }
    setStatuses((prev) => [
      ...prev.map((s) => ({ ...s, position: s.position })),
      { name, color: newStatusColor, position: prev.length, category: newStatusCategory },
    ]);
    setNewStatusName("");
    setNewStatusError(null);
    setShowAddStatus(false);
  }

  async function handleSave() {
    if (!selected) return;
    if (statuses.length < 2) {
      toastError("A workflow needs at least two statuses");
      return;
    }
    try {
      await updateWorkflow({
        id: selected._id,
        data: { statuses, transitions, defaultStatus },
      }).unwrap();
      toastSuccess("Workflow saved");
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not save workflow");
    }
  }

  return (
    <div className="space-y-6">
      {!canEditWorkflows && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Custom workflows are a Pro feature. Your workspace is on the Free plan, so
            workflows are view-only.
          </p>
          <Link
            href={`/w/${workspaceId}/settings/billing`}
            className="shrink-0 font-semibold text-[#2563EB] hover:text-[#004AC6] transition-colors"
          >
            Upgrade to edit
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Workflows</h2>
          <p className="mt-0.5 text-sm text-text-secondary">Manage statuses and allowed transitions for issues.</p>
        </div>
        <select
          value={selected._id}
          onChange={(e) => {
            const wf = workflows.find((w) => w._id === e.target.value);
            if (!wf) return;
            setSelectedId(wf._id);
            setStatuses(cloneStatuses(wf.statuses));
            setTransitions(cloneTransitions(wf.transitions));
            setDefaultStatus(wf.defaultStatus);
            setLastSynced(wf._id);
          }}
          className="rounded-[3px] border border-border-light bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        >
          {workflows.map((wf) => (
            <option key={wf._id} value={wf._id}>{wf.name}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-border-light bg-surface">
        <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
              <GitBranch className="h-4 w-4 text-text-tertiary" /> Statuses
            </h3>
            <p className="mt-0.5 text-xs text-text-tertiary">Drag-order via arrows, edit name or color inline.</p>
          </div>
          <Button variant="outline" size="sm" disabled={!canEditWorkflows} onClick={() => { setNewStatusError(null); setShowAddStatus(true); }}>
            <Plus className="h-3.5 w-3.5" /> Add status
          </Button>
        </div>
        <ul className="divide-y divide-border-light">
          {statuses.map((status, index) => (
            <li key={status.name + index} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className="flex items-center gap-1">
                <button type="button" onClick={() => moveStatus(index, -1)} disabled={index === 0} className="rounded p-1 text-text-tertiary hover:bg-bg-light hover:text-text disabled:opacity-30">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => moveStatus(index, 1)} disabled={index === statuses.length - 1} className="rounded p-1 text-text-tertiary hover:bg-bg-light hover:text-text disabled:opacity-30">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </span>
              <input type="color" value={status.color} onChange={(e) => updateStatus(index, { color: e.target.value })} className="h-6 w-9 cursor-pointer rounded border border-border-light bg-transparent" title="Status color" />
              <input
                value={status.name}
                onChange={(e) => updateStatus(index, { name: e.target.value })}
                className="min-w-0 flex-1 rounded-[3px] border border-transparent px-2 py-1 text-sm font-medium text-text hover:border-border-light focus:border-primary focus:outline-none"
              />
              <select
                value={status.category}
                onChange={(e) => updateStatus(index, { category: e.target.value as WorkflowStatus["category"] })}
                className="rounded-[3px] border border-border-light bg-surface px-2 py-1 text-xs text-text-secondary focus:border-primary focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-text-tertiary">
                <input type="radio" checked={defaultStatus === status.name} onChange={() => setDefaultStatus(status.name)} className="h-3.5 w-3.5 accent-primary" />
                Default
              </label>
              <button
                type="button"
                onClick={() => removeStatus(index)}
                className="rounded p-1 text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                title="Remove status"
              >
                <span className="text-sm leading-none">×</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface">
        <div className="border-b border-border-light px-5 py-3">
          <h3 className="text-sm font-semibold text-text">Transitions</h3>
          <p className="mt-0.5 text-xs text-text-tertiary">Check a cell to allow moving from the row status to the column status.</p>
        </div>
        <table className="w-full min-w-[560px] table-fixed">
          <thead>
            <tr className="border-b border-border-light bg-bg-light/60">
              <th className="w-32 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">From → To</th>
              {statuses.map((s) => (
                <th key={s.name} className="px-2 py-2.5 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {statuses.map((fromStatus) => (
              <tr key={fromStatus.name}>
                <td className="px-3 py-2 text-xs font-medium text-text">{fromStatus.name}</td>
                {statuses.map((toStatus) => {
                  const checked = transitions.some((t) => t.from === fromStatus.name && t.to === toStatus.name);
                  const disabled = fromStatus.name === toStatus.name;
                  return (
                    <td key={toStatus.name} className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleTransition(fromStatus.name, toStatus.name)}
                        className="h-4 w-4 cursor-pointer accent-[#2563EB] disabled:opacity-30"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} isLoading={saving} disabled={!canEditWorkflows}>Save changes</Button>
        {saving && <Loader2 className="h-4 w-4 animate-spin text-text-tertiary" />}
      </div>

      <Dialog open={showAddStatus} onClose={() => setShowAddStatus(false)} title="Add status" className="max-w-sm">
        <div className="space-y-4">
          <Input
            label="Status name"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            placeholder="Blocked"
            error={newStatusError || undefined}
            autoFocus
          />
          <div>
            <label className="text-xs font-semibold text-text-secondary">Color</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {STATUS_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewStatusColor(color)}
                  className={clsx("h-7 w-7 rounded-full transition-transform hover:scale-110", newStatusColor === color && "ring-2 ring-primary ring-offset-2")}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary">Category</label>
            <select
              value={newStatusCategory}
              onChange={(e) => setNewStatusCategory(e.target.value as WorkflowStatus["category"])}
              className="mt-1.5 w-full rounded-[3px] border border-border-light bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            >
              {(["todo", "in_progress", "done"] as const).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddStatus(false)}>Cancel</Button>
            <Button onClick={handleAddStatus}><Plus className="mr-1.5 h-4 w-4" /> Add status</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function cloneStatuses(s: WorkflowStatus[]): WorkflowStatus[] {
  return s.map((x) => ({ ...x }));
}

function cloneTransitions(t: WorkflowTransition[]): WorkflowTransition[] {
  return t.map((x) => ({ ...x, conditions: [...x.conditions], validators: [...x.validators], postFunctions: [...x.postFunctions] }));
}