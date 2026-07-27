"use client";

import { useState } from "react";
import { useCreateAutomationRuleMutation } from "@/store/automationApi";
import type { AutomationTemplate } from "@/store/automationApi";

interface RuleTemplatesProps {
  workspaceId: string;
  projectId?: string;
  onCreated: () => void;
}

const TEMPLATES: AutomationTemplate[] = [
  {
    id: "auto-assign-component",
    name: "Auto-assign based on component",
    description: "When an issue is created with a specific component, automatically assign it to the component lead.",
    category: "Assignment",
    trigger: "task.created",
    conditions: [{ field: "component", operator: "is_not_empty", value: "" }],
    actions: [{ type: "assign_to", config: { userId: "{componentLead}" } }],
  },
  {
    id: "set-due-date-bugs",
    name: "Set due date for bugs",
    description: "When a bug is created, set the due date to 7 days from now.",
    category: "Due dates",
    trigger: "task.created",
    conditions: [{ field: "type", operator: "equals", value: "bug" }],
    actions: [{ type: "set_due_date", config: { dueDate: "7" } }],
  },
  {
    id: "notify-high-priority",
    name: "Notify on high priority",
    description: "When an issue with Highest or High priority is created, notify the project lead.",
    category: "Notifications",
    trigger: "task.created",
    conditions: [{ field: "priority", operator: "equals", value: "Highest" }],
    actions: [{ type: "notify", config: { recipients: "{projectLead}", template: "New high-priority issue created" } }],
  },
  {
    id: "auto-close-resolved",
    name: "Auto-close resolved issues",
    description: "When an issue transitions to Done, automatically close it and add a 'completed' label.",
    category: "Workflow",
    trigger: "task.status_changed",
    conditions: [{ field: "status", operator: "changed_to", value: "Done" }],
    actions: [
      { type: "set_status", config: { status: "Closed" } },
      { type: "add_label", config: { label: "completed" } },
    ],
  },
  {
    id: "slack-notification",
    name: "Slack notification",
    description: "When an issue is updated, send a notification to a Slack webhook.",
    category: "Integrations",
    trigger: "task.updated",
    conditions: [],
    actions: [{ type: "webhook", config: { url: "https://hooks.slack.com/services/...", method: "POST", body: '{"text": "Issue {{key}} was updated"}' } }],
  },
  {
    id: "assign-high-priority",
    name: "Escalate high priority issues",
    description: "When a Highest priority bug is created, assign it to the project lead and set due date to 2 days.",
    category: "Assignment",
    trigger: "task.created",
    conditions: [
      { field: "type", operator: "equals", value: "bug" },
      { field: "priority", operator: "equals", value: "Highest" },
    ],
    actions: [
      { type: "assign_to", config: { userId: "{projectLead}" } },
      { type: "set_due_date", config: { dueDate: "2" } },
      { type: "notify", config: { recipients: "{projectLead}", template: "Critical bug assigned to you" } },
    ],
  },
  {
    id: "label-resolved",
    name: "Label resolved issues",
    description: "When an issue is resolved, add an appropriate resolution label.",
    category: "Workflow",
    trigger: "task.status_changed",
    conditions: [{ field: "status", operator: "changed_to", value: "Done" }],
    actions: [{ type: "add_label", config: { label: "resolved" } }],
  },
  {
    id: "transition-in-review",
    name: "Auto-transition to In Review",
    description: "When an issue is assigned and status is In Progress, transition to In Review.",
    category: "Workflow",
    trigger: "task.assigned",
    conditions: [{ field: "status", operator: "equals", value: "In Progress" }],
    actions: [{ type: "set_status", config: { status: "In Review" } }],
  },
  {
    id: "comment-on-done",
    name: "Comment on completion",
    description: "When an issue moves to Done, add a comment indicating it's completed.",
    category: "Notifications",
    trigger: "task.status_changed",
    conditions: [{ field: "status", operator: "changed_to", value: "Done" }],
    actions: [{ type: "notify", config: { recipients: "issue", template: "This issue has been marked as Done." } }],
  },
];

const CATEGORIES = [...new Set(TEMPLATES.map((t) => t.category))];

export function RuleTemplates({ workspaceId, projectId, onCreated }: RuleTemplatesProps) {
  const [createRule, { isLoading }] = useCreateAutomationRuleMutation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filtered = selectedCategory === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === selectedCategory);

  async function handleUseTemplate(template: AutomationTemplate) {
    await createRule({
      name: template.name,
      description: template.description,
      workspaceId,
      projectId,
      trigger: template.trigger,
      conditions: template.conditions,
      actions: template.actions,
    });
    onCreated();
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-[#2563EB] text-white"
                : "bg-[#F8F9FF] text-[#737686] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-[#C3C6D7]/20 bg-white p-4 transition-all hover:border-[#2563EB]/40 hover:shadow-sm"
          >
            <div className="mb-1 flex items-start justify-between">
              <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
                {template.category}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#121C28]">{template.name}</h4>
            <p className="mt-1 text-xs text-[#737686] line-clamp-2">{template.description}</p>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-[#C3C6D7]">
              <span>Trigger: {template.trigger.replace(/_/g, " ").replace(/\./g, " → ")}</span>
              {template.conditions.length > 0 && (
                <>
                  <span>·</span>
                  <span>{template.conditions.length} condition{template.conditions.length !== 1 ? "s" : ""}</span>
                </>
              )}
              <span>·</span>
              <span>{template.actions.length} action{template.actions.length !== 1 ? "s" : ""}</span>
            </div>

            <button
              type="button"
              onClick={() => handleUseTemplate(template)}
              disabled={isLoading}
              className="mt-3 w-full rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Use template"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
