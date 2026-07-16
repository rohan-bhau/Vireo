"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetWorkspaceQuery, useGetMembersQuery } from "@/store/workspaceApi";
import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export default function WorkspaceHomePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { data: workspace, isLoading, error } = useGetWorkspaceQuery(workspaceId);
  const { data: members = [] } = useGetMembersQuery(workspaceId);
  const { data: projects = [] } = useGetWorkspaceProjectsQuery(workspaceId);

  const [showCreateProject, setShowCreateProject] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-[#737686]">Workspace not found</p>
        <Link href="/dashboard"><Button variant="outline">Back to workspaces</Button></Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#121C28]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-[#737686]">Overview of your workspace</p>
        </div>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">Active Sprints</p>
          <p className="mt-2 text-3xl font-bold text-[#121C28]">{projects.length > 0 ? "1" : "0"}</p>
          <p className="mt-1 text-xs text-green-600">Ready to start</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">Team Members</p>
          <p className="mt-2 text-3xl font-bold text-[#121C28]">{members.length}</p>
          <p className="mt-1 text-xs text-[#737686]">{members.filter(m => m.role === "ADMIN").length} admin{members.filter(m => m.role === "ADMIN").length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">Projects</p>
          <p className="mt-2 text-3xl font-bold text-[#121C28]">{projects.length}</p>
          <p className="mt-1 text-xs text-[#737686]">{projects.length} active project{projects.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#121C28]">Projects</h2>
        <Button onClick={() => setShowCreateProject(true)} size="sm">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <svg className="mb-4 h-12 w-12 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-sm font-medium text-[#737686]">No projects yet</p>
          <p className="mt-1 text-xs text-[#C3C6D7]">Create your first project to get started</p>
          <Button className="mt-4" onClick={() => setShowCreateProject(true)} size="sm">
            Create project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/p/${project.id}/board`}
              className="group rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF4FF] text-sm font-bold text-[#004AC6]">
                  {project.key}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#121C28] group-hover:text-[#2563EB] transition-colors">
                    {project.name}
                  </p>
                  <p className="text-xs text-[#737686]">{project.key}</p>
                </div>
              </div>
              {project.description && (
                <p className="mb-3 line-clamp-2 text-xs text-[#737686]">{project.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-[#C3C6D7]">
                <span>{project.boards.length} board{project.boards.length !== 1 ? "s" : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-3 text-sm font-semibold text-[#121C28]">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="mb-3 h-8 w-8 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <p className="text-sm text-[#737686]">No recent activity</p>
            <p className="text-xs text-[#C3C6D7] mt-1">Activity will appear once issues and projects are created</p>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-3 text-sm font-semibold text-[#121C28]">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href={`/w/${workspaceId}/members`}
              className="flex items-center gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-sm font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
              </svg>
              Invite team members
            </Link>
            <button
              onClick={() => setShowCreateProject(true)}
              className="flex w-full items-center gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-sm font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create project
            </button>
            <Link
              href={`/w/${workspaceId}/settings`}
              className="flex items-center gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-sm font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Workspace settings
            </Link>
          </div>
        </div>
      </div>

      <CreateProjectDialog open={showCreateProject} onClose={() => setShowCreateProject(false)} />
    </>
  );
}
