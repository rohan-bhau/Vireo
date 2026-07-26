"use client";

import { useState } from "react";
import type { Workflow, WorkflowScheme, WorkflowSchemeMapping } from "@/store/workflowApi";

const ISSUE_TYPES = [
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "story", label: "Story" },
  { value: "epic", label: "Epic" },
  { value: "subtask", label: "Subtask" },
];

interface WorkflowSchemeEditorProps {
  schemes: WorkflowScheme[];
  workflows: Workflow[];
  projectId: string;
  workspaceId: string;
  onCreate: (data: {
    name: string;
    projectId: string;
    workspaceId: string;
    description?: string;
    mappings: WorkflowSchemeMapping[];
    defaultWorkflowId: string;
  }) => Promise<void>;
  onUpdate: (id: string, data: Partial<WorkflowScheme>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function WorkflowSchemeEditor({ schemes, workflows, projectId, workspaceId, onCreate, onUpdate, onDelete }: WorkflowSchemeEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultWorkflowId, setDefaultWorkflowId] = useState("");
  const [mappings, setMappings] = useState<WorkflowSchemeMapping[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const activeScheme = schemes[0];

  function resetForm() {
    setName("");
    setDescription("");
    setDefaultWorkflowId(workflows.find((w) => w.isDefault)?._id || workflows[0]?._id || "");
    setMappings([]);
  }

  function addMapping() {
    const unusedType = ISSUE_TYPES.find((t) => !mappings.find((m) => m.issueType === t.value));
    if (unusedType && workflows.length > 0) {
      setMappings([...mappings, { issueType: unusedType.value, workflowId: workflows[0]._id }]);
    }
  }

  function updateMapping(index: number, updates: Partial<WorkflowSchemeMapping>) {
    setMappings(mappings.map((m, i) => i === index ? { ...m, ...updates } : m));
  }

  function removeMapping(index: number) {
    setMappings(mappings.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim() || !defaultWorkflowId) return;
    setSaving(true);
    try {
      if (editingId) {
        await onUpdate(editingId, { name: name.trim(), description: description.trim() || undefined, mappings, defaultWorkflowId });
      } else if (activeScheme) {
        await onUpdate(activeScheme._id, { name: name.trim(), description: description.trim() || undefined, mappings, defaultWorkflowId });
      } else {
        await onCreate({ name: name.trim(), projectId, workspaceId, description: description.trim() || undefined, mappings, defaultWorkflowId });
      }
      setEditingId(null);
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (!showCreate && !editingId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[#121C28]">Workflow Scheme</h4>
            <p className="text-xs text-[#737686]">Map issue types to workflows</p>
          </div>
          <button onClick={() => { if (activeScheme) { setName(activeScheme.name); setDescription(activeScheme.description || ""); setDefaultWorkflowId(activeScheme.defaultWorkflowId); setMappings(activeScheme.mappings || []); } else { resetForm(); } setShowCreate(true); }}
            className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1D4ED8] transition-colors">
            {activeScheme ? "Edit Scheme" : "Create Scheme"}
          </button>
        </div>

        {activeScheme ? (
          <div className="rounded-xl border border-[#C3C6D7]/20 bg-white">
            <div className="border-b border-[#C3C6D7]/20 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#121C28]">{activeScheme.name}</span>
                {activeScheme.description && <span className="text-xs text-[#737686]">{activeScheme.description}</span>}
              </div>
            </div>
            <div className="divide-y divide-[#C3C6D7]/20">
              {ISSUE_TYPES.map((it) => {
                const mapping = activeScheme.mappings.find((m) => m.issueType === it.value);
                const wf = mapping ? workflows.find((w) => w._id === mapping.workflowId) : null;
                const wf2 = !mapping ? workflows.find((w) => w._id === activeScheme.defaultWorkflowId) : null;
                return (
                  <div key={it.value} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm font-medium text-[#434655]">{it.label}</span>
                    <span className="text-xs text-[#737686]">
                      {mapping ? (wf?.name || "Unknown") : `→ ${wf2?.name || "Default"} (inherited)`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-8 text-center">
            <p className="text-sm text-[#737686]">No workflow scheme configured — all issue types use the default workflow</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#C3C6D7]/20 bg-white p-4">
      <h4 className="text-sm font-semibold text-[#121C28]">{activeScheme ? "Edit Workflow Scheme" : "Create Workflow Scheme"}</h4>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#434655]">Scheme name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Standard Scheme"
            className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#434655]">Description (optional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this scheme for?"
            className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#434655]">Default workflow</label>
          <p className="mb-1 text-[10px] text-[#737686]">Used for issue types without a specific mapping</p>
          <select value={defaultWorkflowId} onChange={(e) => setDefaultWorkflowId(e.target.value)}
            className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28]">
            <option value="">Select workflow...</option>
            {workflows.map((w) => <option key={w._id} value={w._id}>{w.name} {w.isDefault ? "(Default)" : ""}</option>)}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-[#434655]">Issue type mappings</label>
            <button onClick={addMapping} className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]">+ Add mapping</button>
          </div>
          {mappings.length === 0 ? (
            <p className="text-xs text-[#C3C6D7] italic">No custom mappings — all types use the default workflow</p>
          ) : (
            <div className="space-y-2">
              {mappings.map((m, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-2">
                  <select value={m.issueType} onChange={(e) => updateMapping(i, { issueType: e.target.value })}
                    className="flex-1 rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]">
                    {ISSUE_TYPES.filter((t) => !mappings.find((mm, mi) => mm.issueType === t.value && mi !== i) || m.issueType === t.value).map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-[#737686]">→</span>
                  <select value={m.workflowId} onChange={(e) => updateMapping(i, { workflowId: e.target.value })}
                    className="flex-1 rounded-lg border border-[#C3C6D7] px-2 py-1.5 text-xs text-[#434655]">
                    {workflows.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                  <button onClick={() => removeMapping(i)} className="text-[#C3C6D7] hover:text-red-500">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        {activeScheme && (
          <button onClick={() => setConfirmDelete(activeScheme._id)}
            className="rounded-lg px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
            Delete scheme
          </button>
        )}
        <div className="flex gap-2 ml-auto">
          <button onClick={() => { setShowCreate(false); setEditingId(null); setConfirmDelete(null); }}
            className="rounded-lg border border-[#C3C6D7] px-3 py-1.5 text-xs text-[#434655] hover:bg-[#F1F2F6] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !name.trim() || !defaultWorkflowId}
            className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="rounded-lg bg-red-50 p-3">
          <p className="mb-2 text-xs text-red-600">Delete this workflow scheme? Issue types will fall back to the default workflow.</p>
          <div className="flex gap-2">
            <button onClick={async () => { await onDelete(confirmDelete); setConfirmDelete(null); setShowCreate(false); }}
              className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600">Delete</button>
            <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-red-200 px-3 py-1 text-xs text-[#434655]">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
