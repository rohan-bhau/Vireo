"use client";

import { useState } from "react";
import {
  useGetProjectRulesQuery,
  useToggleAutomationRuleMutation,
  useDeleteAutomationRuleMutation,
  useCopyAutomationRuleMutation,
  type AutomationRule,
  type AutomationTrigger,
} from "@/store/automationApi";
import { RuleAuditLog } from "./rule-audit-log";
import { clsx } from "clsx";

interface RuleListProps {
  projectId: string;
  onEdit: (rule: AutomationRule) => void;
}

const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  "task.created": "Issue created",
  "task.updated": "Issue updated",
  "task.status_changed": "Issue transitioned",
  "task.assigned": "Issue assigned",
  "comment.added": "Comment added",
  "scheduled": "Scheduled",
  "sprint.started": "Sprint started",
  "sprint.completed": "Sprint completed",
};

const TRIGGER_COLORS: Record<string, string> = {
  "task.created": "bg-green-100 text-green-700",
  "task.updated": "bg-blue-100 text-blue-700",
  "task.status_changed": "bg-purple-100 text-purple-700",
  "task.assigned": "bg-amber-100 text-amber-700",
  "comment.added": "bg-indigo-100 text-indigo-700",
  "scheduled": "bg-orange-100 text-orange-700",
  "sprint.started": "bg-cyan-100 text-cyan-700",
  "sprint.completed": "bg-rose-100 text-rose-700",
};

export function RuleList({ projectId, onEdit }: RuleListProps) {
  const { data: rules, isLoading } = useGetProjectRulesQuery(projectId);
  const [toggleRule] = useToggleAutomationRuleMutation();
  const [deleteRule] = useDeleteAutomationRuleMutation();
  const [copyRule] = useCopyAutomationRuleMutation();

  const [search, setSearch] = useState("");
  const [showAuditFor, setShowAuditFor] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "enabled" | "disabled">("all");

  const filtered = (rules || []).filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(search.toLowerCase()) ||
      TRIGGER_LABELS[rule.trigger as AutomationTrigger]?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && rule.enabled) ||
      (statusFilter === "disabled" && !rule.enabled);
    return matchesSearch && matchesStatus;
  });

  async function handleCopy(id: string) {
    await copyRule(id);
  }

  async function handleDelete(id: string) {
    await deleteRule(id);
    setConfirmDelete(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!rules || rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-light py-16 text-center">
        <svg className="mb-3 h-12 w-12 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <h3 className="text-base font-semibold text-text">No automation rules yet</h3>
        <p className="mt-1 text-sm text-text-tertiary">Create your first rule to automate project workflows.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C3C6D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules..."
            className="w-full rounded-lg border border-[#C3C6D7] bg-white py-2 pl-9 pr-3 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:border-[#2563EB] focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "enabled" | "disabled")}
          className="rounded-lg border border-[#C3C6D7] bg-white px-3 py-2 text-sm text-[#121C28] focus:border-[#2563EB] focus:outline-none"
        >
          <option value="all">All</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((rule) => (
          <div key={rule._id}>
            <div className="flex items-center gap-3 rounded-lg border border-[#C3C6D7]/20 bg-white px-4 py-3 transition-colors hover:border-[#2563EB]/20 hover:bg-[#F8F9FF]">
              <button
                type="button"
                onClick={() => toggleRule(rule._id)}
                className={clsx(
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                  rule.enabled ? "bg-[#2563EB]" : "bg-[#C3C6D7]"
                )}
              >
                <span
                  className={clsx(
                    "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    rule.enabled ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>

              <button
                type="button"
                onClick={() => onEdit(rule)}
                className="flex-1 text-left"
              >
                <span className="text-sm font-semibold text-[#121C28]">{rule.name}</span>
                {rule.description && (
                  <p className="text-xs text-[#737686] truncate">{rule.description}</p>
                )}
              </button>

              <span
                className={clsx(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  TRIGGER_COLORS[rule.trigger] || "bg-gray-100 text-gray-700"
                )}
              >
                {TRIGGER_LABELS[rule.trigger as AutomationTrigger] || rule.trigger}
              </span>

              <div className="shrink-0 text-right">
                <p className="text-xs font-medium text-[#121C28]">{rule.triggerCount}</p>
                <p className="text-[10px] text-[#C3C6D7]">
                  {rule.lastTriggeredAt
                    ? new Date(rule.lastTriggeredAt).toLocaleDateString()
                    : "Never"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowAuditFor(showAuditFor === rule._id ? null : rule._id)}
                  className="rounded-md p-1.5 text-[#C3C6D7] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                  title="Audit log"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(rule._id)}
                  className="rounded-md p-1.5 text-[#C3C6D7] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                  title="Copy rule"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </button>
                {confirmDelete === rule._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(rule._id)}
                      className="rounded-md bg-red-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-600"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(null)}
                      className="rounded-md bg-[#F0F0F5] px-2 py-1 text-[10px] font-semibold text-[#737686] hover:bg-[#E5E7EB]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(rule._id)}
                    className="rounded-md p-1.5 text-[#C3C6D7] hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete rule"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {showAuditFor === rule._id && (
              <div className="ml-12 mr-4 mb-2 rounded-lg border border-[#C3C6D7]/10 bg-[#F8F9FF] p-3">
                <RuleAuditLog ruleId={rule._id} />
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && rules.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-[#737686]">No rules match your search.</p>
        </div>
      )}

      <p className="mt-3 text-xs text-[#C3C6D7]">
        Showing {filtered.length} of {rules.length} rule{rules.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
