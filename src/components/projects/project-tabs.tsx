"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { ProjectTemplate } from "@/store/projectApi";

interface ProjectTab {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
  showFor: ProjectTemplate[];
}

const allTemplates: ProjectTemplate[] = ["SCRUM", "KANBAN", "BUG_TRACKING", "PROJECT_MANAGEMENT", "DEVOPS", "TASK_TRACKING", "BLANK"];
const scrumTemplates: ProjectTemplate[] = ["SCRUM", "BUG_TRACKING", "DEVOPS"];
const softwareTemplates: ProjectTemplate[] = ["SCRUM", "KANBAN", "BUG_TRACKING", "DEVOPS", "TASK_TRACKING"];
const timelineTemplates: ProjectTemplate[] = ["PROJECT_MANAGEMENT"];

const tabs: ProjectTab[] = [
  { label: "Summary", href: "", icon: LayoutDashboardIcon, showFor: allTemplates },
  { label: "Timeline", href: "timeline", icon: MapIcon, showFor: timelineTemplates },
  { label: "Backlog", href: "backlog", icon: ListTodoIcon, showFor: scrumTemplates },
  { label: "Board", href: "board", icon: Columns3Icon, showFor: softwareTemplates },
  { label: "Issues", href: "issues", icon: CheckSquareIcon, showFor: allTemplates },
  { label: "Components", href: "components", icon: PuzzleIcon, showFor: allTemplates },
  { label: "Releases", href: "releases", icon: GitTagIcon, showFor: allTemplates },
  { label: "Reports", href: "reports", icon: BarChart3Icon, showFor: allTemplates },
];

interface ProjectTabsProps {
  projectId: string;
  projectName: string;
  workspaceId: string;
  template: ProjectTemplate;
}

export function ProjectTabs({ projectId, projectName, workspaceId, template }: ProjectTabsProps) {
  const pathname = usePathname();

  const visibleTabs = tabs.filter((t) => t.showFor.includes(template));

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <Link
          href={`/w/${workspaceId}`}
          className="text-sm font-medium text-[#737686] hover:text-[#121C28] transition-colors"
        >
          {projectName}
        </Link>
      </div>

      <div className="mt-4 flex items-center overflow-x-auto border-b border-[#C3C6D7]/20">
        {visibleTabs.map((item) => {
          const href = item.href ? `/p/${projectId}/${item.href}` : `/p/${projectId}`;
          const active = pathname === href;
          return (
            <Link
              key={item.label}
              href={href}
              className={clsx(
                "flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
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
        <div className="ml-auto shrink-0">
          <Link
            href={`/p/${projectId}/settings`}
            className={clsx(
              "flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors",
              pathname.startsWith(`/p/${projectId}/settings`)
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#737686] hover:text-[#121C28] hover:border-[#C3C6D7]"
            )}
          >
            <SettingsIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
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

function PuzzleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 01-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 10-3.214 3.214c.446.166.855.497.925.968a.979.979 0 01-.276.837l-1.61 1.611a2.404 2.404 0 01-3.409 0l-1.568-1.568a.98.98 0 00-.878-.289c-.47.05-.802.48-.968.925a2.501 2.501 0 10-3.214-3.214c-.446.166-.855.497-.925.968a.979.979 0 01-.276-.837l1.611-1.611a2.404 2.404 0 000-3.409l-1.568-1.568a.98.98 0 01-.289-.878c.05-.47.48-.802.925-.968a2.501 2.501 0 103.214-3.214c-.166-.446-.497-.855-.968-.925a.979.979 0 01.276-.837l1.611-1.611a2.404 2.404 0 013.409 0l1.568 1.568a.98.98 0 00.878.289c.47-.05.802-.48.968-.925a2.501 2.501 0 103.214 3.214c.446-.166.855-.497.925-.968z" />
    </svg>
  );
}

function GitTagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}
