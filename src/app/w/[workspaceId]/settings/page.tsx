"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetWorkspaceQuery,
  useGetMembersQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useUpdateMemberRoleMutation,
  type Role,
  type WorkspaceMember,
} from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { WorkspaceTypePicker } from "@/components/workspace/workspace-type-picker";
import type { ProjectTemplate } from "@/store/projectApi";

type SettingsTab = "general" | "members" | "billing";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  EDIT: "Edit",
  VIEW: "View",
};

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: "bg-[#EEF4FF] text-[#004AC6]",
  EDIT: "bg-[#F0F0F5] text-[#737686]",
  VIEW: "bg-[#F5F3FF] text-[#6D28D9]",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN:
    "Full workspace management: settings, members, invites. Cannot delete the workspace or change admin roles.",
  EDIT:
    "Can create, edit, update, and delete tasks they created across projects. No access to workspace settings or member management.",
  VIEW:
    "Read-only access. Can view boards, tasks, and comments but cannot modify anything.",
};

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const isBillingPage = pathname?.endsWith("/settings/billing");

  const { data: workspace, isLoading } = useGetWorkspaceQuery(workspaceId);
  const { data: members = [] } = useGetMembersQuery(workspaceId);
  const [updateWorkspace, { isLoading: isUpdating }] = useUpdateWorkspaceMutation();
  const [deleteWorkspace, { isLoading: isDeleting }] = useDeleteWorkspaceMutation();
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [roleModalMember, setRoleModalMember] = useState<WorkspaceMember | null>(null);
  const [roleModalValue, setRoleModalValue] = useState<Role>("VIEW");
  const [roleModalSaving, setRoleModalSaving] = useState(false);

  async function handleChangeRole(memberUserId: string, role: Role) {
    setRoleLoading(memberUserId);
    try {
      await updateMemberRole({ workspaceId, userId: memberUserId, role }).unwrap();
      setRoleModalMember(null);
    } catch {
      // ignore; cache revalidation surfaces state
    } finally {
      setRoleLoading(null);
      setRoleModalSaving(false);
    }
  }

  function openRoleModal(member: WorkspaceMember) {
    setRoleModalMember(member);
    setRoleModalValue(member.role);
  }

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<ProjectTemplate>("KANBAN");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description || "");
      setTemplate(workspace.template || "KANBAN");
    }
  }, [workspace]);

  const currentMember = members.find((m) => m.userId === user?.id);
  const isAdmin = currentMember?.role === "ADMIN";
  const isOwner = workspace?.ownerId === user?.id;

  const canManageMember = (member: WorkspaceMember) => {
    if (member.userId === user?.id) return false;
    if (member.userId === workspace?.ownerId) return false;
    if (!isAdmin) return false;
    if (member.role === "ADMIN" && !isOwner) return false;
    return true;
  };

  const roleModalOptions = (): Role[] => {
    if (!roleModalMember) return [];
    if (isOwner) return ["ADMIN", "EDIT", "VIEW"];
    return ["EDIT", "VIEW"];
  };

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }
    try {
      await updateWorkspace({ workspaceId, name: name.trim(), description: description.trim() || undefined, template }).unwrap();
      setSuccess("Workspace updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to update workspace");
    }
  }

  async function handleDelete() {
    try {
      await deleteWorkspace(workspaceId).unwrap();
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.data?.message || "Failed to delete workspace");
      setShowDelete(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (members.length > 0 && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-[#737686]">Only workspace admins can access settings.</p>
        <Link href={`/w/${workspaceId}`}><Button variant="outline">Back to workspace</Button></Link>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-[#737686]">Workspace not found</p>
        <Link href="/dashboard"><Button variant="outline">Back to workspaces</Button></Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href={`/w/${workspaceId}`} className="font-medium text-[#737686] hover:text-[#121C28] transition-colors">
          {workspace.name}
        </Link>
        <span className="text-[#C3C6D7]">/</span>
        <span className="font-semibold text-[#121C28]">Settings</span>
      </div>
      <div className="flex gap-2 mb-6 border-b border-[#C3C6D7]/20 pb-4">
        {(["general", "members", "billing"] as const).map((tab) => {
          if (tab === "billing") {
            return (
              <Link
                key={tab}
                href={`/w/${workspaceId}/settings/billing`}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isBillingPage
                    ? "bg-[#EEF4FF] text-[#004AC6]"
                    : "text-[#434655] hover:bg-[#F8F9FF]"
                }`}
              >
                Plans & Billing
              </Link>
            );
          }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#EEF4FF] text-[#004AC6]"
                  : "text-[#434655] hover:bg-[#F8F9FF]"
              }`}
            >
              {tab === "general" ? "General Details" : "Members"}
            </button>
          );
        })}
      </div>

      {activeTab === "general" && (
        <div className="max-w-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#121C28]">Workspace Settings</h2>
            <p className="mt-1 text-sm text-[#737686]">Manage your workspace general details and preferences.</p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h3 className="text-base font-semibold text-[#121C28]">General Details</h3>
            <p className="mt-1 text-sm text-[#737686]">Information about your workspace identity.</p>

            {success && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</div>
            )}
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <form onSubmit={handleUpdate} className="mt-6 space-y-5">
              <Input
                label="Workspace Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={!isAdmin}
              />
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isAdmin}
              />
              <div className={!isAdmin ? "pointer-events-none opacity-60" : ""}>
                <WorkspaceTypePicker value={template} onChange={setTemplate} />
                <p className="mt-1.5 text-xs text-[#737686]">
                  Sets the default board and menu layout for this workspace.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434655]">Workspace ID</label>
                <div className="mt-1.5 rounded-lg border border-[#C3C6D7] bg-gray-50 px-3 py-2.5 text-sm text-[#737686] font-mono">
                  {workspaceId}
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-3 pt-2">
                  <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
                </div>
              )}
              {!isAdmin && (
                <p className="text-sm text-[#737686]">Only workspace admins can edit these settings.</p>
              )}
            </form>
          </div>

          {isAdmin && workspace?.ownerId === user?.id && (
            <div className="mt-8 rounded-xl border border-red-200 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="text-base font-semibold text-red-600">Delete Workspace</h3>
              <p className="mt-1 text-sm text-[#737686]">
                Once you delete a workspace, there is no going back. All project data, member history, and associated assets will be permanently removed.
              </p>
              <Button
                variant="danger"
                className="mt-4"
                onClick={() => setShowDelete(true)}
              >
                Delete this workspace
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className="max-w-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#121C28]">Members Management</h2>
            <p className="mt-1 text-sm text-[#737686]">Control who has access to this workspace and manage their roles.</p>
          </div>

          <div className="rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="px-6 py-4 border-b border-[#C3C6D7]/20 flex items-center justify-between">
              <p className="text-sm font-medium text-[#121C28]">Team Members ({members.length})</p>
              {isAdmin && (
                <Link href={`/w/${workspaceId}/members`}>
                  <Button size="sm">Manage Members</Button>
                </Link>
              )}
            </div>
            <div className="divide-y divide-[#C3C6D7]/10">
              {members.slice(0, 5).map((member) => (
                <div key={member.userId} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white">
                      {member.userId.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#121C28]">
                        {member.userId === user?.id ? "You" : `User ${member.userId.slice(0, 8)}`}
                      </p>
                    </div>
                  </div>
                  {canManageMember(member) ? (
                    <div className="flex items-center gap-2">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ROLE_BADGE[member.role]}`}>
                        {ROLE_LABELS[member.role]}
                      </span>
                      <button
                        onClick={() => openRoleModal(member)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-[#2563EB] transition-colors hover:bg-[#EEF4FF]"
                      >
                        Manage access
                      </button>
                    </div>
                  ) : (
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      member.role === "ADMIN"
                        ? "bg-[#EEF4FF] text-[#004AC6]"
                        : member.role === "VIEW"
                        ? "bg-[#F5F3FF] text-[#6D28D9]"
                        : "bg-[#F0F0F5] text-[#737686]"
                    }`}>
                      {member.role === "ADMIN" ? "Admin" : member.role === "VIEW" ? "View" : "Edit"}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {members.length > 5 && (
              <div className="px-6 py-3 border-t border-[#C3C6D7]/10">
                <Link href={`/w/${workspaceId}/members`} className="text-sm font-medium text-[#2563EB] hover:text-[#1d4ed8]">
                  View all {members.length} members &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="Delete workspace" className="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-[#737686]">
            Are you sure you want to delete <strong>{workspace.name}</strong>? This will permanently remove all projects, tasks, and member associations.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={!!roleModalMember}
        onClose={() => setRoleModalMember(null)}
        title="Manage access"
      >
        {roleModalMember && (
          <div className="space-y-4">
            <p className="text-sm text-[#434655]">
              Change workspace role for{" "}
              <strong>
                {roleModalMember.user?.name || roleModalMember.userId.slice(0, 8)}
              </strong>
              .
            </p>
            <div className="flex flex-col gap-2">
              {roleModalOptions().map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleModalValue(role)}
                  className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                    roleModalValue === role
                      ? "border-[#2563EB] bg-[#EEF4FF]"
                      : "border-[#C3C6D7] hover:bg-[#F8F9FF]"
                  }`}
                >
                  <span className="block text-sm font-semibold text-[#121C28]">
                    {ROLE_LABELS[role]}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#737686]">
                    {ROLE_DESCRIPTIONS[role]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setRoleModalMember(null)}>
                Cancel
              </Button>
              <Button
                isLoading={roleModalSaving}
                disabled={roleModalValue === roleModalMember.role}
                onClick={() => {
                  setRoleModalSaving(true);
                  handleChangeRole(roleModalMember.userId, roleModalValue);
                }}
              >
                {roleModalValue === roleModalMember.role ? "Current role" : "Change role"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
