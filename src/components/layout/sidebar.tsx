"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Columns3,
  Map,
  BarChart3,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";

interface SidebarProps {
  workspaceId: string;
  workspaceName: string;
}

const mainNav = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "Projects", href: "#", icon: FolderKanban },
  { label: "Backlog", href: "#", icon: ListTodo },
  { label: "Board", href: "#", icon: Columns3 },
  { label: "Roadmap", href: "#", icon: Map },
  { label: "Reports", href: "#", icon: BarChart3 },
  { label: "Team Chat", href: "chat", icon: MessageSquare },
];

const bottomNav = [
  { label: "Members", href: "members", icon: Users },
  { label: "Settings", href: "settings", icon: Settings },
];

export function Sidebar({ workspaceId, workspaceName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vireo_sidebar_collapsed") === "true";
    }
    return false;
  });

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("vireo_sidebar_collapsed", String(next));
      return next;
    });
  }

  function isActive(href: string) {
    if (href === "") return pathname === `/w/${workspaceId}`;
    if (href === "#") return false;
    return pathname.startsWith(`/w/${workspaceId}/${href}`);
  }

  return (
    <aside
      className={clsx(
        "flex flex-col border-r border-[#C3C6D7]/20 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-[#C3C6D7]/20 px-4">
        <Link href="/workspaces" className="flex items-center gap-3">
          <Image
            src="/vireo-icon.svg"
            alt="Vireo"
            width={28}
            height={28}
            className="shrink-0"
          />
          {!collapsed && (
            <span className="text-sm font-bold text-[#121C28]">Vireo</span>
          )}
        </Link>
      </div>

      {!collapsed && (
        <div className="border-b border-[#C3C6D7]/20 px-5 py-3">
          <p className="truncate text-xs font-medium text-[#737686]">
            {workspaceName}
          </p>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {mainNav.map((link) => {
          const active = isActive(link.href);
          const href =
            link.href === "#" || link.href === ""
              ? link.href === ""
                ? `/w/${workspaceId}`
                : "#"
              : `/w/${workspaceId}/${link.href}`;

          return (
            <Link
              key={link.label}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[#EEF4FF] text-[#004AC6]"
                  : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
              )}
              title={collapsed ? link.label : undefined}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#C3C6D7]/20 px-3 py-3">
        {bottomNav.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.label}
              href={`/w/${workspaceId}/${link.href}`}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[#EEF4FF] text-[#004AC6]"
                  : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
              )}
              title={collapsed ? link.label : undefined}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        <button
          onClick={toggleCollapse}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#737686] transition-colors hover:bg-[#F8F9FF] hover:text-[#121C28]"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
