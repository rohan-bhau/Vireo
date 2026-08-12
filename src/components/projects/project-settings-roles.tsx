"use client";

import { useState } from "react";
import type { Project } from "@/store/projectApi";
import { useGetProjectRolesQuery, useCreateProjectRoleMutation, useDeleteProjectRoleMutation, useAddMemberToProjectRoleMutation, useRemoveMemberFromProjectRoleMutation } from "@/store/permissionApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { Plus, Trash2, Shield, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProjectSettingsRoles({ project }: { project: Project }) {
  const { data: roles, isLoading } = useGetProjectRolesQuery(project.id);
  const { data: members } = useGetMembersQuery(project.workspaceId);
  const [createRole] = useCreateProjectRoleMutation();
  const [deleteRole] = useDeleteProjectRoleMutation();
  const [addMember] = useAddMemberToProjectRoleMutation();
  const [removeMember] = useRemoveMemberFromProjectRoleMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  async function handleCreate() {
    if (!newName.trim()) return;
    await createRole({ projectId: project.id, workspaceId: project.workspaceId, name: newName.trim(), description: newDescription.trim() || undefined });
    setNewName("");
    setNewDescription("");
    setShowCreate(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this role? Roles with members cannot be deleted.")) return;
    await deleteRole(id);
  }

  async function handleAddMemberToRole(roleId: string) {
    if (!selectedUserId) return;
    await addMember({ roleId, userId: selectedUserId });
    setSelectedUserId("");
    setShowAddMember(null);
  }

  async function handleRemoveMemberFromRole(roleId: string, userId: string) {
    await removeMember({ roleId, userId });
  }

  function getUserName(userId: string): string {
    return members?.find((m) => m.userId === userId)?.user?.name || userId;
  }

  function getUserEmail(userId: string): string {
    return members?.find((m) => m.userId === userId)?.user?.email || "";
  }

  const availableMembers = (roleId: string) => {
    const role = roles?.find((r) => r._id === roleId);
    if (!role) return members || [];
    const memberIds = new Set(role.members.map((m) => m.userId));
    return (members || []).filter((m) => !memberIds.has(m.userId));
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">Roles</h2>
          <p className="text-sm text-[#737686]">Define project roles and their members</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create role
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-[#C3C6D7]/20 bg-white p-4">
          <div className="space-y-3">
            <Input label="Role name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Developer" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]">Description</label>
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[#F8F9FF]" />
          ))}
        </div>
      ) : roles && roles.length > 0 ? (
        <div className="space-y-2">
          {roles.map((role) => {
            const isExpanded = expandedRole === role._id;
            return (
              <div key={role._id} className="rounded-lg border border-[#C3C6D7]/20 bg-white overflow-hidden">
                <button
                  onClick={() => setExpandedRole(isExpanded ? null : role._id)}
                  className="flex w-full items-center justify-between px-4 py-3 hover:bg-[#F8F9FF] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-[#737686]" />
                    <div>
                      <p className="text-sm font-medium text-[#121C28]">{role.name}</p>
                      <p className="text-xs text-[#737686]">{role.members.length} member{role.members.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!role.isSystem && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(role._id); }}
                        disabled={role.members.length > 0}
                        className="flex h-7 w-7 items-center justify-center rounded text-[#737686] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                        title={role.members.length > 0 ? "Cannot delete a role with members" : "Delete role"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <ChevronRight className={`h-4 w-4 text-[#737686] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-[#C3C6D7]/10 px-4 py-3">
                    {role.members.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {role.members.map((m) => (
                          <div key={m.userId} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-[#F8F9FF] transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-semibold text-white">
                                {getUserName(m.userId).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-[#121C28]">{getUserName(m.userId)}</p>
                                <p className="text-[10px] text-[#737686]">{getUserEmail(m.userId)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMemberFromRole(role._id, m.userId)}
                              className="flex h-6 w-6 items-center justify-center rounded text-[#C3C6D7] hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {showAddMember === role._id ? (
                      <div className="flex items-center gap-2">
                        <select
                          autoFocus
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="flex-1 rounded-lg border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        >
                          <option value="">Select member...</option>
                          {availableMembers(role._id).map((m) => (
                            <option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>
                          ))}
                        </select>
                        <Button size="sm" onClick={() => handleAddMemberToRole(role._id)} disabled={!selectedUserId}>Add</Button>
                        <Button size="sm" variant="outline" onClick={() => { setShowAddMember(null); setSelectedUserId(""); }}>Cancel</Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddMember(role._id)}
                        className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add member
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-16 text-center">
          <Shield className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <h3 className="text-base font-semibold text-[#121C28]">No roles yet</h3>
          <p className="mt-1 text-sm text-[#737686]">Create roles to organize how people interact with the project</p>
        </div>
      )}
    </div>
  );
}
