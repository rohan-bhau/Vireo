"use client";

import type { AutomationBranch, AutomationAction, BranchType, AutomationActionType } from "@/store/automationApi";

interface BranchConfigProps {
  branches: AutomationBranch[];
  onChange: (branches: AutomationBranch[]) => void;
}

const BRANCH_TYPES: { value: BranchType; label: string; description: string }[] = [
  { value: "subtask", label: "For each subtask", description: "Run actions for every subtask of the issue" },
  { value: "linked_issue", label: "For each linked issue", description: "Run actions for linked issues of a specific type" },
  { value: "jql", label: "For issues matching JQL", description: "Run actions for issues matching a JQL query" },
];

const ACTION_OPTIONS: { value: AutomationActionType; label: string }[] = [
  { value: "assign_to", label: "Assign to" },
  { value: "set_status", label: "Transition issue" },
  { value: "set_priority", label: "Set priority" },
  { value: "add_label", label: "Add label" },
  { value: "remove_label", label: "Remove label" },
  { value: "set_due_date", label: "Set due date" },
  { value: "move_to_sprint", label: "Move to sprint" },
];

export function BranchConfig({ branches, onChange }: BranchConfigProps) {
  function addBranch() {
    onChange([...branches, { type: "subtask", config: {}, actions: [] }]);
  }

  function removeBranch(index: number) {
    onChange(branches.filter((_, i) => i !== index));
  }

  function updateBranch(index: number, updates: Partial<AutomationBranch>) {
    onChange(branches.map((b, i) => (i === index ? { ...b, ...updates } : b)));
  }

  function updateBranchConfig(index: number, key: string, value: string) {
    onChange(
      branches.map((b, i) =>
        i === index ? { ...b, config: { ...b.config, [key]: value } } : b
      )
    );
  }

  function addBranchAction(branchIndex: number) {
    onChange(
      branches.map((b, i) =>
        i === branchIndex ? { ...b, actions: [...b.actions, { type: "set_status" as AutomationActionType, config: { status: "In Progress" } }] } : b
      )
    );
  }

  function removeBranchAction(branchIndex: number, actionIndex: number) {
    onChange(
      branches.map((b, i) =>
        i === branchIndex ? { ...b, actions: b.actions.filter((_, ai) => ai !== actionIndex) } : b
      )
    );
  }

  function updateBranchAction(branchIndex: number, actionIndex: number, updates: Partial<AutomationAction>) {
    onChange(
      branches.map((b, i) =>
        i === branchIndex
          ? { ...b, actions: b.actions.map((a, ai) => (ai === actionIndex ? { ...a, ...updates } : a)) }
          : b
      )
    );
  }

  function updateBranchActionConfig(branchIndex: number, actionIndex: number, key: string, value: string) {
    onChange(
      branches.map((b, i) =>
        i === branchIndex
          ? {
              ...b,
              actions: b.actions.map((a, ai) =>
                ai === actionIndex ? { ...a, config: { ...a.config, [key]: value } } : a
              ),
            }
          : b
      )
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-[#737686]">
        Optional: run actions for each subtask, linked issue, or issues matching a JQL query.
      </p>

      {branches.length === 0 && (
        <p className="mb-3 text-xs text-[#C3C6D7] italic">No branches — actions apply directly to the triggering issue.</p>
      )}

      <div className="space-y-4">
        {branches.map((branch, bi) => (
          <div key={bi} className="rounded-lg border border-[#2563EB]/20 bg-[#EFF6FF]/50 p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3v12a4 4 0 004 4h4" />
                  <polyline points="14 5 18 9 14 13" />
                  <line x1="18" y1="9" x2="10" y2="9" />
                </svg>
                Branch {bi + 1}
              </span>
              <button
                type="button"
                onClick={() => removeBranch(bi)}
                className="text-[#C3C6D7] hover:text-red-500 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-3">
              <select
                value={branch.type}
                onChange={(e) => updateBranch(bi, { type: e.target.value as BranchType })}
                className="w-full rounded-md border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs text-[#121C28] focus:border-[#2563EB] focus:outline-none"
              >
                {BRANCH_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>
                    {bt.label}
                  </option>
                ))}
              </select>
            </div>

            {branch.type === "linked_issue" && (
              <div className="mb-3">
                <label className="text-xs font-medium text-[#434655]">Link type</label>
                <input
                  type="text"
                  value={branch.config.linkType || ""}
                  onChange={(e) => updateBranchConfig(bi, "linkType", e.target.value)}
                  placeholder="e.g. Relates, Blocks, Duplicates"
                  className="mt-1 w-full rounded-md border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs text-[#121C28] placeholder:text-[#C3C6D7] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            )}

            {branch.type === "jql" && (
              <div className="mb-3">
                <label className="text-xs font-medium text-[#434655]">JQL query</label>
                <input
                  type="text"
                  value={branch.config.jql || ""}
                  onChange={(e) => updateBranchConfig(bi, "jql", e.target.value)}
                  placeholder="e.g. project = PROJ AND status != Done"
                  className="mt-1 w-full rounded-md border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs text-[#121C28] placeholder:text-[#C3C6D7] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            )}

            <div className="mt-3 border-t border-[#2563EB]/10 pt-3">
              <p className="mb-2 text-xs font-semibold text-[#434655]">Branch actions</p>
              {branch.actions.map((action, ai) => (
                <div key={ai} className="mb-2 flex items-center gap-2">
                  <select
                    value={action.type}
                    onChange={(e) => updateBranchAction(bi, ai, { type: e.target.value as AutomationActionType, config: {} })}
                    className="flex-1 rounded-md border border-[#C3C6D7] bg-white px-2 py-1 text-xs text-[#121C28] focus:border-[#2563EB] focus:outline-none"
                  >
                    {ACTION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={action.config?.status || action.config?.label || action.config?.priority || ""}
                    onChange={(e) => updateBranchActionConfig(bi, ai, "status", e.target.value)}
                    placeholder="Value"
                    className="w-24 rounded-md border border-[#C3C6D7] bg-white px-2 py-1 text-xs text-[#121C28] placeholder:text-[#C3C6D7] focus:border-[#2563EB] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeBranchAction(bi, ai)}
                    className="text-[#C3C6D7] hover:text-red-500"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addBranchAction(bi)}
                className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add action
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addBranch}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 3v12a4 4 0 004 4h4" />
          <polyline points="14 5 18 9 14 13" />
        </svg>
        Add branch
      </button>
    </div>
  );
}
