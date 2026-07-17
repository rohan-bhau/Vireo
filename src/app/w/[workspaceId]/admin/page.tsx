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
import {
  Shield,
  Users,
  Key,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type AdminTab = "general" | "security" | "members";

export default function AdminSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<AdminTab>("general");

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
      setSuccess("Settings saved successfully");
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
        <span className="font-semibold text-[#121C28]">Admin</span>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[#C3C6D7]/20 pb-4 flex-wrap">
        {([
          { id: "general" as const, label: "General", icon: Shield },
          { id: "security" as const, label: "Security", icon: Key },
          { id: "members" as const, label: "Members", icon: Users },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === id
                ? "bg-[#EEF4FF] text-[#004AC6]"
                : "text-[#434655] hover:bg-[#F8F9FF]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="max-w-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#121C28]">General Settings</h2>
            <p className="mt-1 text-sm text-[#737686]">Manage workspace identity and details.</p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href={`/w/${workspaceId}/audit-log`}
              className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
                <RefreshCw className="h-4 w-4 text-[#004AC6]" />
              </div>
              <h3 className="text-sm font-semibold text-[#121C28]">Audit Log</h3>
              <p className="mt-0.5 text-xs text-[#737686]">Review workspace activity history</p>
            </Link>
            <Link
              href={`/w/${workspaceId}/integrations`}
              className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
                <ExternalLink className="h-4 w-4 text-[#004AC6]" />
              </div>
              <h3 className="text-sm font-semibold text-[#121C28]">Integrations</h3>
              <p className="mt-0.5 text-xs text-[#737686]">Connect Slack, GitHub, and more</p>
            </Link>
          </div>

          {isAdmin && (
            <div className="mt-8 rounded-xl border border-red-200 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="text-base font-semibold text-red-600">Danger Zone</h3>
              <p className="mt-1 text-sm text-[#737686]">
                Deleting this workspace will permanently remove all projects, tasks, and member associations.
              </p>
              <Button
                variant="danger"
                className="mt-4"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete this workspace
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "security" && (
        <div className="max-w-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#121C28]">Security Settings</h2>
            <p className="mt-1 text-sm text-[#737686]">Manage workspace security preferences.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#121C28]">Audit Trail</h3>
                  <p className="mt-0.5 text-xs text-[#737686]">
                    All workspace activities are automatically logged for compliance and review.
                  </p>
                </div>
                <Link href={`/w/${workspaceId}/audit-log`}>
                  <Button variant="outline" size="sm">
                    View Logs
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#121C28]">Member Access Control</h3>
                  <p className="mt-0.5 text-xs text-[#737686]">
                    Manage member roles and permissions. Only admins can modify workspace settings.
                  </p>
                </div>
                <Link href={`/w/${workspaceId}/members`}>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#121C28]">Integrations Security</h3>
                  <p className="mt-0.5 text-xs text-[#737686]">
                    Connected integrations use OAuth and webhook secrets for secure communication.
                  </p>
                </div>
                <Link href={`/w/${workspaceId}/integrations`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="max-w-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#121C28]">Members Management</h2>
            <p className="mt-1 text-sm text-[#737686]">Control who has access to this workspace.</p>
          </div>

          <div className="rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between border-b border-[#C3C6D7]/20 px-6 py-4">
              <p className="text-sm font-medium text-[#121C28]">Team Members ({members.length})</p>
              {isAdmin && (
                <Link href={`/w/${workspaceId}/members`}>
                  <Button size="sm">Manage</Button>
                </Link>
              )}
            </div>
            <div className="divide-y divide-[#C3C6D7]/10">
              {members.map((member) => (
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
          </div>
        </div>
      )}

      <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="Delete workspace" className="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-[#737686]">
            Are you sure you want to delete <strong>{workspace.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
