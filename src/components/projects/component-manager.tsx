"use client";

import { useState } from "react";
import {
  useGetProjectComponentsQuery,
  useCreateComponentMutation,
  useUpdateComponentMutation,
  useDeleteComponentMutation,
  type Component,
} from "@/store/componentApi";
import { useGetMembersQuery } from "@/store/workspaceApi";

interface ComponentManagerProps {
  projectId: string;
  workspaceId: string;
}

export function ComponentManager({ projectId, workspaceId }: ComponentManagerProps) {
  const { data: components, isLoading } = useGetProjectComponentsQuery(projectId);
  const { data: members } = useGetMembersQuery(workspaceId);
  const [createComponent] = useCreateComponentMutation();
  const [updateComponent] = useUpdateComponentMutation();
  const [deleteComponent] = useDeleteComponentMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", lead: "", defaultAssignee: "" });

  function resetForm() {
    setForm({ name: "", description: "", lead: "", defaultAssignee: "" });
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    await createComponent({
      name: form.name.trim(),
      description: form.description || undefined,
      projectId,
      lead: form.lead || undefined,
      defaultAssignee: form.defaultAssignee || undefined,
    });
    resetForm();
    setShowCreate(false);
  }

  async function handleUpdate(id: string) {
    await updateComponent({
      id,
      data: {
        name: form.name || undefined,
        description: form.description || undefined,
        lead: form.lead || null,
        defaultAssignee: form.defaultAssignee || null,
      },
    });
    setEditingId(null);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this component?")) return;
    await deleteComponent(id);
  }

  function startEdit(comp: Component) {
    setEditingId(comp._id);
    setForm({
      name: comp.name,
      description: comp.description || "",
      lead: comp.lead || "",
      defaultAssignee: comp.defaultAssignee || "",
    });
  }

  function getUserName(userId: string): string {
    return members?.find((m) => m.userId === userId)?.user?.name || userId;
  }

  if (isLoading) {
    return <div className="text-sm text-text-placeholder py-8 text-center">Loading components...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">Components ({components?.length || 0})</h2>
        <button
          onClick={() => { resetForm(); setShowCreate(true); }}
          className="rounded-[3px] bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition-colors"
        >
          + Create component
        </button>
      </div>

      {showCreate && (
        <div className="mb-4 rounded-[3px] border border-border-light bg-bg-light p-4">
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Component name *"
              className="rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              className="rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={form.lead}
              onChange={(e) => setForm({ ...form, lead: e.target.value })}
              className="rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">No lead</option>
              {members?.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>
              ))}
            </select>
            <select
              value={form.defaultAssignee}
              onChange={(e) => setForm({ ...form, defaultAssignee: e.target.value })}
              className="rounded-[3px] border border-border-input bg-surface px-2.5 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">No default assignee</option>
              {members?.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCreate}
              disabled={!form.name.trim()}
              className="rounded-[3px] bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-[3px] border border-border-light px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-light transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {(!components || components.length === 0) && !showCreate ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-light/30 py-24 text-center">
          <h3 className="text-base font-semibold text-text">No components yet</h3>
          <p className="mt-1 text-sm text-text-placeholder">Components are sub-areas of a project used for filtering and reporting</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[3px] border border-border-light">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-light text-left text-xs font-medium uppercase tracking-wider text-text-placeholder">
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Lead</th>
                <th className="px-4 py-2.5">Default Assignee</th>
                <th className="px-4 py-2.5 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {components?.map((comp) => (
                <tr key={comp._id} className="hover:bg-bg-light/50 transition-colors">
                  {editingId === comp._id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full rounded-[3px] border border-border-input bg-surface px-2 py-1 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={form.lead}
                          onChange={(e) => setForm({ ...form, lead: e.target.value })}
                          className="w-full rounded-[3px] border border-border-input bg-surface px-2 py-1 text-xs text-text focus:outline-none"
                        >
                          <option value="">None</option>
                          {members?.map((m) => (
                            <option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={form.defaultAssignee}
                          onChange={(e) => setForm({ ...form, defaultAssignee: e.target.value })}
                          className="w-full rounded-[3px] border border-border-input bg-surface px-2 py-1 text-xs text-text focus:outline-none"
                        >
                          <option value="">None</option>
                          {members?.map((m) => (
                            <option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleUpdate(comp._id)} className="text-xs font-medium text-primary hover:text-primary-dark">Save</button>
                          <button onClick={() => { setEditingId(null); resetForm(); }} className="text-xs text-text-placeholder hover:text-text-secondary">Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 text-text font-medium">{comp.name}</td>
                      <td className="px-4 py-2.5 text-text-secondary">{comp.lead ? getUserName(comp.lead) : "-"}</td>
                      <td className="px-4 py-2.5 text-text-secondary">{comp.defaultAssignee ? getUserName(comp.defaultAssignee) : "-"}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(comp)} className="text-xs text-primary hover:text-primary-dark">Edit</button>
                          <button onClick={() => handleDelete(comp._id)} className="text-xs text-danger hover:text-danger-dark">Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
