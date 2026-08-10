"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetWorkspaceQuery, useGetMembersQuery } from "@/store/workspaceApi";
import { SettingsContext } from "@/lib/settings-context";
import { settingsNavItems } from "@/lib/settings-nav";
import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";

export default function WorkspaceSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const workspaceId = params.workspaceId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: workspace } = useGetWorkspaceQuery(workspaceId, { skip: !workspaceId });
  const { data: members } = useGetMembersQuery(workspaceId, { skip: !workspaceId });

  const currentMember = members?.find((m) => m.userId === user?.id);
  const isAdmin = currentMember?.role === "ADMIN";
  const isOwner = workspace?.ownerId === user?.id;

  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "settings";
  const currentSection = settingsNavItems.find((n) => n.id === last);
  const inSubSection = last !== "settings";

  return (
    <SettingsContext.Provider value={{ workspaceId, isAdmin, isOwner }}>
      <div className="px-4 pb-16 pt-6 md:px-6">
        <nav
          aria-label="Settings breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-sm"
        >
          {[
            {
              label: workspace?.name || "Workspace",
              href: `/w/${workspaceId}`,
              active: false,
            },
            {
              label: "Settings",
              href: `/w/${workspaceId}/settings`,
              active: !inSubSection,
            },
            ...(currentSection && inSubSection
              ? [{ label: currentSection.label, href: null as string | null, active: true }]
              : []),
          ].map((item, index) => (
            <div key={item.label} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />}
              {item.href ? (
                <Link
                  href={item.href}
                  className={clsx(
                    "rounded-[3px] px-1.5 py-0.5 transition-colors",
                    item.active
                      ? "font-semibold text-text"
                      : "text-text-secondary hover:bg-bg-light hover:text-text"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="px-1.5 py-0.5 font-semibold text-text">{item.label}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-6">{children}</div>
      </div>
    </SettingsContext.Provider>
  );
}