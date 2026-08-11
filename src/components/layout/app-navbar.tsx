"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "@/store";
import { toggleSidebar } from "@/store/sidebarSlice";
import { PanelLeftClose, PanelLeft, Menu, Sparkles, HelpCircle, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useGetWorkspacesQuery } from "@/store/workspaceApi";
import { SiteSwitcher } from "@/components/nav/site-switcher";
import { SearchBar } from "@/components/nav/search-bar";
import { NotificationBell } from "@/components/nav/notification-bell";
import { UserAvatarMenu } from "@/components/nav/user-avatar-menu";
import { KeyboardShortcutsModal } from "@/components/nav/keyboard-shortcuts-modal";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { useHotkey } from "@/hooks/use-hotkeys";

interface AppNavbarProps {
  onMobileMenuToggle?: () => void;
  onToggleChat?: () => void;
}

export function AppNavbar({ onMobileMenuToggle, onToggleChat }: AppNavbarProps) {
  const { collapsed } = useSelector((state: RootState) => state.sidebar);
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const [createWorkspaceId, setCreateWorkspaceId] = useState<string | null>(null);

  const isInWorkspace = pathname.startsWith("/w/");
  const pathWorkspaceId = isInWorkspace ? pathname.split("/")[2] : null;
  const activeWorkspaceId = useSelector((state: RootState) => state.workspace.activeWorkspaceId);
  const workspaceId = pathWorkspaceId || activeWorkspaceId;
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: workspaces = [] } = useGetWorkspacesQuery(undefined, {
    skip: !settingsOpen && !createMenuOpen,
  });
  const myWorkspaces = workspaces.filter((ws) => ws.ownerId === user?.id);

  useHotkey("?", () => setShortcutsOpen(true));
  useHotkey("c", () => setCreateDialogOpen(true));

  useEffect(() => {
    function handle(event: CustomEvent) { setCreateDialogOpen(true); }
    window.addEventListener("vireo:create-issue", handle as EventListener);
    return () => window.removeEventListener("vireo:create-issue", handle as EventListener);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
    }
    if (settingsOpen || createMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [settingsOpen, createMenuOpen]);

  function handleWorkspaceClick(wsId: string) {
    setSettingsOpen(false);
    router.push(`/w/${wsId}/settings`);
  }

  return (
    <>
      <header className="flex h-14 md:h-[56px] items-center justify-between border-b border-border-light bg-surface px-3 md:px-4 shrink-0">
        {/* Left section */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-[3px] text-text-secondary transition-colors hover:bg-bg-light"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={onMobileMenuToggle}
            className="flex md:hidden h-11 w-11 items-center justify-center rounded-[3px] text-text-secondary transition-colors hover:bg-bg-light"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <Image
              src="/vireo-icon.svg"
              alt="Vireo"
              width={24}
              height={24}
              className="shrink-0 md:w-7 md:h-7"
            />
          </Link>

          <div className="hidden md:block">
            <SiteSwitcher />
          </div>
        </div>

        {/* Center section */}
        <div className="flex items-center gap-3 flex-1 justify-center px-4 max-md:hidden">
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
          <div ref={createMenuRef} className="relative">
            <button
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              className="flex items-center gap-1.5 rounded-[3px] bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap cursor-pointer"
            >
              <span className="text-base leading-none">+</span>
              <span>Create</span>
            </button>

            {createMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-[3px] border border-border-light bg-surface shadow-dropdown z-50">
                <div className="border-b border-border-light px-4 py-3">
                  <p className="text-sm font-semibold text-text">Create Task</p>
                  <p className="text-xs text-text-tertiary">
                    Choose a workspace to create the task in.
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {myWorkspaces.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-text-tertiary">
                      You haven't created any workspaces yet.
                    </p>
                  ) : (
                    myWorkspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setCreateWorkspaceId(ws.id);
                          setCreateMenuOpen(false);
                          setCreateDialogOpen(true);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-bg-light cursor-pointer"
                      >
                        {ws.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ws.avatar}
                            alt={ws.name}
                            className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-bg text-xs font-bold text-primary">
                            {ws.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-secondary">
                          {ws.name}
                        </span>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-text-tertiary" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={onToggleChat}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
            title="AI Assistant"
            aria-label="AI Assistant"
          >
            <Sparkles className="h-5 w-5" />
          </button>

          <NotificationBell />

          <button
            onClick={() => setShortcutsOpen(true)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
            title="Keyboard shortcuts"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <div ref={settingsRef} className="relative hidden md:block">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-[3px] border border-border-light bg-surface shadow-dropdown z-50">
                <div className="border-b border-border-light px-4 py-3">
                  <p className="text-sm font-semibold text-text">Workspace Settings</p>
                  <p className="text-xs text-text-tertiary">
                    Choose a workspace you own to manage its settings.
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {myWorkspaces.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-text-tertiary">
                      You haven't created any workspaces yet.
                    </p>
                  ) : (
                    myWorkspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => handleWorkspaceClick(ws.id)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-bg-light cursor-pointer"
                      >
                        {ws.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ws.avatar}
                            alt={ws.name}
                            className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-bg text-xs font-bold text-primary">
                            {ws.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-secondary">
                          {ws.name}
                        </span>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-text-tertiary" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pl-2 ml-1 border-l border-border-light">
            <UserAvatarMenu />
          </div>
        </div>
      </header>

      {/* Mobile search + create row */}
      <div className="flex items-center gap-2 border-b border-border-light bg-surface px-3 py-2 md:hidden">
        <div className="flex-1">
          <SearchBar />
        </div>
        <button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-1 rounded-[3px] bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm cursor-pointer"
          aria-label="Create"
        >
          <span className="text-base leading-none">+</span>
        </button>
      </div>

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <CreateTaskDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          workspaceId={createWorkspaceId || workspaceId || undefined}
        />
    </>
  );
}
