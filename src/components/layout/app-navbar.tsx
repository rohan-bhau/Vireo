"use client";

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
import { PanelLeftClose, PanelLeft, Sparkles } from "lucide-react";

export function AppNavbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { collapsed } = useSelector((state: RootState) => state.sidebar);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [doLogout] = useLogoutMutation();

  const isInWorkspace = pathname.startsWith("/w/");

  async function handleLogout() {
    try {
      await doLogout();
    } catch {}
    clearTokens();
    dispatch(logout());
    router.replace("/login");
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
          href="/ai-assistant"
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-[#C3C6D7]/50 px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Assistant</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-[#C3C6D7]/20">
          <button
            onClick={handleLogout}
            className="hidden md:inline text-xs font-medium text-[#737686] transition-colors hover:text-red-600"
          >
            Sign out
          </button>
          <Link
            href="/profile"
            className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-[#2563EB] text-[10px] md:text-xs font-bold text-white hover:bg-[#1d4ed8] transition-colors"
          >
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "U"}
          </Link>
        </div>
      </div>
    </header>
  );
}
