"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
} from "@/store/workspaceApi";
import {
  LayoutDashboard,
  Plus,
  Star,
  History,
  Sparkles,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Settings2,
  Columns3,
  Map,
  BarChart3,
  MessageSquare,
  Bot,
  ListOrdered,
  Shield,
  History as HistoryIcon,
  ExternalLink,
  LayoutGrid,
  Settings,
  CreditCard,
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  addRecentWorkspace,
  toggleStarredWorkspace,
  setActiveWorkspace,
  setVisibleSections,
  setVisibleMenuItems,
} from "@/store/workspaceSlice";

interface SidebarProps {
  workspaceId?: string;
  workspaceName?: string;
  onNavigate?: () => void;
  embedded?: boolean;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const extraMenuItems: MenuItem[] = [
  { key: "board", label: "Board", icon: Columns3, href: "" },
  { key: "list", label: "List", icon: ListOrdered, href: "list" },
  { key: "reports", label: "Reports", icon: BarChart3, href: "reports" },
  { key: "roadmap", label: "Roadmap", icon: Map, href: "roadmap" },
  { key: "teamChat", label: "Team Chat", icon: MessageSquare, href: "chat" },
  { key: "automation", label: "Automation", icon: Bot, href: "automation" },
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid, href: "dashboard" },
  { key: "admin", label: "Admin", icon: Shield, href: "admin" },
  { key: "auditLog", label: "Audit Log", icon: HistoryIcon, href: "audit-log" },
  { key: "integrations", label: "Integrations", icon: ExternalLink, href: "integrations" },
  { key: "settings", label: "Settings", icon: Settings, href: "settings" },
  { key: "billing", label: "Billing", icon: CreditCard, href: "settings/billing" },
];

function WorkspaceMenuItem({
  workspaceId,
  name,
  collapsed,
  isStarred,
  onStarToggle,
  isActive,
  onNavigate,
}: {
  workspaceId: string;
  name: string;
  collapsed: boolean;
  isStarred: boolean;
  onStarToggle: () => void;
  isActive: boolean;
  onNavigate: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className="group relative">
      <Link
        href={`/w/${workspaceId}`}
        onClick={onNavigate}
        className={clsx(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] cursor-pointer",
          isActive
            ? "bg-[#EEF4FF] text-[#004AC6]"
            : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
        )}
        title={collapsed ? name : undefined}
      >
        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-[#EEF4FF] text-[10px] font-bold text-[#004AC6]">
          {name.charAt(0).toUpperCase()}
        </div>
        {!collapsed && <span className="truncate flex-1">{name}</span>}
        {!collapsed && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-[#737686] hover:text-[#121C28] transition-opacity cursor-pointer"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        )}
      </Link>
      {showMenu && !collapsed && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-[#C3C6D7]/20 bg-white py-1 shadow-lg"
        >
          <button
            onClick={() => {
              onStarToggle();
              setShowMenu(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[#434655] hover:bg-[#F8F9FF]"
          >
            <Star
              className={clsx(
                "h-3.5 w-3.5",
                isStarred && "fill-yellow-400 text-yellow-400"
              )}
            />
            {isStarred ? "Unstar" : "Star"}
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ workspaceId, onNavigate, embedded }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const collapsed = useSelector((state: RootState) => state.sidebar.collapsed);
  const {
    recentWorkspaces,
    starredWorkspaces,
    visibleSections,
    visibleMenuItems,
  } = useSelector((state: RootState) => state.workspace);
  const { data: workspaces = [] } = useGetWorkspacesQuery();

  const [createWorkspace, { isLoading: isCreating }] =
    useCreateWorkspaceMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(true);
  const [starredExpanded, setStarredExpanded] = useState(true);
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [forYouMessage, setForYouMessage] = useState<string | null>(null);

  const isInWorkspace = pathname.startsWith("/w/") && !!workspaceId;

  const starredList = workspaces.filter((ws) => starredWorkspaces[ws.id]);
  const recentList = workspaces.filter((ws) =>
    recentWorkspaces.includes(ws.id)
  );
  const forYouList = workspaces.filter(
    (ws) => !recentWorkspaces.includes(ws.id) && !starredWorkspaces[ws.id]
  );

  const visibleExtraItems = extraMenuItems.filter(
    (item) => visibleMenuItems[item.key as keyof typeof visibleMenuItems]
  );

  function isDashboardActive() {
    return pathname === "/dashboard";
  }

  function handleNavigate(wsId: string) {
    dispatch(setActiveWorkspace(wsId));
    dispatch(addRecentWorkspace(wsId));
    onNavigate?.();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!newName.trim()) {
      setCreateError("Workspace name is required");
      return;
    }
    try {
      const ws = await createWorkspace({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      }).unwrap();
      setShowCreate(false);
      setNewName("");
      setNewDescription("");
      dispatch(setActiveWorkspace(ws.id));
      dispatch(addRecentWorkspace(ws.id));
      window.location.href = `/w/${ws.id}`;
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to create workspace";
      setCreateError(message);
    }
  }

  return (
    <>
      <motion.aside
        animate={embedded ? undefined : { width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={embedded ? "flex flex-col bg-white" : "flex h-full flex-col border-r border-[#C3C6D7]/20 bg-white shrink-0 overflow-hidden"}
      >
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {visibleSections.forYou && (
            <div>
              {!collapsed ? (
                <button
                  onClick={() => {
                    setForYouMessage("Coming soon!");
                    setTimeout(() => setForYouMessage(null), 2000);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#737686] hover:text-[#121C28] transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  For You
                  {forYouMessage && (
                    <span className="ml-auto text-[10px] text-[#2563EB] font-medium animate-pulse">
                      {forYouMessage}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setForYouMessage("Coming soon!");
                    setTimeout(() => setForYouMessage(null), 2000);
                  }}
                  className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-[#737686] hover:text-[#121C28] transition-colors cursor-pointer"
                  title="For You"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {visibleSections.starred && (
            <div>
              {!collapsed && (
                <button
                  onClick={() => setStarredExpanded(!starredExpanded)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#737686] hover:text-[#121C28] transition-colors cursor-pointer"
                >
                  {starredExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <Star className="h-3 w-3" />
                  Starred
                </button>
              )}
              {starredExpanded && starredList.length > 0 && (
                <div className="space-y-0.5 mt-0.5">
                  {starredList.map((ws) => (
                    <WorkspaceMenuItem
                      key={ws.id}
                      workspaceId={ws.id}
                      name={ws.name}
                      collapsed={collapsed}
                      isStarred={true}
                      isActive={pathname === `/w/${ws.id}`}
                      onStarToggle={() => dispatch(toggleStarredWorkspace(ws.id))}
                      onNavigate={() => handleNavigate(ws.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {visibleSections.recent && recentList.length > 0 && (
            <div>
              {!collapsed && (
                <button
                  onClick={() => setRecentExpanded(!recentExpanded)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#737686] hover:text-[#121C28] transition-colors cursor-pointer"
                >
                  {recentExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <History className="h-3 w-3" />
                  Recent
                </button>
              )}
              {recentExpanded && (
                <div className="space-y-0.5 mt-0.5">
                  {recentList.map((ws) => (
                    <WorkspaceMenuItem
                      key={ws.id}
                      workspaceId={ws.id}
                      name={ws.name}
                      collapsed={collapsed}
                      isStarred={!!starredWorkspaces[ws.id]}
                      isActive={pathname === `/w/${ws.id}`}
                      onStarToggle={() => dispatch(toggleStarredWorkspace(ws.id))}
                      onNavigate={() => handleNavigate(ws.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={collapsed}
            active={isDashboardActive()}
            onNavigate={onNavigate}
          />

          {visibleExtraItems.length > 0 && isInWorkspace && (
            <div>
              {!collapsed && (
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#737686]">
                  Menu
                </p>
              )}
              {visibleExtraItems.map((item) => (
                <NavItem
                  key={item.key}
                  href={`/w/${workspaceId}/${item.href}`}
                  icon={item.icon}
                  label={item.label}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  active={
                    item.href === ""
                      ? pathname === `/w/${workspaceId}`
                      : pathname.startsWith(`/w/${workspaceId}/${item.href}`)
                  }
                />
              ))}
            </div>
          )}

          {visibleSections.allWorkspaces && workspaces.length > 0 && (
            <div>
              {!collapsed && (
                <button
                  onClick={() => setAllExpanded(!allExpanded)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#737686] hover:text-[#121C28] transition-colors cursor-pointer"
                >
                  {allExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  All Workspaces
                </button>
              )}
              {allExpanded && (
                <div
                  className={clsx(
                    collapsed ? "space-y-0.5" : "space-y-0.5 mt-0.5"
                  )}
                >
                  {workspaces.map((ws) => (
                    <WorkspaceMenuItem
                      key={ws.id}
                      workspaceId={ws.id}
                      name={ws.name}
                      collapsed={collapsed}
                      isStarred={!!starredWorkspaces[ws.id]}
                      isActive={pathname === `/w/${ws.id}`}
                      onStarToggle={() =>
                        dispatch(toggleStarredWorkspace(ws.id))
                      }
                      onNavigate={() => handleNavigate(ws.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="border-t border-[#C3C6D7]/20 px-2 py-2 space-y-1">
          {!collapsed && (
            <button
              onClick={() => setShowCustomize(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors min-h-[44px] cursor-pointer"
            >
              <Settings2 className="h-4 w-4 shrink-0" />
              <span>Customize</span>
            </button>
          )}

          <button
            onClick={() => setShowCreate(true)}
            className={clsx(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-[#2563EB] hover:bg-[#EEF4FF] min-h-[44px] cursor-pointer",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Create workspace" : undefined}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Create workspace</span>}
          </button>
        </div>
      </motion.aside>

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create workspace"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {createError}
            </div>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={showCustomize}
        onClose={() => setShowCustomize(false)}
        title="Customize Sidebar"
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#737686]">
              Sections
            </p>
            <div className="space-y-1">
              {(
                [
                  { key: "forYou" as const, label: "For You" },
                  { key: "starred" as const, label: "Starred" },
                  { key: "recent" as const, label: "Recent" },
                  { key: "allWorkspaces" as const, label: "All Workspaces" },
                ] as const
              ).map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#F8F9FF] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleSections[key]}
                    onChange={() =>
                      dispatch(
                        setVisibleSections({ [key]: !visibleSections[key] })
                      )
                    }
                    className="h-4 w-4 rounded border-[#C3C6D7] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span className="text-sm font-medium text-[#121C28]">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="border-t border-[#C3C6D7]/20 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#737686]">
              Menu Items
            </p>
            <div className="space-y-1">
              {extraMenuItems.map((item) => {
                const key = item.key as keyof typeof visibleMenuItems;
                return (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#F8F9FF] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleMenuItems[key]}
                      onChange={() =>
                        dispatch(
                          setVisibleMenuItems({ [key]: !visibleMenuItems[key] })
                        )
                      }
                      className="h-4 w-4 rounded border-[#C3C6D7] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <item.icon className="h-4 w-4 text-[#737686]" />
                    <span className="text-sm font-medium text-[#121C28]">
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
  active,
  onNavigate,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={clsx(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] cursor-pointer",
        active
          ? "bg-[#EEF4FF] text-[#004AC6]"
          : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
