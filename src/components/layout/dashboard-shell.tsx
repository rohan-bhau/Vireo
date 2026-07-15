"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AppLayout } from "./app-layout";

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
  return (
    <AppLayout sidebarProps={{ workspaceId, workspaceName }}>
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-white px-5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
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
      {children}
    </AppLayout>
  );
}
