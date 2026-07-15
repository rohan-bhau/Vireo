"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { AuthGuard } from "@/components/auth/auth-guard";

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
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

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
      await createInvitation({ workspaceId, inviteeEmail: inviteEmail.trim(), role: inviteRole }).unwrap();
      setInviteEmail("");
      setInviteSuccess("Invitation sent to " + inviteEmail.trim());
      setTimeout(() => setInviteSuccess(null), 3000);
    } catch (err: any) {
      setInviteError(err?.data?.message || "Failed to send invitation");
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm("Remove this member from the workspace?")) return;
    try { await removeMember({ workspaceId, userId }).unwrap(); } catch {}
  }

  async function handleToggleRole(memberId: string, currentRole: "ADMIN" | "MEMBER") {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    try { await updateRole({ workspaceId, userId: memberId, role: newRole }).unwrap(); } catch {}
  }

  async function handleCancelInvitation(invitationId: string) {
    try { await cancelInvitation({ workspaceId, invitationId }).unwrap(); } catch {}
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F8F9FF]">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-[#C3C6D7]/20 bg-white md:flex">
          <div className="border-b border-[#C3C6D7]/20 px-5 py-4">
            <Link href="/workspaces" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2563EB] text-xs font-bold text-white">V</div>
              <span className="text-sm font-bold text-[#121C28]">Vireo</span>
            </Link>
          </div>
          <div className="border-b border-[#C3C6D7]/20 px-5 py-3">
            <p className="text-xs font-medium text-[#737686]">{workspace?.name || "Workspace"}</p>
          </div>
          <nav className="flex-1 space-y-0.5 px-3 py-4">
            {[
              { label: "Dashboard", href: `/w/${workspaceId}`, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { label: "Members", href: `/w/${workspaceId}/members`, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
              { label: "Settings", href: `/w/${workspaceId}/settings`, icon: "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  link.label === "Members"
                    ? "bg-[#EEF4FF] text-[#004AC6]"
                    : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                }`}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-[#C3C6D7]/20 bg-white px-6">
            <div className="flex items-center gap-2">
              <Link href={`/w/${workspaceId}`} className="text-sm font-medium text-[#737686] hover:text-[#121C28] transition-colors">
                {workspace?.name || "Workspace"}
              </Link>
              <span className="text-[#C3C6D7]">/</span>
              <h1 className="text-sm font-semibold text-[#121C28]">Members</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white"
              >
                {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-8 py-8">
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
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C3C6D7]/10">
                    {members.map((member) => (
                      <tr key={member.userId} className="hover:bg-[#F8F9FF]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                              {member.userId === user?.id
                                ? user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                                : member.userId.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#121C28]">
                                {member.userId === user?.id ? "You" : `User ${member.userId.slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-[#737686]">
                                {member.userId === user?.id ? user?.email : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            member.role === "ADMIN"
                              ? "bg-[#EEF4FF] text-[#004AC6]"
                              : "bg-[#F0F0F5] text-[#737686]"
                          }`}>
                            {member.role === "ADMIN" ? "Admin" : "Member"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {isAdmin && member.userId !== user?.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleRole(member.userId, member.role)}
                                className="rounded-md px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
                              >
                                {member.role === "ADMIN" ? "Demote" : "Promote"}
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member.userId)}
                                className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-[#C3C6D7]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pending Invitations */}
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
                            <span className="inline-block rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-[11px] font-medium text-[#92400E]">
                              {inv.role === "ADMIN" ? "Admin" : "Member"}
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
          </main>
        </div>

        {/* Invite Dialog */}
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
                {(["MEMBER", "ADMIN"] as const).map((role) => (
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
                    {role === "ADMIN" ? "Admin" : "Member"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#737686]">
                {inviteRole === "ADMIN"
                  ? "Full access to billing, members, and all projects."
                  : "Can create projects and manage their own work."}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button type="submit" isLoading={isInviting}>Send Invites</Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
