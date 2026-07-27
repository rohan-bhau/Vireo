"use client";

import { useState } from "react";
import { useGetWorkspacesQuery } from "@/store/workspaceApi";
import { useGetWorkspaceWorkflowsQuery } from "@/store/workflowApi";
import { GitBranch, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminWorkflowsPage() {
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const [selectedWs, setSelectedWs] = useState<string | null>(null);

  const { data: workflows = [], isLoading } = useGetWorkspaceWorkflowsQuery(
    selectedWs ?? "",
    { skip: !selectedWs }
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#121C28]">Workflows</h1>
        <p className="mt-1 text-sm text-[#737686]">
          All workflows across the platform. Manage statuses, transitions, and schemes.
        </p>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-[#434655]">Workspace</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => setSelectedWs(ws.id)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                selectedWs === ws.id
                  ? "bg-[#EEF4FF] text-[#004AC6]"
                  : "bg-white text-[#434655] hover:bg-[#F8F9FF] border border-[#C3C6D7]/30"
              }`}
            >
              {ws.name}
            </button>
          ))}
        </div>
      </div>

      {!selectedWs ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <GitBranch className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">Select a workspace to view its workflows</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <GitBranch className="mb-3 h-10 w-10 text-[#C3C6D7]" />
          <p className="text-sm text-[#737686]">No workflows in this workspace</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div
              key={workflow._id}
              className="flex items-center justify-between rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#121C28]">{workflow.name}</span>
                  {workflow.isDefault && (
                    <span className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-medium text-[#004AC6]">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#737686]">
                  {workflow.statuses?.length || 0} statuses &middot; {workflow.transitions?.length || 0} transitions
                </p>
              </div>
              <Link
                href={`/p/${workflow.projectId}/settings/workflows`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#C3C6D7] px-3 py-1.5 text-xs font-medium text-[#434655] transition-colors hover:bg-[#F8F9FF]"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
