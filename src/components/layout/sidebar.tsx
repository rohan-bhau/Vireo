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
import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";
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
  Folders,
  Columns3,
  ListOrdered,
  Bug,
  BookOpen,
  LayoutList,
  Filter,
  ExternalLink,
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SkeletonSidebarItem } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SidebarCustomizeDialog } from "@/components/nav/sidebar-customize-dialog";
import {
  addRecentWorkspace,
  toggleStarredWorkspace,
  setActiveWorkspace,
} from "@/store/workspaceSlice";

interface SidebarProps {
  workspaceId?: string;
  workspaceName?: string;
  onNavigate?: () => void;
  embedded?: boolean;
}

const projectNavItems = [
  { key: "board", label: "Board", icon: Columns3 },
  { key: "backlog", label: "Backlog", icon: ListOrdered },
  { key: "issues", label: "Issues", icon: Bug },
  { key: "reports", label: "Reports", icon: LayoutList },
];

const dashboards = [
  { label: "Default Dashboard", href: "/dashboard" },
];

const savedFilters = [
  { label: "Assigned to me", query: "assignee = currentUser()" },
  { label: "Recently updated", query: "updated >= -7d" },
  { label: "High priority", query: "priority = High" },
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
        <div className="flex items-center justify-center rounded-lg px-3 py-2 text-[#737686]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#737686] hover:text-[#121C28] transition-colors cursor-pointer"
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
  const [createError, setCreateError] = useState<string | null>(null);
  const [forYouExpanded, setForYouExpanded] = useState(true);
  const [starredExpanded, setStarredExpanded] = useState(true);
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [dashboardsExpanded, setDashboardsExpanded] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [forYouMessage, setForYouMessage] = useState<string | null>(null);

  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId
  );
  const currentWsId = workspaceId || activeWorkspaceId;

  const { data: projects = [], isLoading: projectsLoading } =
    useGetWorkspaceProjectsQuery(currentWsId ?? "", { skip: !currentWsId });

  const isInWorkspace = pathname.startsWith("/w/") && !!workspaceId;

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

  function toggleProjectExpanded(projectId: string) {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
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

  return (
    <>
      <motion.aside
        animate={embedded ? undefined : { width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={embedded ? "flex flex-col bg-white" : "flex h-full flex-col border-r border-[#C3C6D7]/20 bg-white shrink-0 overflow-hidden"}
      >
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-3">
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#737686] hover:bg-[#F8F9FF] cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Activity feed
                  {forYouMessage && (
                    <span className="ml-auto text-[10px] text-[#2563EB] font-medium animate-pulse">
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
                <p className="px-3 py-1.5 text-xs text-[#737686]">
                  Star items for quick access
                </p>
              )}
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
                <p className="px-3 py-1.5 text-xs text-[#737686]">
                  No recent workspaces
                </p>
              )}
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
            </CollapsibleSection>
          )}

          {/* Dashboard link */}
          <SidebarNavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active={isDashboardActive()}
          />

          {/* Projects */}
          {visibleSections.projects && isInWorkspace && (
            <CollapsibleSection
              label="Projects"
              icon={Folders}
              collapsed={collapsed}
              expanded={projectsExpanded}
              onToggle={() => setProjectsExpanded(!projectsExpanded)}
            >
              {projectsLoading && (
                <>
                  <SkeletonSidebarItem />
                  <SkeletonSidebarItem />
                </>
              )}
              {projects.length === 0 && !projectsLoading && (
                <p className="px-3 py-1.5 text-xs text-[#737686]">
                  No projects yet
                </p>
              )}
              {projects.map((project) => (
                <div key={project.id}>
                  <button
                    onClick={() => toggleProjectExpanded(project.id)}
                    className={clsx(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[38px]",
                      "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                    )}
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-[9px] font-bold text-white">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate flex-1 text-left">{project.name}</span>
                    {expandedProjects[project.id] ? (
                      <ChevronDown className="h-3 w-3 shrink-0 text-[#737686]" />
                    ) : (
                      <ChevronRight className="h-3 w-3 shrink-0 text-[#737686]" />
                    )}
                  </button>
                  {expandedProjects[project.id] && (
                    <div className="ml-2 space-y-0.5 border-l border-[#C3C6D7]/30 pl-2">
                      {projectNavItems.map((item) => (
                        <Link
                          key={item.key}
                          href={`/w/${workspaceId}/${item.key}`}
                          onClick={onNavigate}
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors min-h-[32px]"
                        >
                          <item.icon className="h-3.5 w-3.5 shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CollapsibleSection>
          )}

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
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors min-h-[38px]"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0 text-[#737686]" />
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
              {savedFilters.map((f) => (
                <Link
                  key={f.label}
                  href={`/search?q=${encodeURIComponent(f.query)}`}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors min-h-[38px]"
                >
                  <Filter className="h-4 w-4 shrink-0 text-[#737686]" />
                  <span className="truncate">{f.label}</span>
                </Link>
              ))}
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
                  collapsed={collapsed}
                  isStarred={!!starredWorkspaces[ws.id]}
                  isActive={pathname === `/w/${ws.id}`}
                  onStarToggle={() => dispatch(toggleStarredWorkspace(ws.id))}
                  onNavigate={() => handleNavigate(ws.id)}
                />
              ))}
            </CollapsibleSection>
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

      <SidebarCustomizeDialog
        open={showCustomize}
        onClose={() => setShowCustomize(false)}
      />
    </>
  );
}
