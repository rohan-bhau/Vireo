"use client";

import { useState, useMemo } from "react";
import { usePathname, useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { setActiveTab } from "@/store/workspaceSlice";
import {
  useCreateWorkspaceMutation,
  useGetMembersQuery,
  useGetWorkspaceQuery,
} from "@/store/workspaceApi";
import {
  LayoutDashboard,
  Sparkles,
  UserCircle,
  Plus,
  ListTodo,
  Columns3,
  Map,
  BarChart3,
  FileText,
} from "lucide-react";
import { settingsNavItems, type SettingsSection } from "@/lib/settings-nav";
import { useGetSubscriptionQuery } from "@/store/billingApi";
import { hasFeature } from "@/lib/plans";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MAX_VISIBLE = 5;

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

const dashboardNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { label: "Profile", href: "/profile", icon: UserCircle },
];

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  board: Columns3,
  list: ListTodo,
  summary: LayoutDashboard,
  roadmap: Map,
  timeline: Map,
  reports: BarChart3,
};

function getTabIcon(tabId: string) {
  const Icon = TAB_ICONS[tabId];
  if (Icon) return Icon;
  return FileText;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const workspaceId = params?.workspaceId as string | undefined;

  const { user } = useSelector((state: RootState) => state.auth);
  const { data: workspace } = useGetWorkspaceQuery(workspaceId ?? "", {
    skip: !workspaceId,
  });
  const { data: members = [] } = useGetMembersQuery(workspaceId ?? "", {
    skip: !workspaceId,
  });

  const currentMember = members.find((m) => m.userId === user?.id);
  const isWorkspaceAdmin = currentMember?.role === "ADMIN";
  const isWorkspaceOwner = workspace?.ownerId === user?.id;

  const tabConfig = useSelector(
    (state: RootState) => state.workspace.tabsByWorkspace[workspaceId ?? ""]
  );
  const activeTab = tabConfig?.activeTab;

  const { data: subscription } = useGetSubscriptionQuery(workspaceId ?? "", {
    skip: !workspaceId,
  });
  const canUseRoadmap = hasFeature(subscription?.plan, "roadmap");

  const rawTabs = tabConfig?.tabs;
  const tabs = useMemo(
    () => (rawTabs ?? []).filter((t) => t.id !== "timeline" || canUseRoadmap),
    [rawTabs, canUseRoadmap]
  );

  const [showMore, setShowMore] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const allTabIds = useMemo(() => tabs.map((t) => t.id), [tabs]);

  const [visibleTabIds, setVisibleTabIds] = useState<string[]>(() => []);
  const [prevAllTabIds, setPrevAllTabIds] = useState<string[] | null>(null);
  if (prevAllTabIds !== allTabIds) {
    setPrevAllTabIds(allTabIds);
    setVisibleTabIds((prev) => {
      if (allTabIds.length === 0) {
        if (prev.length === 0) return prev;
        return [];
      }
      const existing = prev.filter((id) => allTabIds.includes(id));
      if (existing.length > 0) {
        if (existing.length === prev.length && existing.every((id, i) => id === prev[i])) {
          return prev;
        }
        return existing;
      }
      const next = allTabIds.slice(0, MAX_VISIBLE - 1);
      if (next.length === prev.length && next.every((id, i) => id === prev[i])) {
        return prev;
      }
      return next;
    });
  }

  const hiddenTabs = useMemo(
    () => tabs.filter((t) => !visibleTabIds.includes(t.id)),
    [tabs, visibleTabIds]
  );
  const hasMore = hiddenTabs.length > 0;

  const visibleTabs = useMemo(
    () => tabs.filter((t) => visibleTabIds.includes(t.id)),
    [tabs, visibleTabIds]
  );

  const maxVisible = useMemo(
    () =>
      hasMore && visibleTabs.length > MAX_VISIBLE - 1
        ? visibleTabs.slice(0, MAX_VISIBLE - 1)
        : visibleTabs,
    [visibleTabs, hasMore]
  );

  function handleTabClick(tabId: string) {
    if (!workspaceId) return;
    dispatch(setActiveTab({ workspaceId, tabId }));
  }

  function handleSelectFromMore(tabId: string) {
    if (!workspaceId) return;
    dispatch(setActiveTab({ workspaceId, tabId }));
    setVisibleTabIds((prev) => {
      const lastId = prev[prev.length - 1];
      return prev.map((id) => (id === lastId ? tabId : id));
    });
    setShowMore(false);
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
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      setError(message || "Failed to create workspace");
    }
  }

  const isInWorkspace =
    pathname.startsWith("/w/") && !!workspaceId && tabs.length > 0;

  const settingsBase = `/w/${workspaceId}/settings`;
  const isInSettings =
    !!workspaceId && pathname.startsWith(settingsBase);

  const settingsSegments = pathname.split("/").filter(Boolean);
  const settingsLast = settingsSegments[settingsSegments.length - 1];
  const activeSettings: SettingsSection =
    settingsLast === "settings" ||
    !settingsNavItems.some((n) => n.id === settingsLast)
      ? "details"
      : (settingsLast as SettingsSection);

  const visibleSettings = settingsNavItems.filter(
    (item) =>
      !ADMIN_ONLY_SETTINGS.includes(item.id) || isWorkspaceAdmin || isWorkspaceOwner
  );
  const visibleSettingsItems = visibleSettings.slice(0, MAX_VISIBLE);
  const hiddenSettingsItems = visibleSettings.slice(MAX_VISIBLE);

  if (isInSettings) {
    return (
      <>
        <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden">
          <div
            className={clsx(
              "flex items-center justify-around gap-1 rounded-2xl border border-border-light",
              "bg-surface/95 px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur",
              "pb-[env(safe-area-inset-bottom)]"
            )}
          >
            {visibleSettingsItems.map((item) => {
              const isActive = activeSettings === item.id;
              return (
                <a
                  key={item.id}
                  href={`/w/${workspaceId}/settings/${item.id}`}
                  className={clsx(
                    "relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-text-tertiary hover:text-text"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />
                  )}
                  <item.icon className="h-5 w-5" />
                  <span className="max-w-full truncate leading-tight">
                    {item.label}
                  </span>
                </a>
              );
            })}
            {hiddenSettingsItems.length > 0 && (
              <button
                onClick={() => setShowMore(true)}
                className={clsx(
                  "flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                  "text-text-tertiary hover:text-text"
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border-light bg-bg-light">
                  <Plus className="h-3.5 w-3.5" />
                </span>
                <span className="max-w-full truncate leading-tight">More</span>
              </button>
            )}
          </div>
        </nav>

        <AnimatePresence>
          {showMore && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/50 md:hidden cursor-pointer"
                onClick={() => setShowMore(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-surface pb-8 shadow-modal md:hidden"
              >
                <div className="flex items-center justify-center pt-3 pb-1">
                  <div className="h-1 w-10 rounded-full bg-border-light" />
                </div>
                <div className="px-4 pb-2">
                  <h3 className="text-sm font-semibold text-text">
                    More settings
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto px-2">
                  {hiddenSettingsItems.map((item, i) => {
                    const isActive = activeSettings === item.id;
                    return (
                      <motion.a
                        key={item.id}
                        href={`/w/${workspaceId}/settings/${item.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setShowMore(false)}
                        className={clsx(
                          "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors min-h-[48px]",
                          isActive
                            ? "bg-primary-bg text-primary"
                            : "text-text-secondary hover:bg-bg-light"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto text-[11px] font-medium text-primary">
                            Active
                          </span>
                        )}
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  if (isInWorkspace) {
    return (
      <>
        <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden">
          <div
            className={clsx(
              "flex items-center justify-around gap-1 rounded-2xl border border-border-light",
              "bg-surface/95 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur",
              "px-2 pb-[env(safe-area-inset-bottom)]"
            )}
          >
            {maxVisible.map((tab) => {
              const Icon = getTabIcon(tab.id);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={clsx(
                    "relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-text-tertiary hover:text-text"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />
                  )}
                  <Icon className="h-5 w-5" />
                  <span className="max-w-full truncate leading-tight">
                    {tab.label}
                  </span>
                </button>
              );
            })}
            {hasMore && (
              <button
                onClick={() => setShowMore(true)}
                className={clsx(
                  "flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                  "text-text-tertiary hover:text-text"
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border-light bg-bg-light">
                  <Plus className="h-3.5 w-3.5" />
                </span>
                <span className="max-w-full truncate leading-tight">More</span>
              </button>
            )}
          </div>
        </nav>

        <AnimatePresence>
          {showMore && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/50 md:hidden cursor-pointer"
                onClick={() => setShowMore(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-surface pb-8 shadow-modal md:hidden"
              >
                <div className="flex items-center justify-center pt-3 pb-1">
                  <div className="h-1 w-10 rounded-full bg-border-light" />
                </div>
                <div className="px-4 pb-2">
                  <h3 className="text-sm font-semibold text-text">
                    More tabs
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto px-2">
                  {hiddenTabs.map((tab, i) => {
                    const Icon = getTabIcon(tab.id);
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSelectFromMore(tab.id)}
                        className={clsx(
                          "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors min-h-[48px]",
                          isActive
                            ? "bg-primary-bg text-primary"
                            : "text-text-secondary hover:bg-bg-light"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                        {isActive && (
                          <span className="ml-auto text-[11px] font-medium text-primary">
                            Active
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <div
          className={clsx(
            "flex items-center justify-around gap-1 rounded-2xl border border-border-light",
            "bg-surface/95 px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur",
            "pb-[env(safe-area-inset-bottom)]"
          )}
        >
          {dashboardNav.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <a
                key={item.label}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors min-h-[48px] min-w-[60px]",
                  isActive
                    ? "text-primary"
                    : "text-text-tertiary hover:text-text"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="leading-tight">{item.label}</span>
              </a>
            );
          })}

          <button
            onClick={() => {
              if (pathname === "/dashboard") {
                document.dispatchEvent(new CustomEvent("vireo:create-workspace"));
                return;
              }
              setShowCreate(true);
            }}
            className="flex flex-col items-center justify-center gap-0.5 px-3 text-[10px] font-medium text-primary transition-colors hover:text-primary-dark min-h-[48px] min-w-[60px]"
          >
            <span className="-mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-surface">
              <Plus className="h-5 w-5" />
            </span>
            <span className="leading-tight">Create</span>
          </button>
        </div>
      </nav>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create workspace">
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
