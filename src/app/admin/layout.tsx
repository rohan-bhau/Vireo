"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  LayoutDashboard,
  Users,
  Shield,
  GitBranch,
  Puzzle,
  CreditCard,
  Settings,
  UserPlus,
  ArrowLeft,
  Lock,
  Monitor,
  Globe,
} from "lucide-react";
import { clsx } from "clsx";

const adminNavItems = [
  { href: "/admin", label: "Products", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/groups", label: "Groups", icon: UserPlus },
  { href: "/admin/workflows", label: "Workflows", icon: GitBranch },
  { href: "/admin/permission-schemes", label: "Permission Schemes", icon: Shield },
  { href: "/admin/issue-security", label: "Issue Security", icon: Lock },
  { href: "/admin/screens", label: "Screens", icon: Monitor },
  { href: "/admin/custom-fields", label: "Custom Fields", icon: Puzzle },
  { href: "/admin/system", label: "System", icon: Globe },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-[#C3C6D7]" />
          <h2 className="text-lg font-semibold text-[#121C28]">Access Denied</h2>
          <p className="mt-1 text-sm text-[#737686]">Only site administrators can access this area.</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:text-[#1d4ed8]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-[#C3C6D7]/20 bg-white p-3 lg:block">
        <div className="mb-4 flex items-center gap-2 px-3 py-2">
          <Settings className="h-4 w-4 text-[#121C28]" />
          <span className="text-sm font-bold text-[#121C28]">Administration</span>
        </div>
        <nav className="space-y-0.5">
          {adminNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#EEF4FF] text-[#004AC6]"
                    : "text-[#434655] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-[#C3C6D7]/20 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#737686] hover:text-[#121C28] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Vireo
          </Link>
        </div>
      </aside>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
