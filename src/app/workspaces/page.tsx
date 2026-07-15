"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { useLogoutMutation } from "@/store/authApi";
import { logout } from "@/store/authSlice";
import { clearTokens } from "@/lib/auth";
import { useGetWorkspacesQuery, useCreateWorkspaceMutation } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function WorkspacesPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const { data: workspaces = [], isLoading } = useGetWorkspacesQuery();
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const [doLogout] = useLogoutMutation();

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

  async function handleLogout() {
    try {
      await doLogout();
    } catch {
      // proceed
    }
    clearTokens();
    dispatch(logout());
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8F9FF]">
        <header className="border-b border-[#C3C6D7]/20 bg-white">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight text-[#121C28]">
                Vireo
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white"
              >
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "U"}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-[#434655] transition-colors hover:text-red-600"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#121C28]">Workspaces</h1>
              <p className="mt-1 text-sm text-[#737686]">
                Select a workspace to get started
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)}>New Workspace</Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="rounded-xl bg-white p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FF]">
                <svg className="h-8 w-8 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#121C28]">No workspaces yet</h2>
              <p className="mt-1 text-sm text-[#737686]">
                Create your first workspace to start collaborating.
              </p>
              <Button className="mt-6" onClick={() => setShowCreate(true)}>
                Create Workspace
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/w/${ws.id}`}
                  className="group rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#EEF4FF] text-lg font-bold text-[#004AC6] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
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
        </main>

        <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create workspace">
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
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
      </div>
    </AuthGuard>
  );
}
