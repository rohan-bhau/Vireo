"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetWorkspaceQuery, useGetMembersQuery } from "@/store/workspaceApi";
import { useGetWorkspaceProjectsQuery } from "@/store/projectApi";
import { useGetWorkspaceTasksQuery } from "@/store/taskApi";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { SkeletonSummaryCards } from "@/components/ui/skeleton";
import { AITicketWriter } from "@/components/ai/ai-ticket-writer";
import { AITriage } from "@/components/ai/ai-triage";
import { AISprintPlanner } from "@/components/ai/ai-sprint-planner";
import { Sparkles } from "lucide-react";

interface SummaryTabProps {
  workspaceId: string;
}

export function SummaryTab({ workspaceId }: SummaryTabProps) {
  useGetWorkspaceQuery(workspaceId);
  const { data: members = [], isLoading: membersLoading } = useGetMembersQuery(workspaceId);
  const { data: projects = [], isLoading: projectsLoading } = useGetWorkspaceProjectsQuery(workspaceId);
  const { data: tasks = [], isLoading: tasksLoading } = useGetWorkspaceTasksQuery(workspaceId);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [ticketWriterOpen, setTicketWriterOpen] = useState(false);
  const [triageOpen, setTriageOpen] = useState(false);
  const [sprintPlannerOpen, setSprintPlannerOpen] = useState(false);

  const projectId = projects.length > 0 ? projects[0].id : "";

  const openTasks = tasks.filter(
    (t) => t.status === "todo" || t.status === "in_progress" || t.status === "in_review"
  ).length;

  const loading = membersLoading || projectsLoading || tasksLoading;

  if (loading) {
    return (
      <div>
        <SkeletonSummaryCards />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">Active Sprints</p>
          <p className="mt-2 text-3xl font-bold text-[#121C28]">{projects.length > 0 ? "1" : "0"}</p>
          <p className="mt-1 text-xs text-green-600">Ready to start</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">Open Tasks</p>
          <p className="mt-2 text-3xl font-bold text-[#121C28]">{openTasks}</p>
          <p className="mt-1 text-xs text-[#737686]">
            {tasks.length > 0
              ? `${tasks.length} total, ${tasks.filter((t) => t.status === "done").length} done`
              : "No tasks yet"}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#737686]">Team Members</p>
          <p className="mt-2 text-3xl font-bold text-[#121C28]">{members.length}</p>
          <p className="mt-1 text-xs text-[#737686]">{members.filter(m => m.role === "ADMIN").length} admin{members.filter(m => m.role === "ADMIN").length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-3 text-sm font-semibold text-[#121C28]">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="mb-3 h-8 w-8 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <p className="text-sm text-[#737686]">No recent activity</p>
            <p className="text-xs text-[#C3C6D7] mt-1">Activity will appear once tasks and projects are created</p>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-3 text-sm font-semibold text-[#121C28]">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-sm font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create task
            </button>
            <button
              onClick={() => setTicketWriterOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-sm font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <Sparkles className="h-4 w-4" />
              AI Write ticket
            </button>
            <button
              onClick={() => setTriageOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-sm font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <Sparkles className="h-4 w-4" />
              AI Smart triage
            </button>
            <Link
              href={`/w/${workspaceId}/members`}
              className="flex items-center gap-3 rounded-lg border border-[#C3C6D7]/20 p-3 text-sm font-medium text-[#434655] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
              </svg>
              Invite team members
            </Link>
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

      {projectId && (
        <button
          onClick={() => setSprintPlannerOpen(true)}
          className="mt-6 w-full rounded-xl border border-[#2563EB]/20 bg-gradient-to-r from-[#EEF4FF] to-[#F8F9FF] p-5 text-left transition-colors hover:border-[#2563EB]/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#121C28]">AI Sprint Planner</h3>
              <p className="text-xs text-[#737686] mt-0.5">
                Let AI suggest an optimal sprint plan from your backlog based on priority and capacity.
              </p>
            </div>
            <svg className="h-5 w-5 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      )}

      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        workspaceId={workspaceId}
      />

      {projectId && (
        <>
          <AITicketWriter
            open={ticketWriterOpen}
            onClose={() => setTicketWriterOpen(false)}
            projectId={projectId}
            onApply={(result) => {
              setCreateDialogOpen(true);
            }}
          />
          <AITriage
            open={triageOpen}
            onClose={() => setTriageOpen(false)}
            workspaceId={workspaceId}
            onApply={() => {}}
          />
          <AISprintPlanner
            open={sprintPlannerOpen}
            onClose={() => setSprintPlannerOpen(false)}
            projectId={projectId}
          />
        </>
      )}
    </div>
  );
}