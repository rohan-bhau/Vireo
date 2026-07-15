"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { AppNavbar } from "./app-navbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { AuthGuard } from "@/components/auth/auth-guard";

interface AppLayoutProps {
  children: ReactNode;
  sidebarProps?: {
    workspaceId?: string;
    workspaceName?: string;
  };
}

export function AppLayout({ children, sidebarProps }: AppLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <div className="hidden md:flex">
          <Sidebar
            workspaceId={sidebarProps?.workspaceId}
            workspaceName={sidebarProps?.workspaceName}
          />
        </div>
        <div className="flex flex-1 flex-col min-w-0 pb-16 md:pb-0">
          <AppNavbar />
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </AuthGuard>
  );
}
