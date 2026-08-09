"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import {
  Settings2,
  Users,
  ShieldCheck,
  Bell,
  Tag,
  GitBranch,
  List,
  Shield,
  Package,
  Puzzle,
  Zap,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

type SettingsSection =
  | "details"
  | "people"
  | "permissions"
  | "notifications"
  | "issue-types"
  | "workflows"
  | "fields"
  | "roles"
  | "versions"
  | "components"
  | "automation";

interface SettingsNavItem {
  id: SettingsSection;
  label: string;
  icon: LucideIcon;
}

export const settingsNavItems: SettingsNavItem[] = [
  { id: "details", label: "Details", icon: Settings2 },
  { id: "people", label: "People / Access", icon: Users },
  { id: "permissions", label: "Permissions", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "issue-types", label: "Issue types", icon: Tag },
  { id: "workflows", label: "Workflows", icon: GitBranch },
  { id: "fields", label: "Fields", icon: List },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "versions", label: "Versions", icon: Package },
  { id: "components", label: "Components", icon: Puzzle },
  { id: "automation", label: "Automation", icon: Zap },
];

export default function WorkspaceSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: members, isLoading } = useGetMembersQuery(workspaceId);

  const currentMember = members?.find((m) => m.userId === user?.id);
  const isAdmin = currentMember?.role === "ADMIN";

  useEffect(() => {
    if (!isLoading && members && !isAdmin) {
      router.replace(`/w/${workspaceId}`);
    }
  }, [isLoading, members, isAdmin, workspaceId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <ShieldLock className="h-10 w-10 text-text-tertiary" />
        <div>
          <h2 className="text-base font-semibold text-text">You don&apos;t have access to settings</h2>
          <p className="mt-1 text-sm text-text-tertiary">
            Only workspace admins and the owner can view workspace settings.
          </p>
        </div>
        <Link href={`/w/${workspaceId}`}>
          <Button variant="outline" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to workspace
          </Button>
        </Link>
      </div>
    );
  }

  const segment = pathname.split("/").filter(Boolean);
  const last = segment[segment.length - 1];
  const active: SettingsSection =
    last === "settings" || !settingsNavItems.some((n) => n.id === last)
      ? "details"
      : (last as SettingsSection);

  return (
    <div className="pb-10">
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link
          href={`/w/${workspaceId}`}
          className="font-medium text-text-tertiary hover:text-text transition-colors"
        >
          Workspace
        </Link>
        <span className="text-text-tertiary">/</span>
        <span className="font-semibold text-text">Settings</span>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <nav className="w-full shrink-0 md:w-60">
          <div className="rounded-xl border border-border-light bg-surface p-2">
            {settingsNavItems.map((item) => (
              <Link
                key={item.id}
                href={`/w/${workspaceId}/settings/${item.id}`}
                className={clsx(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  active === item.id
                    ? "bg-primary-bg font-medium text-primary"
                    : "text-text-secondary hover:bg-bg-light hover:text-text"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function ShieldLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="10" width="6" height="5" rx="1" />
      <line x1="12" y1="6" x2="12" y2="9" />
    </svg>
  );
}