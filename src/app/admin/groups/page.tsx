"use client";

import { useState } from "react";
import { useGetAdminGroupsQuery, useCreateAdminGroupMutation, useDeleteAdminGroupMutation } from "@/store/adminApi";
import { useGetWorkspacesQuery } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Plus, Trash2, UserPlus, Users, X } from "lucide-react";

export default function AdminGroupsPage() {
  const { data: groups = [], isLoading } = useGetAdminGroupsQuery();
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateAdminGroupMutation();
  const [deleteGroup] = useDeleteAdminGroupMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [selectedWs, setSelectedWs] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const wsMap = new Map(workspaces.map((w) => [w.id, w.name]));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!groupName.trim() || !selectedWs) { setCreateError("Name and workspace are required"); return; }
    try {
      await createGroup({ name: groupName.trim(), description: groupDesc.trim() || undefined, workspaceId: selectedWs }).unwrap();
      setShowCreate(false);
      setGroupName("");
      setGroupDesc("");
      setSelectedWs("");
    } catch (err: any) { setCreateError(err?.data?.message || "Failed"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this group?")) return;
    try { await deleteGroup(id).unwrap(); } catch {}
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#121C28]">Groups</h1>
          <p className="mt-1 text-sm text-[#737686]">Create and manage user groups across workspaces.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="mr-1.5 h-4 w-4" /> Create Group</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Users className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">No groups created yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group._id} className="rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpanded((p) => ({ ...p, [group._id]: !p[group._id] }))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#004AC6]"
                  >
                    <Users className="h-4 w-4" />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-[#121C28]">{group.name}</p>
                    <p className="text-xs text-[#737686]">
                      {wsMap.get(group.workspaceId) || group.workspaceId.slice(0, 8)} &middot; {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                    </p>
                    {group.description && <p className="mt-0.5 text-xs text-[#737686]">{group.description}</p>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(group._id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              {expanded[group._id] && group.members.length > 0 && (
                <div className="border-t border-[#C3C6D7]/10 px-5 py-3">
                  <p className="mb-2 text-xs font-semibold text-[#737686] uppercase tracking-wider">Members</p>
                  <div className="flex flex-wrap gap-2">
                    {group.members.map((m) => (
                      <span key={m.userId} className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F0F5] px-2.5 py-1 text-[11px] text-[#434655]">
                        {m.userId.slice(0, 8)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Group">
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{createError}</div>}
          <Input label="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} required placeholder="e.g. Engineering" />
          <Input label="Description (optional)" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Workspace</label>
            <select
              value={selectedWs}
              onChange={(e) => setSelectedWs(e.target.value)}
              className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2.5 text-sm text-[#121C28] focus:border-[#2563EB] focus:outline-none"
              required
            >
              <option value="">Select workspace...</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
