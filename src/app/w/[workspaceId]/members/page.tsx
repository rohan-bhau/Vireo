"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetWorkspaceQuery,
  useGetMembersQuery,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  useGetInvitationsQuery,
  useCreateInvitationMutation,
  useCancelInvitationMutation,
  type Role,
} from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { toastSuccess, toastError } from "@/lib/toast";
import Link from "next/link";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: "bg-[#EEF4FF] text-[#004AC6]",
  MEMBER: "bg-[#F0F0F5] text-[#737686]",
  VIEWER: "bg-[#F5F3FF] text-[#6D28D9]",
};

function Avatar({
  name,
  avatar,
}: {
  name: string;
  avatar?: string | null;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={name}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
      {initials || "?"}
    </div>
  );
}

export default function MembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: workspace } = useGetWorkspaceQuery(workspaceId);
  const { data: members = [], isLoading: membersLoading } = useGetMembersQuery(workspaceId);
  const { data: invitations = [] } = useGetInvitationsQuery(workspaceId);
  const [removeMember] = useRemoveMemberMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [createInvitation, { isLoading: isInviting }] = useCreateInvitationMutation();
  const [cancelInvitation] = useCancelInvitationMutation();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("VIEWER");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  const currentMember = members.find((m) => m.userId === user?.id);
  const isAdmin = currentMember?.role === "ADMIN";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);
    if (!inviteEmail.trim()) {
      setInviteError("Email is required");
      return;
    }
    try {
      await createInvitation({
        workspaceId,
        inviteeEmail: inviteEmail.trim(),
        role: inviteRole,
        message: inviteMessage.trim() || undefined,
      }).unwrap();
      setInviteEmail("");
      setInviteMessage("");
      setInviteSuccess("Invitation sent to " + inviteEmail.trim());
      setTimeout(() => setInviteSuccess(null), 3000);
    } catch (err) {
      setInviteError(
        (err as { data?: { message?: string } }).data?.message ||
          (err as { message?: string }).message ||
          "Failed to send invitation"
      );
    }
  }

  async function handleRemoveMember(userId: string) {
    setRemoveLoading(true);
    try {
      await removeMember({ workspaceId, userId }).unwrap();
      toastSuccess("Member removed");
    } catch (err) {
      toastError(
        (err as { data?: { message?: string } }).data?.message || "Failed to remove member"
      );
    } finally {
      setRemoveLoading(false);
      setRemoveTarget(null);
    }
  }

  async function handleChangeRole(memberUserId: string, role: Role) {
    setRoleLoading(memberUserId);
    try {
      await updateRole({ workspaceId, userId: memberUserId, role }).unwrap();
    } catch (err) {
      toastError(
        (err as { data?: { message?: string } }).data?.message || "Failed to update role"
      );
    } finally {
      setRoleLoading(null);
    }
  }

  async function handleCancelInvitation(invitationId: string) {
    try {
      await cancelInvitation({ workspaceId, invitationId }).unwrap();
    } catch (err) {
      toastError(
        (err as { data?: { message?: string } }).data?.message || "Failed to cancel invitation"
      );
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href={`/w/${workspaceId}`} className="font-medium text-[#737686] hover:text-[#121C28] transition-colors">
          {workspace?.name || "Workspace"}
        </Link>
        <span className="text-[#C3C6D7]">/</span>
        <span className="font-semibold text-[#121C28]">Members</span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#121C28]">Team Members</h2>
          <p className="mt-1 text-sm text-[#737686]">
            {members.length} member{members.length !== 1 ? "s" : ""} in this workspace
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowInvite(true)}>Invite Member</Button>
        )}
      </div>

      {inviteSuccess && (
        <div className="mb-6 rounded-lg bg-green-50 p-3 text-sm text-green-700">{inviteSuccess}</div>
      )}

      {membersLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#C3C6D7]/20">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Member</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3C6D7]/10">
              {members.map((member) => {
                const displayName =
                  member.user?.name || (member.userId === user?.id ? "You" : `User ${member.userId.slice(0, 8)}`);
                const email = member.user?.email || "";
                const isCurrentUser = member.userId === user?.id;
                return (
                  <tr key={member.userId} className="hover:bg-[#F8F9FF]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={displayName} avatar={member.user?.avatar} />
                        <p className="text-sm font-medium text-[#121C28]">
                          {displayName}
                          {isCurrentUser && <span className="ml-1.5 text-xs text-[#737686]">(you)</span>}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#737686]">{email}</td>
                    <td className="px-6 py-4">
                      {isAdmin && !isCurrentUser ? (
                        <select
                          value={member.role}
                          disabled={roleLoading === member.userId}
                          onChange={(e) => handleChangeRole(member.userId, e.target.value as Role)}
                          className="rounded-md border border-[#C3C6D7] bg-white px-2 py-1 text-xs font-medium text-[#434655] focus:border-[#2563EB] focus:outline-none"
                        >
                          {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ROLE_BADGE[member.role]}`}>
                          {ROLE_LABELS[member.role]}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin && !isCurrentUser ? (
                        <button
                          onClick={() => setRemoveTarget(member.userId)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs text-[#C3C6D7]">&mdash;</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {invitations.filter((inv) => inv.status === "PENDING").length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 text-base font-semibold text-[#121C28]">Pending Invitations</h3>
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C3C6D7]/20">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C3C6D7]/10">
                {invitations.filter((inv) => inv.status === "PENDING").map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8F9FF]">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#121C28]">{inv.inviteeEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ROLE_BADGE[inv.role]}`}>
                        {ROLE_LABELS[inv.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin && (
                        <button
                          onClick={() => handleCancelInvitation(inv.id)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-[#737686] transition-colors hover:bg-[#F8F9FF]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showInvite} onClose={() => setShowInvite(false)} title="Invite Member">
        <form onSubmit={handleInvite} className="space-y-4">
          {inviteError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{inviteError}</div>
          )}
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Workspace Role</label>
            <div className="flex gap-3">
              {(["VIEWER", "MEMBER", "ADMIN"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setInviteRole(role)}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    inviteRole === role
                      ? "border-[#2563EB] bg-[#EEF4FF] text-[#004AC6]"
                      : "border-[#C3C6D7] text-[#434655] hover:bg-[#F8F9FF]"
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#737686]">
              {inviteRole === "ADMIN"
                ? "Full access to billing, members, and all projects."
                : inviteRole === "MEMBER"
                ? "Can create projects and manage their own work."
                : "Read-only access. Can view boards and comment on tasks."}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Personal message (optional)</label>
            <textarea
              placeholder="Hey, I'd love for you to join our workspace!"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-[#C3C6D7] px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button type="submit" isLoading={isInviting}>Send Invites</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove member"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#434655]">
            Are you sure you want to remove this member from the workspace? They will lose access to all projects and boards.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              isLoading={removeLoading}
              onClick={() => removeTarget && handleRemoveMember(removeTarget)}
            >
              Remove
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}