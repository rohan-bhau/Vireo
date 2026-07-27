"use client";

import type { AutomationRule } from "@/store/automationApi";

interface RuleSummaryProps {
  rule: Partial<AutomationRule> & { name?: string };
}

const TRIGGER_LABELS: Record<string, string> = {
  "task.created": "Issue created",
  "task.updated": "Issue updated",
  "task.status_changed": "Issue transitioned",
  "task.assigned": "Issue assigned",
  "comment.added": "Comment added",
  "scheduled": "Scheduled",
  "sprint.started": "Sprint started",
  "sprint.completed": "Sprint completed",
};

const ACTION_LABELS: Record<string, string> = {
  assign_to: "Assign to",
  set_status: "Transition issue",
  set_priority: "Set priority",
  add_label: "Add label",
  remove_label: "Remove label",
  set_due_date: "Set due date",
  move_to_sprint: "Move to sprint",
  notify: "Send notification",
  add_subtask: "Add subtask",
  webhook: "Call webhook",
};

const BRANCH_LABELS: Record<string, string> = {
  subtask: "For each subtask",
  linked_issue: "For each linked issue",
  jql: "For issues matching JQL",
};

export function RuleSummary({ rule }: RuleSummaryProps) {
  if (!rule.name) {
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/30 py-12 text-center">
        <p className="text-sm text-[#C3C6D7]">Fill in the rule details to see a summary.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737686]">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Rule Summary
        </h4>
      </div>

      <div className="rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
        <div className="mb-3">
          <span className="text-sm font-semibold text-[#121C28]">{rule.name}</span>
          {rule.description && <p className="mt-0.5 text-xs text-[#737686]">{rule.description}</p>}
        </div>

        <div className="space-y-2">
          <SummaryRow label="Trigger" value={rule.trigger ? TRIGGER_LABELS[rule.trigger] || rule.trigger : "Not set"} />
          {rule.trigger === "scheduled" && rule.cronExpression && (
            <SummaryRow label="Schedule" value={`Cron: ${rule.cronExpression}`} />
          )}

          {rule.conditions && rule.conditions.length > 0 && (
            <div className="border-t border-[#C3C6D7]/10 pt-2">
              <span className="text-xs font-semibold text-[#434655]">Conditions</span>
              {rule.conditions.map((c, i) => (
                <p key={i} className="mt-1 text-xs text-[#737686]">
                  {c.field} {c.operator.replace(/_/g, " ")} {c.value || "(empty)"}
                </p>
              ))}
            </div>
          )}

          {rule.branches && rule.branches.length > 0 && (
            <div className="border-t border-[#C3C6D7]/10 pt-2">
              <span className="text-xs font-semibold text-[#434655]">Branches</span>
              {rule.branches.map((b, i) => (
                <p key={i} className="mt-1 text-xs text-[#737686]">
                  {BRANCH_LABELS[b.type] || b.type} — {b.actions.length} action{b.actions.length !== 1 ? "s" : ""}
                </p>
              ))}
            </div>
          )}

          {rule.actions && rule.actions.length > 0 && (
            <div className="border-t border-[#C3C6D7]/10 pt-2">
              <span className="text-xs font-semibold text-[#434655]">Actions</span>
              {rule.actions.map((a, i) => (
                <p key={i} className="mt-1 text-xs text-[#737686]">
                  {i + 1}. {ACTION_LABELS[a.type] || a.type}
                  {a.config && Object.keys(a.config).length > 0 && (
                    <span className="text-[#C3C6D7]">
                      {" "}
                      — {Object.entries(a.config).map(([k, v]) => `${k}: ${v}`).join(", ")}
                    </span>
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-[#434655] min-w-[80px]">{label}</span>
      <span className="text-xs text-[#121C28]">{value}</span>
    </div>
  );
}
