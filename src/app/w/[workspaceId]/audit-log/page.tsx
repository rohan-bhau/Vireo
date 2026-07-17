"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetAuditLogsQuery, useGetAuditLogEntityTypesQuery, useGetAuditLogActionsQuery } from "@/store/auditLogApi";
import { Button } from "@/components/ui/button";
import {
  History,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const actionColors: Record<string, string> = {
  workspace_created: "bg-[#EEF4FF] text-[#004AC6]",
  project_created: "bg-[#EEF4FF] text-[#004AC6]",
  task_created: "bg-[#ECFDF5] text-[#059669]",
  task_updated: "bg-[#FFFBEB] text-[#D97706]",
  member_added: "bg-[#F3EEFF] text-[#7C3AED]",
  member_removed: "bg-red-50 text-red-600",
  integration_updated: "bg-[#EEF4FF] text-[#004AC6]",
  integration_deleted: "bg-red-50 text-red-600",
  sprint_started: "bg-[#ECFDF5] text-[#059669]",
  sprint_completed: "bg-[#EEF4FF] text-[#004AC6]",
};

const actionLabels: Record<string, string> = {
  workspace_created: "Created workspace",
  project_created: "Created project",
  task_created: "Created task",
  task_updated: "Updated task",
  member_added: "Added member",
  member_removed: "Removed member",
  integration_updated: "Updated integration",
  integration_deleted: "Removed integration",
  sprint_started: "Started sprint",
  sprint_completed: "Completed sprint",
};

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AuditLogPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [page, setPage] = useState(0);
  const [entityType, setEntityType] = useState<string | undefined>();
  const [action, setAction] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const limit = 25;

  const { data, isLoading, refetch } = useGetAuditLogsQuery({
    workspaceId,
    limit,
    offset: page * limit,
    entityType,
    action,
  });
  const { data: entityTypes = [] } = useGetAuditLogEntityTypesQuery(workspaceId);
  const { data: actions = [] } = useGetAuditLogActionsQuery(workspaceId);

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[#121C28]">Audit Log</h1>
          <p className="mt-0.5 text-sm text-[#737686]">
            {total} event{total !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-1.5 h-4 w-4" />
            Filters
            {(entityType || action) && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[9px] text-white">
                {(entityType ? 1 : 0) + (action ? 1 : 0)}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]">Entity Type</label>
              <select
                value={entityType || ""}
                onChange={(e) => { setEntityType(e.target.value || undefined); setPage(0); }}
                className="rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="">All types</option>
                {entityTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]">Action</label>
              <select
                value={action || ""}
                onChange={(e) => { setAction(e.target.value || undefined); setPage(0); }}
                className="rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="">All actions</option>
                {actions.map((a) => (
                  <option key={a} value={a}>{actionLabels[a] || a}</option>
                ))}
              </select>
            </div>
            {(entityType || action) && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEntityType(undefined); setAction(undefined); setPage(0); }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl bg-white p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF]">
            <History className="h-8 w-8 text-[#2563EB]" />
          </div>
          <h2 className="text-lg font-semibold text-[#121C28]">No audit events yet</h2>
          <p className="mt-2 text-sm text-[#737686]">
            Activities within this workspace will be logged here for compliance and review.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#C3C6D7]/20 bg-[#F8F9FF]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#737686] uppercase tracking-wider">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#737686] uppercase tracking-wider">Actor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#737686] uppercase tracking-wider">Entity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#737686] uppercase tracking-wider">Details</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#737686] uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C3C6D7]/10">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-[#F8F9FF] transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          actionColors[log.action] || "bg-[#F0F0F5] text-[#737686]"
                        }`}>
                          {actionLabels[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF4FF] text-[9px] font-bold text-[#004AC6]">
                            {log.actorName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-[#434655]">{log.actorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm text-[#121C28]">{log.entityName || log.entityId.slice(0, 8)}</span>
                          <span className="block text-[11px] text-[#737686] capitalize">{log.entityType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.details && Object.keys(log.details).length > 0 && (
                          <span className="text-xs text-[#737686] font-mono">
                            {JSON.stringify(log.details).slice(0, 40)}{JSON.stringify(log.details).length > 40 ? "..." : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-[#737686] whitespace-nowrap">{timeAgo(log.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-[#737686]">
                Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (page < 3) {
                    pageNum = i;
                  } else if (page > totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="min-w-[32px]"
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
