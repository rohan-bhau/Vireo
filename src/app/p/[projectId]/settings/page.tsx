"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import { useGetProjectWorkflowsQuery, useCreateWorkflowMutation, useUpdateWorkflowMutation, useDeleteWorkflowMutation, useSeedWorkflowMutation } from "@/store/workflowApi";
import type { WorkflowStatus, WorkflowTransition } from "@/store/workflowApi";
import { clsx } from "clsx";

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project } = useGetProjectQuery(projectId);
  const { data: workflows = [], isLoading } = useGetProjectWorkflowsQuery(projectId);
  const [createWorkflow] = useCreateWorkflowMutation();
  const [updateWorkflow] = useUpdateWorkflowMutation();
  const [deleteWorkflow] = useDeleteWorkflowMutation();
  const [seedWorkflow] = useSeedWorkflowMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  async function handleSeed() {
    if (!project) return;
    await seedWorkflow({ projectId, workspaceId: project.workspaceId });
  }

  async function handleCreate() {
    if (!newName.trim() || !project) return;
    await createWorkflow({
      name: newName.trim(),
      projectId,
      workspaceId: project.workspaceId,
      statuses: [{ name: "Todo", color: "#6B7280", position: 0 }],
      defaultStatus: "Todo",
    });
    setNewName("");
    setShowCreate(false);
  }

  if (isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center">
      <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Workflows</h2>
          <p className="text-sm text-[#737686]">Manage task status workflows for this project</p>
        </div>
        <div className="flex gap-2">
          {workflows.length === 0 && (
            <button onClick={handleSeed}
              className="rounded-lg border border-[#C3C6D7] bg-white px-4 py-2 text-sm font-medium text-[#434655] hover:bg-[#F1F2F6] transition-colors">
              Create default workflow
            </button>
          )}
          <button onClick={() => setShowCreate(true)}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors">
            New workflow
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-[#C3C6D7]/20 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <input autoFocus placeholder="Workflow name" value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
            className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] mb-3" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]">Create</button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-[#C3C6D7] px-4 py-2 text-sm text-[#434655] hover:bg-[#F1F2F6]">Cancel</button>
          </div>
        </div>
      )}

      {workflows.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-16 text-center">
          <svg className="mb-3 h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
          </svg>
          <h3 className="text-base font-semibold text-[#121C28]">No workflows yet</h3>
          <p className="mt-1 text-sm text-[#737686]">Create a workflow to define custom task statuses</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((wf) => (
            <WorkflowEditor
              key={wf._id}
              workflow={wf}
              isEditing={editingId === wf._id}
              onStartEdit={() => setEditingId(wf._id)}
              onSave={async (data) => {
                await updateWorkflow({ id: wf._id, data });
                setEditingId(null);
              }}
              onDelete={async () => {
                await deleteWorkflow(wf._id);
              }}
              onCancel={() => setEditingId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkflowEditor({
  workflow,
  isEditing,
  onStartEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  workflow: any;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}) {
  const [statuses, setStatuses] = useState<WorkflowStatus[]>(workflow.statuses || []);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>(workflow.transitions || []);
  const [defaultStatus, setDefaultStatus] = useState(workflow.defaultStatus);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#6B7280");
  const [showAddTransition, setShowAddTransition] = useState(false);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [saving, setSaving] = useState(false);

  function addStatus() {
    if (!newStatusName.trim()) return;
    setStatuses([...statuses, { name: newStatusName.trim(), color: newStatusColor, position: statuses.length }]);
    setNewStatusName("");
    setNewStatusColor("#6B7280");
    setShowAddStatus(false);
  }

  function removeStatus(name: string) {
    setStatuses(statuses.filter((s) => s.name !== name));
    setTransitions(transitions.filter((t) => t.from !== name && t.to !== name));
    if (defaultStatus === name) setDefaultStatus(statuses[0]?.name || "Todo");
  }

  function addTransition() {
    if (!newFrom || !newTo) return;
    setTransitions([...transitions, { from: newFrom, to: newTo, name: `${newFrom} → ${newTo}` }]);
    setNewFrom("");
    setNewTo("");
    setShowAddTransition(false);
  }

  function removeTransition(idx: number) {
    setTransitions(transitions.filter((_, i) => i !== idx));
  }

  function updateStatusColor(name: string, color: string) {
    setStatuses(statuses.map((s) => s.name === name ? { ...s, color } : s));
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ statuses, transitions, defaultStatus });
    setSaving(false);
  }

  return (
    <div className="rounded-xl border border-[#C3C6D7]/20 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-[#C3C6D7]/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[#121C28]">{workflow.name}</h3>
          {workflow.isDefault && (
            <span className="rounded-md bg-[#DBEAFE] px-2 py-0.5 text-xs font-medium text-[#2563EB]">Default</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button onClick={onStartEdit} className="rounded-lg px-3 py-1.5 text-sm text-[#434655] hover:bg-[#F1F2F6] transition-colors">Edit</button>
              {!workflow.isDefault && (
                <button onClick={onDelete} className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors">Delete</button>
              )}
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving}
                className="rounded-lg bg-[#2563EB] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={onCancel} className="rounded-lg border border-[#C3C6D7] px-4 py-1.5 text-sm text-[#434655] hover:bg-[#F1F2F6] transition-colors">Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#121C28]">Statuses</h4>
            {isEditing && (
              <button onClick={() => setShowAddStatus(true)} className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]">+ Add status</button>
            )}
          </div>
          {showAddStatus && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-3">
              <input placeholder="Status name" value={newStatusName} onChange={(e) => setNewStatusName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addStatus(); }}
                className="flex-1 rounded-lg border border-[#C3C6D7] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
              <input type="color" value={newStatusColor} onChange={(e) => setNewStatusColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border border-[#C3C6D7]" />
              <button onClick={addStatus} className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white">Add</button>
              <button onClick={() => setShowAddStatus(false)} className="text-xs text-[#737686]">Cancel</button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <div key={s.name} className="flex items-center gap-2 rounded-lg border border-[#C3C6D7]/20 px-3 py-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                {isEditing ? (
                  <>
                    <span className="text-sm font-medium text-[#121C28]">{s.name}</span>
                    <input type="color" value={s.color} onChange={(e) => updateStatusColor(s.name, e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer border border-[#C3C6D7]" />
                    <select value={defaultStatus === s.name ? "default" : ""} onChange={(e) => { if (e.target.value === "default") setDefaultStatus(s.name); }}
                      className="rounded border border-[#C3C6D7] px-1 py-0.5 text-xs">
                      <option value="">Set as default</option>
                      {defaultStatus !== s.name && <option value="default">Make default</option>}
                    </select>
                    <button onClick={() => removeStatus(s.name)} className="text-[#C3C6D7] hover:text-red-500">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-[#121C28]">{s.name}</span>
                    {defaultStatus === s.name && <span className="text-xs text-[#737686]">(default)</span>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#121C28]">Transitions</h4>
            {isEditing && (
              <button onClick={() => setShowAddTransition(true)} className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]">+ Add transition</button>
            )}
          </div>
          {showAddTransition && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-3">
              <select value={newFrom} onChange={(e) => setNewFrom(e.target.value)} className="rounded-lg border border-[#C3C6D7] px-3 py-1.5 text-sm">
                <option value="">From...</option>
                {statuses.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              <span className="text-[#737686]">→</span>
              <select value={newTo} onChange={(e) => setNewTo(e.target.value)} className="rounded-lg border border-[#C3C6D7] px-3 py-1.5 text-sm">
                <option value="">To...</option>
                {statuses.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              <button onClick={addTransition} className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white">Add</button>
              <button onClick={() => setShowAddTransition(false)} className="text-xs text-[#737686]">Cancel</button>
            </div>
          )}
          {transitions.length === 0 ? (
            <p className="text-sm text-[#C3C6D7]">No transitions defined</p>
          ) : (
            <div className="space-y-1">
              {transitions.map((t, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#434655] hover:bg-[#F8F9FF]">
                  <span className="font-medium">{t.from}</span>
                  <svg className="h-4 w-4 text-[#737686]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium">{t.to}</span>
                  {isEditing && (
                    <button onClick={() => removeTransition(i)} className="ml-auto text-[#C3C6D7] hover:text-red-500">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
