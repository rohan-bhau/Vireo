"use client";

import { useParams } from "next/navigation";
import { useGetProjectQuery } from "@/store/projectApi";

export default function ProjectSummaryPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project, isLoading } = useGetProjectQuery(projectId);

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
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#121C28]">{project.name} summary</h1>
          <p className="mt-1 text-sm text-[#737686]">{project.key} &middot; {project.isTeamManaged ? "Team-managed" : "Company-managed"} &middot; {project.template}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F9FF] text-xl">{project.avatar || "📁"}</span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard label="Total issues" value="—" color="#2563EB" />
        <StatCard label="Open" value="—" color="#F59E0B" />
        <StatCard label="In Progress" value="—" color="#3B82F6" />
        <StatCard label="Done" value="—" color="#10B981" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border border-[#C3C6D7]/20 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-4 text-base font-semibold text-[#121C28]">Recent activity</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="mb-3 h-10 w-10 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-[#121C28]">No recent activity</p>
            <p className="mt-1 text-xs text-[#737686]">Activity from this project will appear here</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#C3C6D7]/20 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-4 text-base font-semibold text-[#121C28]">Quick stats</h2>
          <div className="space-y-4">
            <QuickStatRow label="Project key" value={project.key} />
            <QuickStatRow label="Template" value={project.template} />
            <QuickStatRow label="Management" value={project.isTeamManaged ? "Team-managed" : "Company-managed"} />
            <QuickStatRow label="Created" value={new Date(project.createdAt).toLocaleDateString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-[#C3C6D7]/20 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium text-[#737686]">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-[#121C28]">{value}</p>
    </div>
  );
}

function QuickStatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#737686]">{label}</span>
      <span className="text-sm font-medium text-[#121C28]">{value}</span>
    </div>
  );
}
