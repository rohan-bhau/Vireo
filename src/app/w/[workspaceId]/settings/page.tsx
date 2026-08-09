"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { Settings2, Users, Pencil, Trash2, Check, Plus } from "lucide-react";
import { clsx } from "clsx";

type SettingsTab = "general" | "members";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  EDIT: "Edit",
  VIEW: "View",
};

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: "bg-primary-bg text-primary",
  EDIT: "bg-bg-light text-text-secondary",
  VIEW: "bg-[#F5F3FF] text-[#6D28D9]",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN:
    "Full workspace management: settings, members, invites. Cannot delete the workspace or change the owner's role.",
  EDIT:
    "Can create, edit, update, and delete tasks they created across projects. No access to workspace settings or member management.",
  VIEW:
    "Read-only access. Can view boards, tasks, and comments but cannot modify anything.",
};

function Avatar({ name, email }: { name?: string | null; email?: string | null }) {
  const initial = (name || email || "?").trim().charAt(0)?.toUpperCase() || "?";
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
      {initial}
    </div>
  );
}

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const { data: workspace, isLoading } = useGetWorkspaceQuery(workspaceId);
  const { data: members = [] } = useGetMembersQuery(workspaceId);
  const [updateWorkspace, { isLoading: isUpdating }] = useUpdateWorkspaceMutation();
  const [deleteWorkspace, { isLoading: isDeleting }] = useDeleteWorkspaceMutation();
  const [updateMemberRole] = useUpdateMemberRoleMutation();

  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [roleModalMember, setRoleModalMember] = useState<WorkspaceMember | null>(null);
  const [roleModalValue, setRoleModalValue] = useState<Role>("VIEW");
  const [roleModalSaving, setRoleModalSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<ProjectTemplate>("KANBAN");
  const [saveState, setSaveState] = useState<"idle" | "success" | "error">("idle");
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [lastSyncedName, setLastSyncedName] = useState<string | null>(null);

  if (workspace && name !== workspace.name && lastSyncedName !== workspace.name) {
    setLastSyncedName(workspace.name);
    setDescription(workspace.description || "");
    setTemplate(workspace.template || "KANBAN");
    setName(workspace.name);
  }

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

  async function handleRename() {
    const value = renameValue.trim();
    if (!value) {
      setRenameError("Workspace name is required");
      return;
    }
    setRenameError(null);
    setRenaming(true);
    try {
      await updateWorkspace({ workspaceId, name: value, description: description.trim() || undefined, template }).unwrap();
      setRenameValue("");
      setShowRename(false);
      setName(value);
    } catch (err: unknown) {
      setRenameError((err as { data?: { message?: string } })?.data?.message || "Failed to rename workspace");
    } finally {
      setRenaming(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("idle");
    if (!name.trim()) {
      setSaveState("error");
      return;
    }
    try {
      await updateWorkspace({ workspaceId, name: name.trim(), description: description.trim() || undefined, template }).unwrap();
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }

  async function handleChangeRole(memberUserId: string, role: Role) {
    setRoleModalSaving(true);
    setRoleLoading(memberUserId);
    try {
      await updateMemberRole({ workspaceId, userId: memberUserId, role }).unwrap();
      setRoleModalMember(null);
    } catch {
      // cache revalidation surfaces state
    } finally {
      setRoleLoading(null);
      setRoleModalSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteWorkspace(workspaceId).unwrap();
      router.replace("/dashboard");
    } catch {
      setShowDelete(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (members.length > 0 && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-sm text-text-secondary">Only workspace admins can access settings.</p>
        <Link href={`/w/${workspaceId}`}><Button variant="outline">Back to workspace</Button></Link>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-sm text-text-secondary">Workspace not found</p>
        <Link href="/dashboard"><Button variant="outline">Back to workspaces</Button></Link>
      </div>
    );
  }

  const navItems = [
    { id: "general" as SettingsTab, label: "General", icon: Settings2, desc: "Workspace details & preferences" },
    { id: "members" as SettingsTab, label: "Members", icon: Users, desc: "Manage roles and access" },
  ];

  return (
    <>
      <div className="rounded-xl border border-border-light bg-surface">
        <div className="flex flex-col gap-4 border-b border-border-light px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base font-bold text-primary">
              {workspace.name.charAt(0)?.toUpperCase() || "W"}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-text">{workspace.name}</h1>
              <p className="text-xs text-text-tertiary">
                {isOwner ? "Owner & admin" : "Admin"} · {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setRenameValue(workspace.name); setRenameError(null); setShowRename(true); }}
            className="w-fit gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit workspace name
          </Button>
        </div>

        <div className="flex flex-col md:flex-row">
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border-light p-2 md:w-60 md:flex-col md:border-b-0 md:border-r md:p-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "flex min-w-[140px] items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors md:w-full md:min-w-0",
                  activeTab === item.id
                    ? "bg-primary-bg text-primary-dark"
                    : "text-text-secondary hover:bg-bg-light hover:text-text"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="hidden text-[11px] text-text-tertiary md:block">{item.desc}</p>
                </div>
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 p-5 sm:p-8">
            {activeTab === "general" && (
              <div className="max-w-2xl space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-text">General settings</h2>
                  <p className="mt-0.5 text-sm text-text-secondary">Manage your workspace identity and default working style.</p>
                </div>

                <div className="space-y-6 rounded-xl border border-border-light bg-surface p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text">Workspace name</p>
                      <p className="mt-0.5 text-sm text-text-secondary">{name}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setRenameValue(name); setRenameError(null); setShowRename(true); }}
                      className="shrink-0 gap-1.5"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-5">
                    <Input
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this workspace about?"
                      disabled={!isAdmin}
                    />
                    <div className={!isAdmin ? "pointer-events-none opacity-60" : ""}>
                      <WorkspaceTypePicker value={template} onChange={setTemplate} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Workspace ID</label>
                      <div className="mt-1.5 rounded-[3px] border border-border-input bg-bg-light px-3 py-2.5 font-mono text-sm text-text-tertiary">
                        {workspaceId}
                      </div>
                    </div>
                    {saveState === "success" && (
                      <p className="flex items-center gap-1.5 text-sm text-green-600">
                        <Check className="h-4 w-4" /> Workspace updated successfully
                      </p>
                    )}
                    {saveState === "error" && (
                      <p className="text-sm text-danger">Failed to update workspace. Please try again.</p>
                    )}
                    {isAdmin && (
                      <Button type="submit" isLoading={isUpdating}>Save changes</Button>
                    )}
                  </form>

                  {!isAdmin && (
                    <p className="text-sm text-text-tertiary">Only workspace admins can edit these settings.</p>
                  )}
                </div>

                {isOwner && (
                  <div className="rounded-xl border border-danger/20 bg-danger/5 p-6">
                    <h3 className="text-sm font-semibold text-danger">Danger zone</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Once you delete a workspace, there is no going back. All projects, tasks, and member data will be permanently removed.
                    </p>
                    <Button variant="danger" className="mt-4" onClick={() => setShowDelete(true)}>
                      Delete this workspace
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-text">Members</h2>
                    <p className="mt-0.5 text-sm text-text-secondary">{members.length} people have access to this workspace.</p>
                  </div>
                  <Link href={`/w/${workspaceId}/members`}>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Manage members
                    </Button>
                  </Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-border-light bg-surface">
                  <div className="hidden grid-cols-[1fr_1.4fr_0.8fr_auto] gap-4 border-b border-border-light px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary sm:grid">
                    <span>Member</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span />
                  </div>
                  <div className="divide-y divide-border-light">
                    {members.map((member) => (
                      <div
                        key={member.userId}
                        className="grid grid-cols-1 gap-2 px-5 py-3.5 sm:grid-cols-[1fr_1.4fr_0.8fr_auto] sm:items-center sm:gap-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={member.user?.name} email={member.user?.email} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text">
                              {member.userId === user?.id ? "You" : member.user?.name || `User ${member.userId.slice(0, 8)}`}
                            </p>
                            {member.userId === workspace.ownerId && (
                              <span className="text-[11px] font-medium text-text-tertiary">Owner</span>
                            )}
                          </div>
                        </div>
                        <p className="truncate text-sm text-text-secondary sm:col-auto">
                          {member.user?.email || <span className="text-text-tertiary">—</span>}
                        </p>
                        <span className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:w-auto sm:text-center">
                          <span className={clsx("rounded-full px-2.5 py-0.5", ROLE_BADGE[member.role])}>
                            {ROLE_LABELS[member.role]}
                          </span>
                        </span>
                        <div className="flex items-center justify-end sm:justify-start">
                          {canManageMember(member) ? (
                            roleLoading === member.userId ? (
                              <span className="text-xs text-text-tertiary">Updating…</span>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setRoleModalMember(member); setRoleModalValue(member.role); }}
                              >
                                Manage access
                              </Button>
                            )
                          ) : (
                            <span className="text-xs text-text-tertiary">
                              {member.role === "ADMIN" && !isOwner ? "Managed by owner" : "—"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showRename} onClose={() => setShowRename(false)} title="Rename workspace" className="max-w-md">
        <div className="space-y-4">
          <Input
            label="Workspace name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            error={renameError || undefined}
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowRename(false)}>Cancel</Button>
            <Button isLoading={renaming} onClick={handleRename}>Save</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={!!roleModalMember} onClose={() => setRoleModalMember(null)} title="Manage access" className="max-w-md" >
        {roleModalMember && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Change workspace role for <strong className="text-text">{roleModalMember.user?.name || "this member"}</strong>.
            </p>
            <div className="flex flex-col gap-2">
              {roleModalOptions().map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleModalValue(role)}
                  className={clsx(
                    "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                    roleModalValue === role
                      ? "border-primary bg-primary-bg"
                      : "border-border-light hover:border-border hover:bg-bg-light"
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold text-text">{ROLE_LABELS[role]}</span>
                    <span className="mt-0.5 block text-xs text-text-tertiary">{ROLE_DESCRIPTIONS[role]}</span>
                  </span>
                  {roleModalValue === role && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => setRoleModalMember(null)}>Cancel</Button>
              <Button
                isLoading={roleModalSaving}
                disabled={roleModalValue === roleModalMember.role}
                onClick={() => handleChangeRole(roleModalMember.userId, roleModalValue)}
              >
                {roleModalValue === roleModalMember.role ? "Current role" : "Change role"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="Delete workspace" className="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete <strong className="text-text">{workspace.name}</strong>? This will permanently remove all projects, tasks, and member associations.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}