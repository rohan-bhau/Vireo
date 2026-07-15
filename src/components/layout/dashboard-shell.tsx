"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/store";
import { useLogoutMutation } from "@/store/authApi";
import { logout } from "@/store/authSlice";
import { clearTokens } from "@/lib/auth";
import { Sidebar } from "./sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

interface DashboardShellProps {
  workspaceId: string;
  workspaceName: string;
  children: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function DashboardShell({
  workspaceId,
  workspaceName,
  children,
  breadcrumb,
}: DashboardShellProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [doLogout] = useLogoutMutation();

  async function handleLogout() {
    try {
      await doLogout();
    } catch {}
    clearTokens();
    dispatch(logout());
    router.replace("/login");
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar workspaceId={workspaceId} workspaceName={workspaceName} />

        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-[#C3C6D7]/20 bg-white px-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C3C6D7]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  placeholder="Search tasks, projects, or docs..."
                  className="w-72 rounded-lg border border-[#C3C6D7]/50 bg-[#F8F9FF] py-2 pl-10 pr-3 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/ai-assistant"
                className="rounded-lg border border-[#C3C6D7]/50 px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
              >
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  AI Assistant
                </span>
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-[#C3C6D7]/20">
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-[#737686] hover:text-red-600 transition-colors"
                >
                  Sign out
                </button>
                <Link
                  href="/profile"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white"
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

          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-2 border-b border-[#C3C6D7]/20 bg-white px-6 py-3">
              {breadcrumb.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[#C3C6D7]">/</span>}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-[#737686] hover:text-[#121C28] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <h1 className="text-sm font-semibold text-[#121C28]">
                      {item.label}
                    </h1>
                  )}
                </div>
              ))}
            </div>
          )}

          <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
