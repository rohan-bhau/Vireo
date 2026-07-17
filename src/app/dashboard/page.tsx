"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetWorkspacesQuery, useCreateWorkspaceMutation } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Home, Users } from "lucide-react";

export default function DashboardPage() {
  const { data: workspaces = [], isLoading } = useGetWorkspacesQuery();
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }
    try {
      const ws = await createWorkspace({ name: name.trim(), description: description.trim() || undefined }).unwrap();
      setShowCreate(false);
      setName("");
      setDescription("");
      window.location.href = `/w/${ws.id}`;
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create workspace");
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#121C28]">Dashboard</h1>
            <p className="mt-0.5 text-sm text-[#737686]">
              Welcome back! Select a workspace or create a new one.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
            <Plus className="mr-1.5 h-4 w-4" />
            New Workspace
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 md:py-20">
            <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
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
              <Button onClick={() => setShowCreate(true)} size="lg" className="w-full sm:w-auto">
                <Plus className="mr-1.5 h-4 w-4" />
                Create your first workspace
              </Button>
            </div>
            <div className="mt-8 md:mt-10 grid gap-3 sm:grid-cols-3 max-w-lg mx-auto">
              <div className="rounded-lg bg-[#F8F9FF] p-4 text-left">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
                  <Users className="h-4 w-4 text-[#2563EB]" />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/w/${ws.id}`}
                className="group rounded-xl bg-white p-5 md:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
              >
                <div className="mb-3 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#EEF4FF] text-base md:text-lg font-bold text-[#004AC6] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-[#121C28]">{ws.name}</h3>
                {ws.description && (
                  <p className="mt-1 text-sm text-[#737686] line-clamp-2">
                    {ws.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs text-[#737686]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  {ws.members?.length || 0} member{(ws.members?.length || 0) !== 1 ? "s" : ""}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create workspace">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
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
    </AppLayout>
  );
}
