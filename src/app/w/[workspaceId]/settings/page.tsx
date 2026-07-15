"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetWorkspaceQuery,
  useGetMembersQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
} from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { AuthGuard } from "@/components/auth/auth-guard";

type SettingsTab = "general" | "members";

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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description || "");
    }
  }, [workspace]);

  const currentMember = members.find((m) => m.userId === user?.id);
  const isAdmin = currentMember?.role === "ADMIN";

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }
    try {
      await updateWorkspace({ workspaceId, name: name.trim(), description: description.trim() || undefined }).unwrap();
      setSuccess("Workspace updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to update workspace");
    }
  }

  async function handleDelete() {
    try {
      await deleteWorkspace(workspaceId).unwrap();
      router.replace("/workspaces");
    } catch (err: any) {
      setError(err?.data?.message || "Failed to delete workspace");
      setShowDelete(false);
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
          <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </AuthGuard>
    );
  }

  if (!workspace) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F9FF]">
          <p className="text-[#737686]">Workspace not found</p>
          <Link href="/workspaces"><Button variant="outline">Back to workspaces</Button></Link>
        </div>
      </AuthGuard>
    );
  }

  const sidebarTabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: "general", label: "General Details", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { key: "members", label: "Members", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
  ];

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
            <p className="text-xs font-medium text-[#737686]">{workspace.name}</p>
          </div>
          <nav className="flex-1 space-y-0.5 px-3 py-4">
            <Link
              href={`/w/${workspaceId}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#737686]">Workspace</p>
            {sidebarTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#EEF4FF] text-[#004AC6]"
                    : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                }`}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="border-t border-[#C3C6D7]/20 px-5 py-3">
            <Link
              href={`/w/${workspaceId}/members`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Team Members
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-[#C3C6D7]/20 bg-white px-6">
            <div className="flex items-center gap-2">
              <Link href={`/w/${workspaceId}`} className="text-sm font-medium text-[#737686] hover:text-[#121C28] transition-colors">
                {workspace.name}
              </Link>
              <span className="text-[#C3C6D7]">/</span>
              <h1 className="text-sm font-semibold text-[#121C28]">Settings</h1>
            </div>
            <Link
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white"
            >
              {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </Link>
          </header>

          <main className="flex-1 overflow-y-auto px-8 py-8">
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

                {/* Danger Zone */}
                {isAdmin && (
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
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          member.role === "ADMIN"
                            ? "bg-[#EEF4FF] text-[#004AC6]"
                            : "bg-[#F0F0F5] text-[#737686]"
                        }`}>
                          {member.role === "ADMIN" ? "Admin" : "Member"}
                        </span>
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
          </main>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="Delete workspace" className="max-w-sm">
          <div className="space-y-4">
            <p className="text-sm text-[#737686]">
              Are you sure you want to delete <strong>{workspace.name}</strong>? This will permanently remove all projects, issues, and member associations.
            </p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
