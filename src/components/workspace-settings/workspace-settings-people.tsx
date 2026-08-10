"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetWorkspaceQuery,
  useGetMembersQuery,
  useGetInvitationsQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useCreateInvitationMutation,
  useTransferOwnershipMutation,
  type Role,
  type WorkspaceMember,
} from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { useDropdown, DropdownPanel } from "@/components/ui/dropdown";
import { Check, Users, Trash2, Mail, Loader2, ChevronDown } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import {
  ROLE_LABELS,
  ROLE_BADGE,
  ROLE_DESCRIPTIONS,
  canManageMember,
  roleModalOptions,
} from "@/lib/workspace-roles";
import { clsx } from "clsx";

const ASSIGNABLE_ROLES: Role[] = ["ADMIN", "EDIT", "VIEW"];

export function WorkspaceSettingsPeople() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: workspace, isLoading: wsLoading } = useGetWorkspaceQuery(workspaceId);
  const { data: members = [], isLoading: membersLoading } = useGetMembersQuery(workspaceId);
  const { data: invitations = [] } = useGetInvitationsQuery(workspaceId);
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [createInvitation] = useCreateInvitationMutation();
  const [transferOwnership] = useTransferOwnershipMutation();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("EDIT");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTarget, setTransferTarget] = useState<WorkspaceMember | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [roleBusy, setRoleBusy] = useState<string | null>(null);
  const [lastSyncedName, setLastSyncedName] = useState<string | null>(null);

  if (workspace && lastSyncedName !== workspace.name) {
    setLastSyncedName(workspace.name);
  }

  const currentMember = members.find((m) => m.userId === user?.id);
  const isOwner = workspace?.ownerId === user?.id;
  const isAdmin = currentMember?.role === "ADMIN";
  const manageCtx = { currentUserId: user?.id, ownerId: workspace?.ownerId, isAdmin, isOwner };

  const transferable = members.filter(
    (m) => m.userId !== user?.id && m.userId !== workspace?.ownerId
  );

  async function handleChangeRole(member: WorkspaceMember, role: Role) {
    setRoleBusy(member.userId);
    try {
      await updateMemberRole({ workspaceId, userId: member.userId, role }).unwrap();
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not change role");
    } finally {
      setRoleBusy(null);
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeMember({ workspaceId, userId: removeTarget.userId }).unwrap();
      toastSuccess("Member removed");
      setRemoveTarget(null);
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not remove member");
    } finally {
      setRemoving(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    const email = inviteEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Enter a valid email address");
      return;
    }
    setInviting(true);
    try {
      await createInvitation({
        workspaceId,
        inviteeEmail: email,
        role: inviteRole,
        message: inviteMessage.trim() || undefined,
      }).unwrap();
      toastSuccess(`Invitation sent to ${email}`);
      setInviteEmail("");
      setInviteMessage("");
      setShowInvite(false);
    } catch (err: unknown) {
      setInviteError((err as { data?: { message?: string } })?.data?.message || "Could not send invitation");
    } finally {
      setInviting(false);
    }
  }

  async function handleTransfer() {
    if (!transferTarget) return;
    setTransferring(true);
    try {
      await transferOwnership({ workspaceId, userId: transferTarget.userId }).unwrap();
      toastSuccess("Workspace ownership transferred");
      setShowTransfer(false);
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not transfer ownership");
    } finally {
      setTransferring(false);
    }
  }

  if (wsLoading || membersLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Members</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            {members.length} people have access. Click a role to change it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isOwner && (
            <Button variant="outline" size="sm" onClick={() => { setTransferTarget(null); setShowTransfer(true); }}>
              Transfer ownership
            </Button>
          )}
          {isAdmin && (
            <Button size="sm" onClick={() => { setInviteError(null); setShowInvite(true); }}>
              <Users className="h-3.5 w-3.5" />
              Invite member
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-light bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-border-light bg-bg-light/60">
              <th className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Member</th>
              <th className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Email</th>
              <th className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Role</th>
              <th className="whitespace-nowrap px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {members.map((member) => (
              <MemberRow
                key={member.userId}
                member={member}
                isOwner={isOwner}
                canManage={canManageMember(member, manageCtx)}
                busy={roleBusy === member.userId}
                onChangeRole={(role) => handleChangeRole(member, role)}
                onRemove={() => setRemoveTarget(member)}
              />
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {invitations.length > 0 && (
        <div className="rounded-xl border border-border-light bg-surface">
          <div className="border-b border-border-light px-5 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
              <Mail className="h-4 w-4 text-text-tertiary" /> Pending invitations
            </h3>
          </div>
          <ul className="divide-y divide-border-light">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={inv.inviteeEmail} email={inv.inviteeEmail} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{inv.inviteeEmail}</p>
                    <p className="text-xs text-text-tertiary">Invited as {ROLE_LABELS[inv.role]}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-bg-light px-2.5 py-0.5 text-[11px] font-medium text-text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Pending
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={showInvite} onClose={() => setShowInvite(false)} title="Invite member" className="max-w-md">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="teammate@company.com"
            error={inviteError || undefined}
            autoFocus
          />
          <div>
            <label className="text-xs font-semibold text-text-secondary">Workspace role</label>
            <div className="mt-1.5 flex flex-col gap-2">
              {ASSIGNABLE_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setInviteRole(role)}
                  className={clsx(
                    "flex items-start justify-between rounded-lg border px-4 py-2.5 text-left transition-colors",
                    inviteRole === role ? "border-primary bg-primary-bg" : "border-border-light hover:border-border hover:bg-bg-light"
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold text-text">{ROLE_LABELS[role]}</span>
                    <span className="mt-0.5 block text-xs text-text-tertiary">{ROLE_DESCRIPTIONS[role]}</span>
                  </span>
                  {inviteRole === role && (
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Personal message (optional)"
            value={inviteMessage}
            onChange={(e) => setInviteMessage(e.target.value)}
            placeholder="Hi! Join our workspace…"
          />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button type="submit" isLoading={inviting}>Send invitation</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!removeTarget} onClose={() => setRemoveTarget(null)} title="Remove member" className="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Remove <strong className="text-text">{removeTarget?.user?.name || "this member"}</strong> from this workspace? They will lose access immediately.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button variant="danger" isLoading={removing} onClick={handleRemove}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={showTransfer} onClose={() => setShowTransfer(false)} title="Transfer ownership" className="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Transfer workspace ownership to another member. You will become an admin and will no longer be able to delete the workspace or change the new owner&apos;s role.
          </p>
          <div>
            <label className="text-xs font-semibold text-text-secondary">New owner</label>
            <div className="mt-1.5 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border-light p-1.5">
              {transferable.length === 0 && (
                <p className="px-3 py-2 text-sm text-text-tertiary">No other members to transfer to.</p>
              )}
              {transferable.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => setTransferTarget(m)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                    transferTarget?.userId === m.userId ? "bg-primary-bg" : "hover:bg-bg-light"
                  )}
                >
                  <Avatar name={m.user?.name} email={m.user?.email} avatar={m.user?.avatar} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{m.user?.name || "Unknown user"}</p>
                    <p className="truncate text-xs text-text-tertiary">{m.user?.email}</p>
                  </div>
                  {transferTarget?.userId === m.userId && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowTransfer(false)}>Cancel</Button>
            <Button
              isLoading={transferring}
              disabled={!transferTarget}
              onClick={handleTransfer}
            >
              Transfer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function MemberRow({
  member,
  isOwner,
  canManage,
  busy,
  onChangeRole,
  onRemove,
}: {
  member: WorkspaceMember;
  isOwner: boolean;
  canManage: boolean;
  busy: boolean;
  onChangeRole: (role: Role) => void;
  onRemove: () => void;
}) {
  const { open, setOpen, triggerRef } = useDropdown();
  const options = roleModalOptions(member, isOwner);

  return (
    <tr className="transition-colors hover:bg-bg-light/50">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={member.user?.name} email={member.user?.email} avatar={member.user?.avatar} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">
              {member.user?.name || `User ${member.userId.slice(0, 8)}`}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="truncate text-sm text-text-secondary">{member.user?.email || <span className="text-text-tertiary">—</span>}</p>
      </td>
      <td className="px-5 py-3.5">
        <span className={clsx("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium", ROLE_BADGE[member.role])}>
          {ROLE_LABELS[member.role]}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-text-tertiary" />}
          {canManage ? (
            <>
              <div className="relative">
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-1 rounded-[3px] border border-border-light px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-light hover:text-text"
                >
                  Change role
                  <ChevronDown className="h-3 w-3" />
                </button>
                <DropdownPanel open={open} triggerRef={triggerRef} onClose={() => setOpen(false)} width={260} align="right">
                  <div className="py-1">
                    <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                      Change role for {member.user?.name || "member"}
                    </p>
                    {options.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => { setOpen(false); onChangeRole(role); }}
                        className={clsx(
                          "flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-bg-light",
                          role === member.role && "bg-primary-bg"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text">{ROLE_LABELS[role]}</p>
                          <p className="mt-0.5 text-[11px] leading-snug text-text-tertiary">{ROLE_DESCRIPTIONS[role]}</p>
                        </div>
                        {role === member.role && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    ))}
                  </div>
                </DropdownPanel>
              </div>
              <button
                type="button"
                onClick={onRemove}
                title="Remove member"
                className="flex h-7 w-7 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <span className="text-xs text-text-tertiary">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}