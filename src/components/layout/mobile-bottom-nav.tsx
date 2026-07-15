"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  LayoutDashboard,
  Sparkles,
  UserCircle,
  Plus,
  FolderKanban,
  ListTodo,
  Columns3,
  Map,
  BarChart3,
  MessageSquare,
  Users,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";
import { useState, useRef, useEffect } from "react";
import { useCreateWorkspaceMutation } from "@/store/workspaceApi";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const dashboardNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { label: "Profile", href: "/profile", icon: UserCircle },
];

const workspaceMainNav = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "Projects", href: "#", icon: FolderKanban },
  { label: "Backlog", href: "#", icon: ListTodo },
  { label: "Board", href: "#", icon: Columns3 },
  { label: "Roadmap", href: "#", icon: Map },
  { label: "Reports", href: "#", icon: BarChart3 },
  { label: "Chat", href: "chat", icon: MessageSquare },
];

const workspaceBottomNav = [
  { label: "Members", href: "members", icon: Users },
  { label: "Settings", href: "settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const params = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isInWorkspace = pathname.startsWith("/w/");
  const workspaceId = params?.workspaceId as string | undefined;

  useEffect(() => {
    if (scrollRef.current) {
      const activeItem = scrollRef.current.querySelector("[data-active='true']");
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [pathname]);

  function isWorkspaceActive(href: string) {
    if (href === "") return pathname === `/w/${workspaceId}`;
    if (href === "#") return false;
    return pathname.startsWith(`/w/${workspaceId}/${href}`);
  }

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

  if (isInWorkspace && workspaceId) {
    const allItems = [...workspaceMainNav, ...workspaceBottomNav];
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#C3C6D7]/20 md:hidden">
        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto px-2 py-1 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {allItems.map((item) => {
            const active = isWorkspaceActive(item.href);
            const href =
              item.href === "" || item.href === "#"
                ? item.href === ""
                  ? `/w/${workspaceId}`
                  : "#"
                : `/w/${workspaceId}/${item.href}`;

            return (
              <Link
                key={item.label}
                href={href}
                data-active={active}
                className={clsx(
                  "flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors min-w-[64px]",
                  active
                    ? "bg-[#EEF4FF] text-[#004AC6]"
                    : "text-[#737686] hover:text-[#121C28]"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[#C3C6D7]/20 bg-white md:hidden">
        {dashboardNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[#004AC6]"
                  : "text-[#737686] hover:text-[#121C28]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-[10px] font-medium text-[#2563EB] transition-colors hover:text-[#1d4ed8]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg">
            <Plus className="h-5 w-5" />
          </div>
          <span>Create</span>
        </button>
      </nav>

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
    </>
  );
}
