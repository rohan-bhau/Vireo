"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  type WorkspaceMember,
} from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonWorkspaceTable } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { AppLayout } from "@/components/layout/app-layout";
import { OnboardingPopup } from "@/components/onboarding/onboarding-popup";
import { WorkspaceTypePicker } from "@/components/workspace/workspace-type-picker";
import { useDropdown, DropdownPanel } from "@/components/ui/dropdown";
import { setOnboardingNeeded } from "@/store/authSlice";
import { toggleStarredWorkspace } from "@/store/workspaceSlice";
import type { ProjectTemplate } from "@/store/projectApi";
import { PRESET_AVATARS } from "@/lib/avatar-utils";
import { toastSuccess, toastError } from "@/lib/toast";
import { clsx } from "clsx";
import {
  Plus,
  Home,
  Star,
  MoreHorizontal,
  Settings2,
  Trash2,
} from "lucide-react";

interface WorkspaceRowData {
  id: string;
  name: string;
  description: string | null;
  avatar?: string | null;
  ownerId: string;
  template: ProjectTemplate;
  members?: WorkspaceMember[];
}

function workspaceKey(ws: WorkspaceRowData): string {
  const initials = (ws.name || "WS")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
  return `${initials || "WS"}-${ws.id.slice(0, 4).toUpperCase()}`;
}

function WorkspaceRow({
  ws,
  isOwner,
  leadName,
  starred,
  onToggleStar,
  onDeleteRequest,
}: {
  ws: WorkspaceRowData;
  isOwner: boolean;
  leadName: string;
  starred: boolean;
  onToggleStar: () => void;
  onDeleteRequest: () => void;
}) {
  const { open, setOpen, triggerRef } = useDropdown();

  return (
    <tr className="transition-colors hover:bg-bg-light/50">
      <td className="whitespace-nowrap px-3 py-3">
        <button
          onClick={onToggleStar}
          title={starred ? "Unstar workspace" : "Star workspace"}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
        >
          <Star className={clsx("h-4 w-4", starred && "fill-yellow-400 text-yellow-400")} />
        </button>
      </td>
      <td className="px-3 py-3">
        <Link href={`/w/${ws.id}`} className="flex min-w-0 max-w-[320px] items-center gap-3 rounded-md">
          {ws.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ws.avatar} alt={ws.name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-bg text-sm font-bold text-primary">
              {ws.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{ws.name}</p>
            {ws.description && (
              <p className="truncate text-xs text-text-tertiary">{ws.description}</p>
            )}
          </div>
        </Link>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <span className="font-mono text-xs text-text-secondary">{workspaceKey(ws)}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <span className="inline-flex max-w-full rounded-full bg-bg-light px-2.5 py-0.5 text-[11px] font-medium capitalize text-text-secondary">
          {ws.template === "SCRUM" ? "Scrum" : "Kanban"}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-text-secondary">{leadName}</td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="flex items-center justify-end">
          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(!open)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
              title="Workspace actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <DropdownPanel open={open} triggerRef={triggerRef} onClose={() => setOpen(false)} width={200} align="right">
              <div className="py-1">
                <Link
                  href={`/w/${ws.id}/settings`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-light cursor-pointer"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Workspace settings
                </Link>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onDeleteRequest();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete workspace
                  </button>
                )}
              </div>
            </DropdownPanel>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const { data: workspaces = [], isLoading } = useGetWorkspacesQuery();
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const [deleteWorkspace, { isLoading: isDeleting }] = useDeleteWorkspaceMutation();
  const onboardingNeeded = useSelector((state: RootState) => state.auth.onboardingNeeded);
  const user = useSelector((state: RootState) => state.auth.user);
  const starredWorkspaces = useSelector((state: RootState) => state.workspace.starredWorkspaces);
  const dispatch = useDispatch();

  const [showCreate, setShowCreate] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<ProjectTemplate>("KANBAN");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceRowData | null>(null);

  if (!isLoading && onboardingNeeded && workspaces.length === 0 && !autoOpened) {
    setAutoOpened(true);
    setShowOnboarding(true);
  }

  function closeOnboarding() {
    setShowOnboarding(false);
    dispatch(setOnboardingNeeded(false));
  }

  function openCreate() {
    if (workspaces.length === 0) {
      setShowOnboarding(true);
    } else {
      setShowCreate(true);
    }
  }

  useEffect(() => {
    function handleCreateWorkspaceEvent() {
      openCreate();
    }
    document.addEventListener("vireo:create-workspace", handleCreateWorkspaceEvent);
    return () => {
      document.removeEventListener("vireo:create-workspace", handleCreateWorkspaceEvent);
    };
  });

  function leadName(ws: WorkspaceRowData): string {
    if (ws.ownerId === user?.id) return user?.name || "You";
    const owner = ws.members?.find((m) => m.userId === ws.ownerId);
    return owner?.user?.name || ws.members?.[0]?.user?.name || "—";
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }
    try {
      const ws = await createWorkspace({
        name: name.trim(),
        description: description.trim() || undefined,
        template,
        avatar: avatar || undefined,
      }).unwrap();
      setShowCreate(false);
      setName("");
      setDescription("");
      setTemplate("KANBAN");
      setAvatar("");
      toastSuccess(`Workspace "${ws.name}" created`);
      window.location.href = `/w/${ws.id}`;
    } catch (err: unknown) {
      setError((err as { data?: { message?: string } })?.data?.message || "Failed to create workspace");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteWorkspace(deleteTarget.id).unwrap();
      toastSuccess(`Workspace "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not delete workspace");
    }
  }

  return (
    <AppLayout>
      <div className="w-full">
        <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#121C28]">Dashboard</h1>
            <p className="mt-0.5 text-sm text-[#737686]">
              Welcome back! Select a workspace or create a new one.
            </p>
          </div>
          <Button onClick={openCreate} className="w-full sm:w-auto cursor-pointer">
            <Plus className="mr-1.5 h-4 w-4" />
            New Workspace
          </Button>
        </div>

        {isLoading ? (
          <SkeletonWorkspaceTable />
        ) : workspaces.length === 0 ? (
          <div className="rounded-xl bg-white p-6 md:p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="mx-auto mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEF4FF] to-[#D6E4FF]">
              <Home className="h-8 w-8 md:h-10 md:w-10 text-[#2563EB]" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-[#121C28]">No workspaces yet</h2>
            <p className="mt-2 text-sm text-[#737686] max-w-md mx-auto">
              Workspaces are where your team collaborates on projects. Create your first workspace to get started.
            </p>
            <div className="mt-6 md:mt-8 flex items-center justify-center gap-4">
              <Button onClick={() => setShowOnboarding(true)} size="lg" className="w-full sm:w-auto cursor-pointer">
                <Plus className="mr-1.5 h-4 w-4" />
                Create your first workspace
              </Button>
            </div>
            <div className="mt-8 md:mt-10 grid gap-3 sm:grid-cols-3 max-w-lg mx-auto">
              <div className="rounded-lg bg-[#F8F9FF] p-4 text-left">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
                  <Home className="h-4 w-4 text-[#2563EB]" />
                </div>
                <p className="text-xs font-semibold text-[#121C28]">Invite your team</p>
                <p className="mt-0.5 text-[11px] text-[#737686]">Collaborate in real-time</p>
              </div>
              <div className="rounded-lg bg-[#F8F9FF] p-4 text-left">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
                  <svg className="h-4 w-4 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[#121C28]">Track tasks</p>
                <p className="mt-0.5 text-[11px] text-[#737686]">Organize with boards &amp; sprints</p>
              </div>
              <div className="rounded-lg bg-[#F8F9FF] p-4 text-left">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
                  <svg className="h-4 w-4 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[#121C28]">AI-powered</p>
                <p className="mt-0.5 text-[11px] text-[#737686]">Smart suggestions &amp; automation</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-light bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-border-light bg-bg-light/60">
                  <th className="w-10 px-3 py-3" />
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Workspace</th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Key</th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Type</th>
                  <th className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Lead</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {workspaces.map((ws) => (
                  <WorkspaceRow
                    key={ws.id}
                    ws={ws}
                    isOwner={ws.ownerId === user?.id}
                    leadName={leadName(ws)}
                    starred={!!starredWorkspaces[ws.id]}
                    onToggleStar={() => dispatch(toggleStarredWorkspace(ws.id))}
                    onDeleteRequest={() => setDeleteTarget(ws)}
                  />
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Create workspace dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create workspace" className="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-bg p-3 text-sm text-danger">{error}</div>
          )}
          <Input
            label="Workspace name"
            placeholder="e.g. Acme Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Description (optional)"
            placeholder="Team workspace for..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <WorkspaceTypePicker value={template} onChange={setTemplate} />
          <div>
            <label className="text-xs font-semibold text-text-secondary">Workspace icon</label>
            <div className="mt-1.5 grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAvatar(avatar === preset ? "" : preset)}
                  className={`flex items-center justify-center rounded-lg border p-1 transition-colors ${
                    avatar === preset
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border-light hover:border-border-default"
                  }`}
                  title="Use this icon"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preset} alt="preset" className="h-10 w-10 rounded-md object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete workspace confirm dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete workspace"
        className="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete <strong className="text-text">{deleteTarget?.name}</strong>?
            This will permanently remove all projects, tasks, and member associations. This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </Dialog>

      <OnboardingPopup open={showOnboarding} onClose={closeOnboarding} />
    </AppLayout>
  );
}