"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { useLogoutMutation } from "@/store/authApi";
import { logout } from "@/store/authSlice";
import { clearTokens } from "@/lib/auth";
import { useGetWorkspaceQuery, useGetMembersQuery } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/auth-guard";

const sidebarLinks = [
  { label: "Dashboard", href: "", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Projects", href: "#", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { label: "Backlog", href: "#", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { label: "Board", href: "#", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { label: "Roadmap", href: "#", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "Reports", href: "#", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "Team Chat", href: "#", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
];

export default function WorkspaceHomePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const { data: workspace, isLoading, error } = useGetWorkspaceQuery(workspaceId);
  const { data: members = [] } = useGetMembersQuery(workspaceId);
  const [doLogout] = useLogoutMutation();

  async function handleLogout() {
    try { await doLogout(); } catch {}
    clearTokens();
    dispatch(logout());
    router.replace("/login");
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
          <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </AuthGuard>
    );
  }

  if (error || !workspace) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F9FF]">
          <p className="text-[#737686]">Workspace not found</p>
          <Link href="/workspaces"><Button variant="outline">Back to workspaces</Button></Link>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F8F9FF]">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-[#C3C6D7]/20 bg-white md:flex">
          <div className="border-b border-[#C3C6D7]/20 px-5 py-4">
            <Link href="/workspaces" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2563EB] text-xs font-bold text-white">
                V
              </div>
              <span className="text-sm font-bold text-[#121C28]">Vireo</span>
            </Link>
          </div>
          <div className="border-b border-[#C3C6D7]/20 px-5 py-3">
            <p className="text-xs font-medium text-[#737686]">{workspace.name}</p>
          </div>
          <nav className="flex-1 space-y-0.5 px-3 py-4">
            {sidebarLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href || `/w/${workspaceId}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  link.href === ""
                    ? "bg-[#EEF4FF] text-[#004AC6]"
                    : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                }`}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-[#C3C6D7]/20 px-5 py-3">
            <Link
              href={`/w/${workspaceId}/members`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Members
            </Link>
            <Link
              href={`/w/${workspaceId}/settings`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Settings
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-[#C3C6D7]/20 bg-white px-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  placeholder="Search tasks, projects, or docs..."
                  className="w-72 rounded-lg border border-[#C3C6D7]/50 bg-[#F8F9FF] py-2 pl-10 pr-3 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-lg border border-[#C3C6D7]/50 px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]">
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  AI Assistant
                </span>
              </button>
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
                  {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-[#121C28]">{workspace.name}</h1>
                <p className="mt-0.5 text-sm text-[#737686]">Dashboard overview</p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">Active Sprints</p>
                <p className="mt-2 text-3xl font-bold text-[#121C28]">{members.length > 0 ? "1" : "0"}</p>
                <p className="mt-1 text-xs text-green-600">Ready to start</p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">Team Members</p>
                <p className="mt-2 text-3xl font-bold text-[#121C28]">{members.length}</p>
                <p className="mt-1 text-xs text-[#737686]">{members.filter(m => m.role === "ADMIN").length} admin{members.filter(m => m.role === "ADMIN").length !== 1 ? "s" : ""}</p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">Projects</p>
                <p className="mt-2 text-3xl font-bold text-[#121C28]">0</p>
                <p className="mt-1 text-xs text-[#737686]">Coming in Phase 1.5</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h2 className="mb-3 text-sm font-semibold text-[#121C28]">Recent Activity</h2>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <svg className="mb-3 h-8 w-8 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  <p className="text-sm text-[#737686]">No recent activity</p>
                  <p className="text-xs text-[#C3C6D7] mt-1">Activity will appear once issues and projects are created</p>
                </div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h2 className="mb-3 text-sm font-semibold text-[#121C28]">Quick Actions</h2>
                <div className="space-y-2">
                  <Link
                    href={`/w/${workspaceId}/members`}
                    className="flex items-center gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-sm font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                    </svg>
                    Invite team members
                  </Link>
                  <Link
                    href={`/w/${workspaceId}/settings`}
                    className="flex items-center gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-sm font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    Workspace settings
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
