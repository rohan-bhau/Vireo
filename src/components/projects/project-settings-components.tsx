"use client";

import { useState } from "react";
import type { Project } from "@/store/projectApi";
import { useGetProjectComponentsQuery, useCreateComponentMutation, useUpdateComponentMutation, useDeleteComponentMutation, type Component } from "@/store/componentApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { Plus, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProjectSettingsComponents({ project }: { project: Project }) {
  const { data: components, isLoading } = useGetProjectComponentsQuery(project.id);
  const { data: members } = useGetMembersQuery(project.workspaceId);
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
    await createComponent({ name: form.name.trim(), description: form.description || undefined, projectId: project.id, lead: form.lead || undefined, defaultAssignee: form.defaultAssignee || undefined });
    resetForm();
    setShowCreate(false);
  }

  async function handleUpdate(id: string) {
    await updateComponent({ id, data: { name: form.name || undefined, description: form.description || undefined, lead: form.lead || null, defaultAssignee: form.defaultAssignee || null } });
    setEditingId(null);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this component?")) return;
    await deleteComponent(id);
  }

  function startEdit(comp: Component) {
    setEditingId(comp._id);
    setForm({ name: comp.name, description: comp.description || "", lead: comp.lead || "", defaultAssignee: comp.defaultAssignee || "" });
  }

  function getUserName(userId: string): string {
    return members?.find((m) => m.userId === userId)?.user?.name || userId;
  }

  if (isLoading) {
    return <div className="text-sm text-[#737686] py-8 text-center">Loading components...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Components</h2>
          <p className="text-sm text-[#737686]">Manage project components and their leads</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="h-4 w-4 mr-1" />
          Create component
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Component name *" className="rounded-lg border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" autoFocus />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-lg border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            <select value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} className="rounded-lg border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
              <option value="">No lead</option>
              {members?.map((m) => (<option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>))}
            </select>
            <select value={form.defaultAssignee} onChange={(e) => setForm({ ...form, defaultAssignee: e.target.value })} className="rounded-lg border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
              <option value="">No default assignee</option>
              {members?.map((m) => (<option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={handleCreate} disabled={!form.name.trim()}>Create</Button>
            <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {(!components || components.length === 0) && !showCreate ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-24 text-center">
          <Puzzle className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <h3 className="text-base font-semibold text-[#121C28]">No components yet</h3>
          <p className="mt-1 text-sm text-[#737686]">Components are sub-areas of a project used for filtering and reporting</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#C3C6D7]/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-[#F8F9FF] text-left text-xs font-medium uppercase tracking-wider text-[#737686]">
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Lead</th>
                <th className="px-4 py-2.5">Default Assignee</th>
                <th className="px-4 py-2.5 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3C6D7]/10">
              {components?.map((comp) => (
                <tr key={comp._id} className="hover:bg-[#F8F9FF] transition-colors">
                  {editingId === comp._id ? (
                    <>
                      <td className="px-4 py-2">
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-[#C3C6D7] bg-white px-2 py-1 text-xs text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
                      </td>
                      <td className="px-4 py-2">
                        <select value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} className="w-full rounded-lg border border-[#C3C6D7] bg-white px-2 py-1 text-xs text-[#121C28] focus:outline-none">
                          <option value="">None</option>
                          {members?.map((m) => (<option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select value={form.defaultAssignee} onChange={(e) => setForm({ ...form, defaultAssignee: e.target.value })} className="w-full rounded-lg border border-[#C3C6D7] bg-white px-2 py-1 text-xs text-[#121C28] focus:outline-none">
                          <option value="">None</option>
                          {members?.map((m) => (<option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleUpdate(comp._id)} className="text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8]">Save</button>
                          <button onClick={() => { setEditingId(null); resetForm(); }} className="text-xs text-[#737686] hover:text-[#121C28]">Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 text-[#121C28] font-medium">{comp.name}</td>
                      <td className="px-4 py-2.5 text-[#737686]">{comp.lead ? getUserName(comp.lead) : "-"}</td>
                      <td className="px-4 py-2.5 text-[#737686]">{comp.defaultAssignee ? getUserName(comp.defaultAssignee) : "-"}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(comp)} className="text-xs text-[#2563EB] hover:text-[#1d4ed8]">Edit</button>
                          <button onClick={() => handleDelete(comp._id)} className="text-xs text-[#FF5630] hover:text-[#d94a2c]">Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
