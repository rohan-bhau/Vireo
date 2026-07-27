"use client";

import type { AutomationCondition, ConditionOperator } from "@/store/automationApi";

interface ConditionConfigProps {
  conditions: AutomationCondition[];
  onChange: (conditions: AutomationCondition[]) => void;
}

const FIELD_OPTIONS = [
  { value: "type", label: "Type" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
  { value: "assignee", label: "Assignee" },
  { value: "reporter", label: "Reporter" },
  { value: "labels", label: "Labels" },
  { value: "component", label: "Component" },
  { value: "fixVersion", label: "Fix version" },
  { value: "description", label: "Description" },
  { value: "sprintId", label: "Sprint" },
];

const OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does not contain" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
  { value: "changed_to", label: "Changed to" },
  { value: "changed_from", label: "Changed from" },
];

export function ConditionConfig({ conditions, onChange }: ConditionConfigProps) {
  function addCondition() {
    onChange([...conditions, { field: "priority", operator: "equals", value: "" }]);
  }

  function removeCondition(index: number) {
    onChange(conditions.filter((_, i) => i !== index));
  }

  function updateCondition(index: number, updates: Partial<AutomationCondition>) {
    onChange(conditions.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  }

  return (
    <div>
      <p className="mb-3 text-sm text-[#737686]">
        Optional: only run this rule when certain conditions are met. All conditions must be true (AND logic).
      </p>

      {conditions.length === 0 && (
        <p className="mb-3 text-xs text-[#C3C6D7] italic">No conditions — rule will run for all matching triggers.</p>
      )}

      <div className="space-y-3">
        {conditions.map((condition, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-[#C3C6D7]/30 bg-[#F8F9FF] p-3">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <select
                value={condition.field}
                onChange={(e) => updateCondition(i, { field: e.target.value })}
                className="rounded-md border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs text-[#121C28] focus:border-[#2563EB] focus:outline-none"
              >
                {FIELD_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>

              <select
                value={condition.operator}
                onChange={(e) => updateCondition(i, { operator: e.target.value as ConditionOperator })}
                className="rounded-md border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs text-[#121C28] focus:border-[#2563EB] focus:outline-none"
              >
                {OPERATOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {!["is_empty", "is_not_empty"].includes(condition.operator) && (
                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => updateCondition(i, { value: e.target.value })}
                  placeholder="Value"
                  className="flex-1 rounded-md border border-[#C3C6D7] bg-white px-2.5 py-1.5 text-xs text-[#121C28] placeholder:text-[#C3C6D7] focus:border-[#2563EB] focus:outline-none min-w-[100px]"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => removeCondition(i)}
              className="mt-1 shrink-0 text-[#C3C6D7] hover:text-red-500 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCondition}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add condition
      </button>
    </div>
  );
}
