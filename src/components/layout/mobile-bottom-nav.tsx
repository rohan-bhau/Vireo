"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { usePathname, useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { setActiveTab } from "@/store/workspaceSlice";
import { useCreateWorkspaceMutation } from "@/store/workspaceApi";
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
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MAX_VISIBLE = 5;

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
  reports: BarChart3,
};

function getTabIcon(tabId: string, label: string) {
  const Icon = TAB_ICONS[tabId];
  if (Icon) return Icon;
  return FileText;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const workspaceId = params?.workspaceId as string | undefined;

  const tabConfig = useSelector(
    (state: RootState) => state.workspace.tabsByWorkspace[workspaceId ?? ""]
  );
  const activeTab = tabConfig?.activeTab;

  const rawTabs = tabConfig?.tabs;
  const tabs = useMemo(() => rawTabs ?? [], [rawTabs]);

  const [showMore, setShowMore] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const allTabIds = useMemo(() => tabs.map((t) => t.id), [tabs]);

  const [visibleTabIds, setVisibleTabIds] = useState<string[]>(() => []);

  useEffect(() => {
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
  }, [allTabIds]);

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
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create workspace");
    }
  }

  const isInWorkspace =
    pathname.startsWith("/w/") && !!workspaceId && tabs.length > 0;

  if (isInWorkspace) {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#C3C6D7]/20 md:hidden safe-area-bottom">
          <div className="flex items-center justify-around px-1">
            {maxVisible.map((tab) => {
              const Icon = getTabIcon(tab.id, tab.label);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium transition-colors min-w-0 flex-1 min-h-[52px] px-1",
                    isActive
                      ? "text-[#004AC6]"
                      : "text-[#737686] hover:text-[#121C28]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate max-w-full leading-tight">
                    {tab.label}
                  </span>
                </button>
              );
            })}
            {hasMore && (
              <button
                onClick={() => setShowMore(true)}
                className="flex flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium transition-colors min-w-0 flex-1 min-h-[52px] px-1 text-[#737686] hover:text-[#121C28]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF4FF]">
                  <span className="text-xs font-bold text-[#004AC6]">+</span>
                </div>
                <span className="truncate max-w-full leading-tight">More</span>
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
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={() => setShowMore(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white pb-8 shadow-xl md:hidden"
              >
                <div className="flex items-center justify-center pt-3 pb-1">
                  <div className="h-1 w-10 rounded-full bg-[#C3C6D7]" />
                </div>
                <div className="px-4 pb-2">
                  <h3 className="text-sm font-semibold text-[#121C28]">
                    More tabs
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto px-2">
                  {hiddenTabs.map((tab, i) => {
                    const Icon = getTabIcon(tab.id, tab.label);
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
                            ? "bg-[#EEF4FF] text-[#004AC6]"
                            : "text-[#434655] hover:bg-[#F8F9FF]"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                        {isActive && (
                          <span className="ml-auto text-[11px] font-medium text-[#2563EB]">
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-[#C3C6D7]/20 bg-white md:hidden">
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
                "flex flex-col items-center justify-center gap-0.5 px-3 text-[10px] font-medium transition-colors min-h-[44px] min-w-[64px]",
                isActive
                  ? "text-[#004AC6]"
                  : "text-[#737686] hover:text-[#121C28]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="leading-tight">{item.label}</span>
            </a>
          );
        })}

        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center justify-center gap-0.5 px-3 text-[10px] font-medium text-[#2563EB] transition-colors hover:text-[#1d4ed8] min-h-[44px] min-w-[64px]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg">
            <Plus className="h-5 w-5" />
          </div>
          <span className="leading-tight">Create</span>
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
