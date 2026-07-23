"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";
import { clsx } from "clsx";

import { ProjectSettingsDetails } from "@/components/projects/project-settings-details";
import { ProjectSettingsPeople } from "@/components/projects/project-settings-people";
import { ProjectSettingsPermissions } from "@/components/projects/project-settings-permissions";
import { ProjectSettingsNotifications } from "@/components/projects/project-settings-notifications";
import { ProjectSettingsIssueTypes } from "@/components/projects/project-settings-issue-types";
import { ProjectSettingsWorkflows } from "@/components/projects/project-settings-workflows";
import { ProjectSettingsVersions } from "@/components/projects/project-settings-versions";
import { ProjectSettingsComponents } from "@/components/projects/project-settings-components";
import { ProjectSettingsAutomation } from "@/components/projects/project-settings-automation";

type SettingsSection =
  | "details"
  | "people"
  | "permissions"
  | "notifications"
  | "issue-types"
  | "workflows"
  | "screens"
  | "fields"
  | "roles"
  | "versions"
  | "components"
  | "automation"
  | "dev-tools";

interface SettingsNavItem {
  id: SettingsSection;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
}

const navItems: SettingsNavItem[] = [
  { id: "details", label: "Details", icon: InfoIcon },
  { id: "people", label: "People / Access", icon: UsersIcon },
  { id: "permissions", label: "Permissions", icon: LockIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "issue-types", label: "Issue types", icon: TagIcon },
  { id: "workflows", label: "Workflows", icon: GitBranchIcon },
  { id: "screens", label: "Screens", icon: MonitorIcon },
  { id: "fields", label: "Fields", icon: ListIcon },
  { id: "roles", label: "Roles", icon: ShieldIcon },
  { id: "versions", label: "Versions", icon: PackageIcon },
  { id: "components", label: "Components", icon: PuzzleIcon },
  { id: "automation", label: "Automation", icon: ZapIcon },
  { id: "dev-tools", label: "Development tools", icon: CodeIcon },
];

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project, isLoading } = useGetProjectQuery(projectId);
  const [activeSection, setActiveSection] = useState<SettingsSection>("details");

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex gap-8">
      <nav className="w-56 shrink-0">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-[#121C28]">Project Settings</h2>
          <p className="text-xs text-[#737686]">{project.name}</p>
        </div>
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={clsx(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                activeSection === item.id
                  ? "bg-[#EFF6FF] text-[#2563EB] font-medium"
                  : "text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-1 min-w-0">
        {activeSection === "details" && <ProjectSettingsDetails project={project} />}
        {activeSection === "people" && <ProjectSettingsPeople project={project} />}
        {activeSection === "permissions" && <ProjectSettingsPermissions project={project} />}
        {activeSection === "notifications" && <ProjectSettingsNotifications project={project} />}
        {activeSection === "issue-types" && <ProjectSettingsIssueTypes project={project} />}
        {activeSection === "workflows" && <ProjectSettingsWorkflows />}
        {activeSection === "screens" && <PlaceholderSection title="Screens" description="Configure which fields appear on create, edit, and view screens" />}
        {activeSection === "fields" && <PlaceholderSection title="Fields" description="Manage custom fields available in this project" />}
        {activeSection === "roles" && <PlaceholderSection title="Roles" description="Define project roles and their permissions" />}
        {activeSection === "versions" && <ProjectSettingsVersions project={project} />}
        {activeSection === "components" && <ProjectSettingsComponents project={project} />}
        {activeSection === "automation" && <ProjectSettingsAutomation project={project} />}
        {activeSection === "dev-tools" && <PlaceholderSection title="Development tools" description="Connect your project to version control and CI/CD tools" />}
      </div>
    </div>
  );
}

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">{title}</h2>
        <p className="text-sm text-[#737686]">{description}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-16 text-center">
        <h3 className="text-base font-semibold text-[#121C28]">Coming soon</h3>
        <p className="mt-1 text-sm text-[#737686]">This section will be built in a follow-up phase</p>
      </div>
    </div>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>;
}
function UsersIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
}
function LockIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
}
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>;
}
function TagIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>;
}
function GitBranchIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 01-9 9" /></svg>;
}
function MonitorIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
}
function ListIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
}
function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function PackageIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>;
}
function PuzzleIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 01-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 10-3.214 3.214c.446.166.855.497.925.968a.979.979 0 01-.276.837l-1.61 1.611a2.404 2.404 0 01-3.409 0l-1.568-1.568a.98.98 0 00-.878-.289c-.47.05-.802.48-.968.925a2.501 2.501 0 10-3.214-3.214c-.446.166-.855.497-.925.968a.979.979 0 01-.276-.837l1.611-1.611a2.404 2.404 0 000-3.409l-1.568-1.568a.98.98 0 01-.289-.878c.05-.47.48-.802.925-.968a2.501 2.501 0 103.214-3.214c-.166-.446-.497-.855-.968-.925a.979.979 0 01.276-.837l1.611-1.611a2.404 2.404 0 013.409 0l1.568 1.568a.98.98 0 00.878.289c.47-.05.802-.48.968-.925a2.501 2.501 0 103.214 3.214c.446-.166.855-.497.925-.968z" /></svg>;
}
function ZapIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
}
function CodeIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
}
