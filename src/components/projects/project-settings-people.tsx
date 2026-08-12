"use client";

import { useState, useMemo } from "react";
import type { Project } from "@/store/projectApi";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { useGetProjectRolesQuery, useAddMemberToProjectRoleMutation, useRemoveMemberFromProjectRoleMutation } from "@/store/permissionApi";
import { Search, X, UserPlus, MoreHorizontal, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function ProjectSettingsPeople({ project }: { project: Project }) {
  const { data: members, isLoading } = useGetMembersQuery(project.workspaceId);
  const { data: roles } = useGetProjectRolesQuery(project.id);
  const [addMember] = useAddMemberToProjectRoleMutation();
  const [removeMember] = useRemoveMemberFromProjectRoleMutation();

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = search.toLowerCase();
    return members.filter((m) => {
      const name = m.user?.name?.toLowerCase() || "";
      const email = m.user?.email?.toLowerCase() || "";
      return name.includes(q) || email.includes(q);
    });
  }, [members, search]);

  function getMemberRoles(userId: string) {
    if (!roles) return [];
    return roles.filter((r) => r.members.some((m) => m.userId === userId));
  }

  async function handleAddMember() {
    if (!selectedUserId || !selectedRoleId) return;
    await addMember({ roleId: selectedRoleId, userId: selectedUserId });
    setSelectedUserId(null);
    setSelectedRoleId("");
    setShowAdd(false);
  }

  async function handleRemoveMember(roleId: string, userId: string) {
    if (!confirm("Remove this member from the role?")) return;
    await removeMember({ roleId, userId });
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#121C28]">People / Access</h2>
          <p className="text-sm text-[#737686]">Manage who has access to this project and their roles</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <UserPlus className="h-4 w-4 mr-1" />
          Add member
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737686]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full rounded-lg border border-[#C3C6D7] bg-white py-2 pl-9 pr-3 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[#F8F9FF]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-16 text-center">
          <Shield className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <h3 className="text-base font-semibold text-[#121C28]">No members found</h3>
          <p className="mt-1 text-sm text-[#737686]">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((member) => {
            const memberRoles = getMemberRoles(member.userId);
            return (
              <div key={member.id} className="flex items-center justify-between rounded-lg border border-[#C3C6D7]/20 bg-white p-3 transition-colors hover:border-[#C3C6D7]/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
                    {member.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#121C28] truncate">{member.user?.name || "Unknown"}</p>
                    <p className="text-xs text-[#737686] truncate">{member.user?.email || ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {memberRoles.length > 0 ? (
                    memberRoles.map((r) => (
                      <span key={r._id} className="flex items-center gap-1 rounded-full bg-[#F0F4FF] px-2.5 py-1 text-[11px] font-medium text-[#2563EB]">
                        {r.name}
                        <button
                          onClick={() => handleRemoveMember(r._id, member.userId)}
                          className="ml-0.5 text-[#737686] hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#737686]">No project roles</span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedUserId(member.userId);
                      setSelectedRoleId("");
                      setShowAdd(true);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onClose={() => { setShowAdd(false); setSelectedUserId(null); }} title="Add member to project">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#434655]">Member</label>
            <select
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className="mt-1 w-full rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">Select a member...</option>
              {members?.filter((m) => !getMemberRoles(m.userId).some((r) => r._id === selectedRoleId)).map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#434655]">Project role</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">Select a role...</option>
              {roles?.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowAdd(false); setSelectedUserId(null); }}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={!selectedUserId || !selectedRoleId}>
              <UserPlus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
