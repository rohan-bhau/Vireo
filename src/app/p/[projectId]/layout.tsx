"use client";

import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import { AppLayout } from "@/components/layout/app-layout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const projectNav = [
  { label: "Board", href: "board", icon: Columns3Icon },
  { label: "Backlog", href: "backlog", icon: ListTodoIcon },
  { label: "Tasks", href: "tasks", icon: CheckSquareIcon },
  { label: "Roadmap", href: "roadmap", icon: MapIcon },
  { label: "Reports", href: "reports", icon: BarChart3Icon },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.projectId as string;
  const pathname = usePathname();

  const { data: project, isLoading } = useGetProjectQuery(projectId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
          <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <Link
            href={project ? `/w/${project.workspaceId}` : "#"}
            className="text-sm font-medium text-[#737686] hover:text-[#121C28] transition-colors"
          >
            {project ? `${project.name}` : "..."}
          </Link>
        </div>

        <div className="mt-4 flex items-center border-b border-[#C3C6D7]/20">
          {projectNav.map((item) => {
            const href = `/p/${projectId}/${item.href}`;
            const active = pathname === href || (item.href === "board" && pathname === `/p/${projectId}`);
            return (
              <Link
                key={item.label}
                href={href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  active
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-[#737686] hover:text-[#121C28] hover:border-[#C3C6D7]"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="ml-auto">
            <Link
              href={`/p/${projectId}/settings`}
              className={clsx(
                "flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors",
                pathname === `/p/${projectId}/settings`
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#737686] hover:text-[#121C28] hover:border-[#C3C6D7]"
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      {children}
    </AppLayout>
  );
}

function Columns3Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="3" width="7" height="18" rx="1" />
    </svg>
  );
}

function ListTodoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function BarChart3Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}
