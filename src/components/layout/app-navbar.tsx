"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import type { RootState, AppDispatch } from "@/store";
import { useLogoutMutation } from "@/store/authApi";
import { logout } from "@/store/authSlice";
import { clearTokens } from "@/lib/auth";
import { toggleSidebar } from "@/store/sidebarSlice";
import {
  PanelLeftClose,
  PanelLeft,
  Menu,
  Sparkles,
  Bell,
  User,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { useGetUnreadCountQuery } from "@/store/notificationApi";

interface AppNavbarProps {
  onMobileMenuToggle?: () => void;
}

export function AppNavbar({ onMobileMenuToggle }: AppNavbarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { collapsed } = useSelector((state: RootState) => state.sidebar);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [doLogout] = useLogoutMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isInWorkspace = pathname.startsWith("/w/");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  async function handleLogout() {
    try {
      await doLogout();
    } catch {}
    clearTokens();
    dispatch(logout());
    router.replace("/login");
  }

  function handleAccountSettings() {
    setComingSoon("Account settings coming soon!");
    setTimeout(() => setComingSoon(null), 2000);
  }

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-[#C3C6D7]/20 bg-white px-3 md:px-4">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-[#434655] transition-colors hover:bg-[#F8F9FF]"
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
          className="flex md:hidden h-11 w-11 items-center justify-center rounded-lg text-[#434655] transition-colors hover:bg-[#F8F9FF]"
          title="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/vireo-icon.svg" alt="Vireo" width={24} height={24} className="shrink-0 md:w-7 md:h-7" />
          <span className="hidden sm:inline text-sm font-bold text-[#121C28]">Vireo</span>
        </Link>

        {isInWorkspace && (
          <span className="hidden md:inline-block h-4 w-px bg-[#C3C6D7]/40 mx-1" />
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Link
          href="/search"
          className="flex items-center gap-1.5 rounded-lg border border-[#C3C6D7]/50 px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Search</span>
        </Link>

        <Link
          href="/ai-assistant"
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-[#C3C6D7]/50 px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Assistant</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-[#C3C6D7]/20">
          <Link
            href="/notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#737686] transition-colors hover:bg-[#F8F9FF] hover:text-[#121C28]"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-[#2563EB] text-[10px] md:text-xs font-bold text-white hover:bg-[#1d4ed8] transition-colors"
            >
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U"}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#C3C6D7]/20 bg-white shadow-lg z-50">
                <div className="border-b border-[#C3C6D7]/20 px-4 py-3">
                  <p className="text-sm font-semibold text-[#121C28]">{user?.name || "User"}</p>
                  <p className="text-xs text-[#737686] truncate">{user?.email || ""}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[#434655] hover:bg-[#F8F9FF] transition-colors cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>

                  <button
                    onClick={handleAccountSettings}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#434655] hover:bg-[#F8F9FF] transition-colors relative cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    Account Settings
                    {comingSoon && (
                      <span className="ml-auto text-[10px] text-[#2563EB] font-medium animate-pulse">
                        {comingSoon}
                      </span>
                    )}
                  </button>
                </div>

                <div className="border-t border-[#C3C6D7]/20 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
