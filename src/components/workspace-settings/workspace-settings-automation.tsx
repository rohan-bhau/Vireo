"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetWorkspaceRulesQuery,
  useToggleAutomationRuleMutation,
  useDeleteAutomationRuleMutation,
  type AutomationRule,
  type AutomationTrigger,
} from "@/store/automationApi";
import { RuleBuilder } from "@/components/automation/rule-builder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { Zap, Plus, Pencil, Trash2 } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { clsx } from "clsx";
import { SkeletonSettingsPage } from "@/components/ui/skeleton";

const TRIGGER_LABELS: Record<string, string> = {
  "task.created": "Issue created",
  "task.updated": "Issue updated",
  "task.status_changed": "Status changed",
  "task.assigned": "Issue assigned",
  "comment.added": "Comment added",
  scheduled: "Scheduled",
  "sprint.started": "Sprint started",
  "sprint.completed": "Sprint completed",
};

export function WorkspaceSettingsAutomation() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: rules = [], isLoading } = useGetWorkspaceRulesQuery(workspaceId);
  const [toggleRule] = useToggleAutomationRuleMutation();
  const [deleteRule] = useDeleteAutomationRuleMutation();

  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function handleDelete(id: string) {
    try {
      await deleteRule(id).unwrap();
      toastSuccess("Rule deleted");
      setConfirmDelete(null);
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not delete rule");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Automation</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            Rules run automatically when events happen across the workspace.
          </p>
        </div>
        <Button onClick={() => { setEditingRule(null); setShowBuilder(true); }}>
          <Plus className="h-4 w-4" /> Create rule
        </Button>
      </div>

      {isLoading && <SkeletonSettingsPage />}

      {!isLoading && rules.length === 0 && (
        <div className="rounded-xl border border-border-light bg-surface">
          <EmptyState
            icon={<Zap className="h-8 w-8" />}
            title="No automation rules"
            message="Automate repetitive work — create your first rule."
            action={<Button onClick={() => { setEditingRule(null); setShowBuilder(true); }}><Plus className="mr-1.5 h-4 w-4" /> Create rule</Button>}
          />
        </div>
      )}

      {!isLoading && rules.length > 0 && (
        <div className="divide-y divide-border-light overflow-hidden rounded-xl border border-border-light bg-surface">
          {rules.map((rule) => (
            <div key={rule._id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <Switch
                checked={rule.enabled}
                onChange={() => toggleRule(rule._id)}
                aria-label={`Toggle rule ${rule.name}`}
              />
              <button
                type="button"
                onClick={() => { setEditingRule(rule); setShowBuilder(true); }}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-sm font-semibold text-text">{rule.name}</p>
                <p className="truncate text-xs text-text-tertiary">
                  {rule.description || "No description"}
                </p>
              </button>
              <span className="flex items-center gap-3">
                <span className={clsx(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  "bg-[#EFF6FF] text-[#004AC6]"
                )}>
                  {TRIGGER_LABELS[rule.trigger as AutomationTrigger] || rule.trigger}
                </span>
                <span className="shrink-0 text-xs text-text-tertiary">
                  {rule.triggerCount ?? 0} runs
                </span>
                <button
                  type="button"
                  onClick={() => { setEditingRule(rule); setShowBuilder(true); }}
                  className="flex h-7 w-7 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
                  title="Edit rule"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {confirmDelete === rule._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(rule._id)}
                      className="rounded-md bg-danger px-2 py-1 text-[10px] font-semibold text-white hover:brightness-110"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(null)}
                      className="rounded-md bg-bg-light px-2 py-1 text-[10px] font-semibold text-text-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(rule._id)}
                    className="flex h-7 w-7 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                    title="Delete rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-text-tertiary">
        Rules can also be scoped to a single project from that{" "}
        <span className="font-medium text-text-secondary">project&apos;s settings</span>.
      </p>

      {showBuilder && (
        <RuleBuilder
          open={showBuilder}
          onClose={() => { setShowBuilder(false); setEditingRule(null); }}
          editRule={editingRule || undefined}
          projectId={editingRule?.projectId}
        />
      )}
    </div>
  );
}