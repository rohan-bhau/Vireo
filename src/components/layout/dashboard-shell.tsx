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
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-surface px-5 py-3 shadow-card">
          {breadcrumb.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-text-tertiary">/</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-text-tertiary hover:text-text transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <h1 className="text-sm font-semibold text-text">
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
