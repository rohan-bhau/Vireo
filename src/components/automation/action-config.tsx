"use client";

import type { AutomationAction, AutomationActionType } from "@/store/automationApi";

interface ActionConfigProps {
  actions: AutomationAction[];
  onChange: (actions: AutomationAction[]) => void;
}

const ACTION_OPTIONS: { value: AutomationActionType; label: string; description: string }[] = [
  { value: "assign_to", label: "Assign to", description: "Set assignee" },
  { value: "set_status", label: "Transition issue", description: "Change status" },
  { value: "set_priority", label: "Set priority", description: "Update priority level" },
  { value: "add_label", label: "Add label", description: "Add a label" },
  { value: "remove_label", label: "Remove label", description: "Remove a label" },
  { value: "set_due_date", label: "Set due date", description: "Set a due date" },
  { value: "move_to_sprint", label: "Move to sprint", description: "Assign to a sprint" },
  { value: "add_comment", label: "Add comment", description: "Post a comment to the issue" },
  { value: "create_issue", label: "Create issue", description: "Create a new issue" },
  { value: "link_issues", label: "Link issues", description: "Link to another issue" },
  { value: "add_subtask", label: "Add subtask", description: "Create a subtask" },
  { value: "notify", label: "Send notification", description: "Email or in-app notification" },
  { value: "webhook", label: "Call webhook", description: "POST to external URL" },
];

type ActionFormConfig = Record<
  AutomationActionType,
  { fields: { key: string; label: string; type: "text" | "select"; options?: { value: string; label: string }[] }[] }
>;

const ACTION_FORMS: ActionFormConfig = {
  assign_to: {
    fields: [{ key: "userId", label: "Assignee", type: "text" }],
  },
  set_status: {
    fields: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "To Do", label: "To Do" },
          { value: "In Progress", label: "In Progress" },
          { value: "In Review", label: "In Review" },
          { value: "Done", label: "Done" },
          { value: "Cancelled", label: "Cancelled" },
        ],
      },
    ],
  },
  set_priority: {
    fields: [
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { value: "Highest", label: "Highest" },
          { value: "High", label: "High" },
          { value: "Medium", label: "Medium" },
          { value: "Low", label: "Low" },
          { value: "Lowest", label: "Lowest" },
        ],
      },
    ],
  },
  add_label: {
    fields: [{ key: "label", label: "Label name", type: "text" }],
  },
  remove_label: {
    fields: [{ key: "label", label: "Label name", type: "text" }],
  },
  set_due_date: {
    fields: [{ key: "dueDate", label: "Days from now", type: "text" }],
  },
  move_to_sprint: {
    fields: [{ key: "sprintId", label: "Sprint ID", type: "text" }],
  },
  add_comment: {
    fields: [{ key: "text", label: "Comment text", type: "text" }],
  },
  create_issue: {
    fields: [
      { key: "summary", label: "Summary", type: "text" },
      {
        key: "type",
        label: "Issue type",
        type: "select",
        options: [
          { value: "task", label: "Task" },
          { value: "bug", label: "Bug" },
          { value: "story", label: "Story" },
          { value: "epic", label: "Epic" },
          { value: "subtask", label: "Subtask" },
        ],
      },
    ],
  },
  link_issues: {
    fields: [
      { key: "targetIssueKey", label: "Target issue key", type: "text" },
      {
        key: "relation",
        label: "Relation",
        type: "select",
        options: [
          { value: "relates to", label: "Relates to" },
          { value: "blocks", label: "Blocks" },
          { value: "is blocked by", label: "Is blocked by" },
          { value: "duplicates", label: "Duplicates" },
          { value: "is duplicated by", label: "Is duplicated by" },
        ],
      },
    ],
  },
  notify: {
    fields: [
      {
        key: "recipients",
        label: "Recipients",
        type: "select",
        options: [
          { value: "{reporter}", label: "Reporter" },
          { value: "{assignee}", label: "Assignee" },
          { value: "{projectLead}", label: "Project lead" },
        ],
      },
      { key: "template", label: "Message / Template", type: "text" },
    ],
  },
  add_subtask: {
    fields: [
      { key: "summary", label: "Summary", type: "text" },
      {
        key: "type",
        label: "Issue type",
        type: "select",
        options: [
          { value: "subtask", label: "Subtask" },
          { value: "task", label: "Task" },
        ],
      },
    ],
  },
  webhook: {
    fields: [
      { key: "url", label: "Webhook URL", type: "text" },
      { key: "method", label: "Method", type: "select", options: [{ value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }] },
      { key: "body", label: "Payload template", type: "text" },
    ],
  },
};

export function ActionConfig({ actions, onChange }: ActionConfigProps) {
  function addAction() {
    onChange([...actions, { type: "set_status", config: { status: "In Progress" } }]);
  }

  function removeAction(index: number) {
    onChange(actions.filter((_, i) => i !== index));
  }

  function updateAction(index: number, updates: Partial<AutomationAction>) {
    onChange(actions.map((a, i) => (i === index ? { ...a, ...updates } : a)));
  }

  function updateConfig(index: number, key: string, value: string) {
    onChange(
      actions.map((a, i) =>
        i === index ? { ...a, config: { ...a.config, [key]: value } } : a
      )
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-[#737686]">
        Define what happens when this rule is triggered and conditions are met.
      </p>

      <div className="space-y-4">
        {actions.map((action, i) => {
          const form = ACTION_FORMS[action.type];
          return (
            <div key={i} className="rounded-lg border border-[#C3C6D7]/30 bg-[#F8F9FF] p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB]/10 text-[11px] font-bold text-[#2563EB]">
                    {i + 1}
                  </span>
                  <select
                    value={action.type}
                    onChange={(e) => {
                      const newType = e.target.value as AutomationActionType;
                      updateAction(i, { type: newType, config: {} });
                    }}
                    className="rounded-md border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#121C28] focus:border-[#2563EB] focus:outline-none"
                  >
                    {ACTION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeAction(i)}
                  className="text-[#C3C6D7] hover:text-red-500 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {form && (
                <div className="space-y-2 pl-8">
                  {form.fields.map((field) => (
                    <div key={field.key} className="flex items-center gap-2">
                      <label className="w-28 shrink-0 text-xs font-medium text-[#434655]">
                        {field.label}
                      </label>
                      {field.type === "select" && field.options ? (
                        <select
                          value={action.config[field.key] || ""}
                          onChange={(e) => updateConfig(i, field.key, e.target.value)}
                          className="flex-1 rounded-md border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs text-[#121C28] focus:border-[#2563EB] focus:outline-none"
                        >
                          <option value="">Select...</option>
                          {field.options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={action.config[field.key] || ""}
                          onChange={(e) => updateConfig(i, field.key, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          className="flex-1 rounded-md border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs text-[#121C28] placeholder:text-[#C3C6D7] focus:border-[#2563EB] focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addAction}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add action
      </button>
    </div>
  );
}
