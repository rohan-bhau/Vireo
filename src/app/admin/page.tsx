"use client";

import { useGetAdminOverviewQuery } from "@/store/adminApi";
import {
  LayoutDashboard, Users, FolderKanban, Shield, Building2,
  UserPlus, Lock, Monitor, Puzzle, Globe, CreditCard,
} from "lucide-react";
import Link from "next/link";

const statCards = [
  { key: "totalUsers" as const, label: "Total Users", icon: Users, color: "bg-blue-50 text-blue-600", href: "/admin/users" },
  { key: "adminUsers" as const, label: "Administrators", icon: Shield, color: "bg-purple-50 text-purple-600", href: "/admin/users" },
  { key: "totalWorkspaces" as const, label: "Workspaces", icon: Building2, color: "bg-green-50 text-green-600", href: "/dashboard" },
  { key: "totalProjects" as const, label: "Projects", icon: FolderKanban, color: "bg-orange-50 text-orange-600", href: "/dashboard" },
  { key: "totalPermissionSchemes" as const, label: "Permission Schemes", icon: Shield, color: "bg-cyan-50 text-cyan-600", href: "/admin/permission-schemes" },
];

const quickLinks = [
  { label: "User Management", desc: "Invite, remove, and manage user roles", href: "/admin/users", icon: Users },
  { label: "Groups", desc: "Create and manage user groups", href: "/admin/groups", icon: UserPlus },
  { label: "Permission Schemes", desc: "Configure project-level permissions", href: "/admin/permission-schemes", icon: Shield },
  { label: "Issue Security", desc: "Restrict issue visibility per security level", href: "/admin/issue-security", icon: Lock },
  { label: "Workflows", desc: "View all system and custom workflows", href: "/admin/workflows", icon: LayoutDashboard },
  { label: "Screens", desc: "Configure fields per issue type", href: "/admin/screens", icon: Monitor },
  { label: "Custom Fields", desc: "Add custom data fields to issues", href: "/admin/custom-fields", icon: Puzzle },
  { label: "System Settings", desc: "Site branding and mail server config", href: "/admin/system", icon: Globe },
  { label: "Billing", desc: "Subscription and payment management", href: "/admin/billing", icon: CreditCard },
];

export default function AdminProductsPage() {
  const { data: overview, isLoading } = useGetAdminOverviewQuery();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#121C28]">Products</h1>
        <p className="mt-1 text-sm text-[#737686]">Site overview and administration hub.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const value = overview?.[stat.key] ?? 0;
            return (
              <Link key={stat.key} href={stat.href} className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#121C28]">{String(value)}</p>
                    <p className="text-xs font-medium text-[#737686]">{stat.label}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-[#121C28]">Administration</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-[#C3C6D7]/20 bg-white p-5 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF4FF]">
                <link.icon className="h-3.5 w-3.5 text-[#004AC6]" />
              </div>
              <h3 className="text-sm font-semibold text-[#121C28]">{link.label}</h3>
              <p className="mt-0.5 text-xs text-[#737686]">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
