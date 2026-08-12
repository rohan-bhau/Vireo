"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useGetMembersQuery,
} from "@/store/workspaceApi";
import { WorkspaceTypePicker } from "@/components/workspace/workspace-type-picker";
import type { ProjectTemplate } from "@/store/projectApi";
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
  ArrowLeft,
  Filter,
  ExternalLink,
} from "lucide-react";
import { settingsNavItems, type SettingsSection } from "@/lib/settings-nav";

const ADMIN_ONLY_SETTINGS: SettingsSection[] = [
  "permissions",
  "issue-types",
  "workflows",
  "fields",
  "roles",
  "versions",
  "components",
  "automation",
];
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SkeletonSidebarItem } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SidebarCustomizeDialog } from "@/components/nav/sidebar-customize-dialog";
import { PRESET_AVATARS } from "@/lib/avatar-utils";
import { toastSuccess } from "@/lib/toast";
import {
  addRecentWorkspace,
  toggleStarredWorkspace,
  setActiveWorkspace,
} from "@/store/workspaceSlice";
import { useGetWorkspaceFiltersQuery } from "@/store/savedFilterApi";

interface SidebarProps {
  workspaceId?: string;
  workspaceName?: string;
  onNavigate?: () => void;
  embedded?: boolean;
}

const dashboards = [
  { label: "Default Dashboard", href: "/dashboard" },
];

const hardcodedFilters = [
  { label: "Assigned to me", query: "assignee = currentUser()" },
  { label: "Recently updated", query: "updated >= -7d" },
  { label: "High priority", query: "priority = High" },
];

function WorkspaceMenuItem({
  workspaceId,
  name,
  avatar,
  collapsed,
  isStarred,
  onStarToggle,
  isActive,
  onNavigate,
}: {
  workspaceId: string;
  name: string;
  avatar?: string | null;
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
            ? "bg-surface-active text-primary"
            : "text-text-secondary hover:bg-bg-light hover:text-text"
        )}
        title={collapsed ? name : undefined}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={name}
            className="h-4 w-4 shrink-0 rounded-[4px] object-cover"
          />
        ) : (
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-primary-bg text-[10px] font-bold text-primary">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        {!collapsed && <span className="truncate flex-1">{name}</span>}
        {!collapsed && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-text-tertiary hover:text-text transition-opacity cursor-pointer"
            aria-label="Workspace menu"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        )}
      </Link>
      {showMenu && !collapsed && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border-light bg-surface py-1 shadow-dropdown"
        >
          <button
            onClick={() => {
              onStarToggle();
              setShowMenu(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-light"
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

function CollapsibleSection({
  label,
  icon: Icon,
  collapsed,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  if (collapsed) {
    return (
      <div title={label}>
        <div className="flex items-center justify-center rounded-lg px-3 py-2 text-text-tertiary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary hover:text-text transition-colors cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <Icon className="h-3 w-3" />
        {label}
      </button>
      {expanded && <div className="space-y-0.5 mt-0.5">{children}</div>}
    </div>
  );
}

function SavedFiltersSection({ workspaceId, onNavigate }: { workspaceId?: string; onNavigate?: () => void }) {
  const { data: apiFilters = [] } = useGetWorkspaceFiltersQuery(workspaceId ?? "", { skip: !workspaceId });

  const allFilters = [
    ...hardcodedFilters.map((f) => ({ id: f.label, name: f.label, query: f.query, isHardcoded: true as const })),
    ...apiFilters.map((f) => ({ id: f._id, name: f.name, query: f.jql || "", isHardcoded: false as const })),
  ];

  if (allFilters.length === 0) {
    return <p className="px-3 py-1.5 text-xs text-text-tertiary">No saved filters</p>;
  }

  return (
    <>
      {allFilters.map((f) => (
        <Link
          key={f.id}
          href={`/search?q=${encodeURIComponent(f.query)}`}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-light hover:text-text transition-colors min-h-[38px] cursor-pointer"
        >
          <Filter className="h-4 w-4 shrink-0 text-text-tertiary" />
          <span className="truncate">{f.name}</span>
        </Link>
      ))}
    </>
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
  } = useSelector((state: RootState) => state.workspace);
  const { data: workspaces = [], isLoading: workspacesLoading } = useGetWorkspacesQuery();

  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTemplate, setNewTemplate] = useState<ProjectTemplate>("KANBAN");
  const [newAvatar, setNewAvatar] = useState<string>("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [forYouExpanded, setForYouExpanded] = useState(true);
  const [starredExpanded, setStarredExpanded] = useState(true);
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [dashboardsExpanded, setDashboardsExpanded] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [forYouMessage, setForYouMessage] = useState<string | null>(null);

  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId
  );
  const currentWsId = workspaceId || activeWorkspaceId;

  const { data: members = [] } = useGetMembersQuery(currentWsId ?? "", {
    skip: !currentWsId,
  });
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const currentMember = members.find((m) => m.userId === currentUserId);

  const isInWorkspace = pathname.startsWith("/w/") && !!workspaceId;
  const canAccessSettings = isInWorkspace && !!currentWsId;
  const isWorkspaceAdmin = currentMember?.role === "ADMIN";
  const isWorkspaceOwner =
    !!currentWsId &&
    workspaces.find((ws) => ws.id === currentWsId)?.ownerId === currentUserId;
  const visibleSettingsItems = settingsNavItems.filter(
    (item) =>
      !ADMIN_ONLY_SETTINGS.includes(item.id) || isWorkspaceAdmin || isWorkspaceOwner
  );

  const settingsBase = `/w/${currentWsId}/settings`;
  const inSettings = canAccessSettings && pathname.startsWith(settingsBase);
  const settingsSegments = pathname.split("/").filter(Boolean);
  const settingsLast = settingsSegments[settingsSegments.length - 1];
  const activeSettings: SettingsSection =
    settingsLast === "settings" ||
    !settingsNavItems.some((n) => n.id === settingsLast)
      ? "details"
      : (settingsLast as SettingsSection);

  const starredList = workspaces.filter((ws) => starredWorkspaces[ws.id]);
  const recentList = workspaces.filter((ws) =>
    recentWorkspaces.includes(ws.id)
  );
  const forYouList = workspaces.filter(
    (ws) => !recentWorkspaces.includes(ws.id) && !starredWorkspaces[ws.id]
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
        template: newTemplate,
        avatar: newAvatar || undefined,
      }).unwrap();
      setShowCreate(false);
      setNewName("");
      setNewDescription("");
      setNewTemplate("KANBAN");
      setNewAvatar("");
      dispatch(setActiveWorkspace(ws.id));
      dispatch(addRecentWorkspace(ws.id));
      toastSuccess(`Workspace "${ws.name}" created`);
      window.location.href = `/w/${ws.id}`;
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to create workspace";
      setCreateError(message);
    }
  }

  function SidebarNavItem({
    href,
    icon: Icon,
    label,
    active,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
  }) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={clsx(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] cursor-pointer",
          active
            ? "bg-surface-active text-primary"
            : "text-text-secondary hover:bg-bg-light hover:text-text"
        )}
        title={collapsed ? label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  }

  return (
    <>
      <motion.aside
        animate={embedded ? undefined : { width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={embedded ? "flex flex-col bg-surface" : "flex h-full flex-col border-r border-border-light bg-surface shrink-0 overflow-hidden"}
      >
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {inSettings ? (
            <>
              <Link
                href={`/w/${currentWsId}`}
                onClick={onNavigate}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] text-text-secondary hover:bg-bg-light hover:text-text",
                  collapsed && "justify-center"
                )}
                title={collapsed ? "Back to workspace" : undefined}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Back</span>}
              </Link>

              {!collapsed && (
                <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                  Settings
                </p>
              )}

              {visibleSettingsItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/w/${currentWsId}/settings/${item.id}`}
                  onClick={onNavigate}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] cursor-pointer",
                    collapsed && "justify-center",
                    activeSettings === item.id
                      ? "bg-primary-bg text-primary"
                      : "text-text-secondary hover:bg-bg-light hover:text-text"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </>
          ) : (
            <>
          {/* For You */}
          {visibleSections.forYou && (
            <CollapsibleSection
              label="For You"
              icon={Sparkles}
              collapsed={collapsed}
              expanded={forYouExpanded}
              onToggle={() => setForYouExpanded(!forYouExpanded)}
            >
              {forYouList.length > 0 ? (
                forYouList.map((ws) => (
                  <WorkspaceMenuItem
                    key={ws.id}
                    workspaceId={ws.id}
                    name={ws.name}
                    avatar={ws.avatar}
                    collapsed={collapsed}
                    isStarred={false}
                    isActive={pathname === `/w/${ws.id}`}
                    onStarToggle={() => dispatch(toggleStarredWorkspace(ws.id))}
                    onNavigate={() => handleNavigate(ws.id)}
                  />
                ))
              ) : (
                <div
                  onClick={() => {
                    setForYouMessage("Coming soon!");
                    setTimeout(() => setForYouMessage(null), 2000);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-text-tertiary hover:bg-bg-light cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Activity feed
                  {forYouMessage && (
                    <span className="ml-auto text-[10px] text-primary font-medium animate-pulse">
                      {forYouMessage}
                    </span>
                  )}
                </div>
              )}
            </CollapsibleSection>
          )}

          {/* Starred */}
          {visibleSections.starred && (
            <CollapsibleSection
              label="Starred"
              icon={Star}
              collapsed={collapsed}
              expanded={starredExpanded}
              onToggle={() => setStarredExpanded(!starredExpanded)}
            >
              {workspacesLoading && (
                <>
                  <SkeletonSidebarItem />
                  <SkeletonSidebarItem />
                </>
              )}
              {starredList.length === 0 && !workspacesLoading && (
                <p className="px-3 py-1.5 text-xs text-text-tertiary">
                  Star items for quick access
                </p>
              )}
              {starredList.map((ws) => (
                <WorkspaceMenuItem
                  key={ws.id}
                  workspaceId={ws.id}
                  name={ws.name}
                  avatar={ws.avatar}
                  collapsed={collapsed}
                  isStarred={true}
                  isActive={pathname === `/w/${ws.id}`}
                  onStarToggle={() => dispatch(toggleStarredWorkspace(ws.id))}
                  onNavigate={() => handleNavigate(ws.id)}
                />
              ))}
            </CollapsibleSection>
          )}

          {/* Recent */}
          {visibleSections.recent && (
            <CollapsibleSection
              label="Recent"
              icon={History}
              collapsed={collapsed}
              expanded={recentExpanded}
              onToggle={() => setRecentExpanded(!recentExpanded)}
            >
              {workspacesLoading && (
                <>
                  <SkeletonSidebarItem />
                  <SkeletonSidebarItem />
                </>
              )}
              {recentList.length === 0 && !workspacesLoading && (
                <p className="px-3 py-1.5 text-xs text-text-tertiary">
                  No recent workspaces
                </p>
              )}
              {recentList.map((ws) => (
                <WorkspaceMenuItem
                  key={ws.id}
                  workspaceId={ws.id}
name={ws.name}
                  avatar={ws.avatar}
                  collapsed={collapsed}
                  isStarred={!!starredWorkspaces[ws.id]}
                  isActive={pathname === `/w/${ws.id}`}
                  onStarToggle={() => dispatch(toggleStarredWorkspace(ws.id))}
                  onNavigate={() => handleNavigate(ws.id)}
                />
              ))}
            </CollapsibleSection>
          )}

          {/* Dashboard link */}
          <SidebarNavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active={isDashboardActive()}
          />

          {/* AI Assistant */}
          <SidebarNavItem
            href="/ai-assistant"
            icon={Sparkles}
            label="AI Assistant"
            active={pathname.startsWith("/ai-assistant")}
          />

          {/* Dashboards */}
          {visibleSections.dashboards && !collapsed && (
            <CollapsibleSection
              label="Dashboards"
              icon={LayoutDashboard}
              collapsed={collapsed}
              expanded={dashboardsExpanded}
              onToggle={() => setDashboardsExpanded(!dashboardsExpanded)}
            >
              {dashboards.map((db) => (
                <Link
                  key={db.label}
                  href={db.href}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-light hover:text-text transition-colors min-h-[38px] cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0 text-text-tertiary" />
                  <span className="truncate">{db.label}</span>
                </Link>
              ))}
            </CollapsibleSection>
          )}

          {/* Filters */}
          {visibleSections.filters && !collapsed && (
            <CollapsibleSection
              label="Filters"
              icon={Filter}
              collapsed={collapsed}
              expanded={filtersExpanded}
              onToggle={() => setFiltersExpanded(!filtersExpanded)}
            >
              <SavedFiltersSection workspaceId={currentWsId ?? undefined} onNavigate={onNavigate} />
            </CollapsibleSection>
          )}

          {/* All Workspaces */}
          {workspaces.length > 0 && (
            <CollapsibleSection
              label="All Workspaces"
              icon={ExternalLink}
              collapsed={collapsed}
              expanded={true}
              onToggle={() => {}}
            >
              {workspaces.map((ws) => (
                <WorkspaceMenuItem
                  key={ws.id}
                  workspaceId={ws.id}
name={ws.name}
                  avatar={ws.avatar}
                  collapsed={collapsed}
                  isStarred={!!starredWorkspaces[ws.id]}
                  isActive={pathname === `/w/${ws.id}`}
                  onStarToggle={() => dispatch(toggleStarredWorkspace(ws.id))}
                  onNavigate={() => handleNavigate(ws.id)}
                />
              ))}
            </CollapsibleSection>
            )}
          </>
        )}
        </nav>

        <div className="border-t border-border-light px-2 py-2 space-y-1">
          {canAccessSettings && (
            <Link
              href={`/w/${currentWsId}/settings`}
              onClick={() => onNavigate?.()}
              className={clsx(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-tertiary hover:bg-bg-light hover:text-text transition-colors min-h-[44px]",
                collapsed && "justify-center",
                pathname.startsWith(`/w/${currentWsId}/settings`) &&
                  "bg-bg-light text-text"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings2 className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Link>
          )}

          {!collapsed && (
            <button
              onClick={() => setShowCustomize(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-tertiary hover:bg-bg-light hover:text-text transition-colors min-h-[44px] cursor-pointer"
            >
              <Settings2 className="h-4 w-4 shrink-0" />
              <span>Customize</span>
            </button>
          )}

          <button
            onClick={() => setShowCreate(true)}
            className={clsx(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-primary hover:bg-primary-bg min-h-[44px] cursor-pointer",
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
            <div className="rounded-lg bg-danger-bg p-3 text-sm text-danger">
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
          <WorkspaceTypePicker value={newTemplate} onChange={setNewTemplate} />
          <div>
            <label className="text-xs font-semibold text-text-secondary">Workspace icon</label>
            <div className="mt-1.5 grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewAvatar(newAvatar === preset ? "" : preset)}
                  className={`flex items-center justify-center rounded-lg border p-1 transition-colors ${
                    newAvatar === preset
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border-light hover:border-border-default"
                  }`}
                  title="Use this icon"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preset} alt="preset" className="h-8 w-8 rounded-md object-cover" />
                </button>
              ))}
            </div>
          </div>
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

      <SidebarCustomizeDialog
        open={showCustomize}
        onClose={() => setShowCustomize(false)}
      />
    </>
  );
}
