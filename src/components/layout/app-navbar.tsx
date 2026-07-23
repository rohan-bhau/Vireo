"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import type { RootState, AppDispatch } from "@/store";
import { toggleSidebar } from "@/store/sidebarSlice";
import { PanelLeftClose, PanelLeft, Menu, Sparkles, HelpCircle, Settings } from "lucide-react";
import Link from "next/link";
import { SiteSwitcher } from "@/components/nav/site-switcher";
import { SearchBar } from "@/components/nav/search-bar";
import { NotificationBell } from "@/components/nav/notification-bell";
import { UserAvatarMenu } from "@/components/nav/user-avatar-menu";
import { KeyboardShortcutsModal } from "@/components/nav/keyboard-shortcuts-modal";

interface AppNavbarProps {
  onMobileMenuToggle?: () => void;
}

export function AppNavbar({ onMobileMenuToggle }: AppNavbarProps) {
  const { collapsed } = useSelector((state: RootState) => state.sidebar);
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const isInWorkspace = pathname.startsWith("/w/");
  const workspaceId = isInWorkspace ? pathname.split("/")[2] : null;

  const handleShortcutsKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          setShortcutsOpen(true);
        }
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleShortcutsKey);
    return () => document.removeEventListener("keydown", handleShortcutsKey);
  }, [handleShortcutsKey]);

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
          <button className="flex items-center gap-1.5 rounded-[3px] bg-[#0052CC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0065FF] transition-colors shadow-sm whitespace-nowrap cursor-pointer">
            <span className="text-base leading-none">+</span>
            <span>Create</span>
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href="/ai-assistant"
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
            title="AI Assistant"
          >
            <Sparkles className="h-5 w-5" />
          </Link>

          <NotificationBell />

          <button
            onClick={() => setShortcutsOpen(true)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
            title="Keyboard shortcuts"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {workspaceId ? (
            <Link
              href={`/w/${workspaceId}/admin`}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
              title="Admin settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
          ) : (
            <button
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}

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
        <button className="flex items-center gap-1 rounded-[3px] bg-[#0052CC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0065FF] transition-colors shadow-sm cursor-pointer">
          <span className="text-base leading-none">+</span>
        </button>
      </div>

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
}
