"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetWorkspacesQuery, useCreateWorkspaceMutation } from "@/store/workspaceApi";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Columns3,
  Map,
  BarChart3,
  MessageSquare,
  Users,
  Settings,
  Plus,
  Grid3X3,
  UserCircle,
} from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  workspaceId?: string;
  workspaceName?: string;
}

const mainNav = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "Backlog", href: "#", icon: ListTodo },
  { label: "Board", href: "#", icon: Columns3 },
  { label: "Roadmap", href: "#", icon: Map },
  { label: "Reports", href: "#", icon: BarChart3 },
  { label: "Team Chat", href: "chat", icon: MessageSquare },
];

const bottomNav = [
  { label: "Members", href: "members", icon: Users },
  { label: "Settings", href: "settings", icon: Settings },
];

export function Sidebar({ workspaceId, workspaceName }: SidebarProps) {
  const pathname = usePathname();
  const collapsed = useSelector((state: RootState) => state.sidebar.collapsed);
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const isInWorkspace = pathname.startsWith("/w/") && !!workspaceId;

  function isActive(href: string) {
    if (!isInWorkspace) return false;
    if (href === "") return pathname === `/w/${workspaceId}`;
    if (href === "#") return false;
    return pathname.startsWith(`/w/${workspaceId}/${href}`);
  }

  function isDashboardActive() {
    return pathname === "/dashboard";
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!newName.trim()) {
      setCreateError("Workspace name is required");
      return;
    }
    try {
      const ws = await createWorkspace({ name: newName.trim(), description: newDescription.trim() || undefined }).unwrap();
      setShowCreate(false);
      setNewName("");
      setNewDescription("");
      window.location.href = `/w/${ws.id}`;
    } catch (err: any) {
      setCreateError(err?.data?.message || "Failed to create workspace");
    }
  }

  return (
    <>
      <aside
        className={clsx(
          "flex flex-col border-r border-[#C3C6D7]/20 bg-white transition-all duration-200 shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center border-b border-[#C3C6D7]/20 px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/vireo-icon.svg"
              alt="Vireo"
              width={28}
              height={28}
              className="shrink-0"
            />
            {!collapsed && (
              <span className="text-sm font-bold text-[#121C28]">Vireo</span>
            )}
          </Link>
        </div>

        {isInWorkspace && !collapsed && workspaceName && (
          <div className="border-b border-[#C3C6D7]/20 px-5 py-3">
            <p className="truncate text-xs font-medium text-[#737686]">
              {workspaceName}
            </p>
          </div>
        )}

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {isInWorkspace ? (
            <>
              {mainNav.map((link) => {
                const active = isActive(link.href);
                const href =
                  link.href === "#" || link.href === ""
                    ? link.href === ""
                      ? `/w/${workspaceId}`
                      : "#"
                    : `/w/${workspaceId}/${link.href}`;

                return (
                  <Link
                    key={link.label}
                    href={href}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#EEF4FF] text-[#004AC6]"
                        : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                    )}
                    title={collapsed ? link.label : undefined}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{link.label}</span>}
                  </Link>
                );
              })}
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isDashboardActive()
                    ? "bg-[#EEF4FF] text-[#004AC6]"
                    : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                )}
                title={collapsed ? "Dashboard" : undefined}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Dashboard</span>}
              </Link>

              {!collapsed && workspaces.length > 0 && (
                <div className="pt-4 pb-1">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#737686]">
                    My Workspaces
                  </p>
                </div>
              )}

              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/w/${ws.id}`}
                  className={clsx(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === `/w/${ws.id}`
                      ? "bg-[#EEF4FF] text-[#004AC6]"
                      : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                  )}
                  title={collapsed ? ws.name : undefined}
                >
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-[#EEF4FF] text-[10px] font-bold text-[#004AC6]">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  {!collapsed && (
                    <span className="truncate">{ws.name}</span>
                  )}
                </Link>
              ))}

              <button
                onClick={() => setShowCreate(true)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-[#2563EB] hover:bg-[#EEF4FF]"
                )}
                title={collapsed ? "Create workspace" : undefined}
              >
                <Plus className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Create workspace</span>}
              </button>

              {!collapsed && (
                <div className="pt-4 pb-1">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#737686]">
                    Spaces
                  </p>
                </div>
              )}

              <Link
                href="/dashboard"
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isDashboardActive()
                    ? "bg-[#EEF4FF] text-[#004AC6]"
                    : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                )}
                title={collapsed ? "All workspaces" : undefined}
              >
                <Grid3X3 className="h-4 w-4 shrink-0" />
                {!collapsed && <span>All workspaces</span>}
              </Link>
            </>
          )}
        </nav>

        {isInWorkspace && (
          <div className="border-t border-[#C3C6D7]/20 px-3 py-3">
            {bottomNav.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={`/w/${workspaceId}/${link.href}`}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#EEF4FF] text-[#004AC6]"
                      : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                  )}
                  title={collapsed ? link.label : undefined}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </div>
        )}

        {!isInWorkspace && (
          <div className="border-t border-[#C3C6D7]/20 px-3 py-3">
            <Link
              href="/profile"
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/profile"
                  ? "bg-[#EEF4FF] text-[#004AC6]"
                  : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
              )}
              title={collapsed ? "Profile" : undefined}
            >
              <UserCircle className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Profile</span>}
            </Link>
          </div>
        )}
      </aside>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create workspace">
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{createError}</div>
          )}
          <Input
            label="Workspace name"
            placeholder="e.g. Acme Engineering"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Input
            label="Description (optional)"
            placeholder="Team workspace for..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
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
    </>
  );
}
