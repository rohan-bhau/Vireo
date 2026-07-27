"use client";

import { useState } from "react";
import type { AutomationTrigger } from "@/store/automationApi";

interface TriggerConfigProps {
  value: AutomationTrigger;
  onChange: (trigger: AutomationTrigger) => void;
  cronExpression?: string;
  onCronChange?: (cron: string) => void;
}

const triggerOptions: { value: AutomationTrigger; label: string; description: string }[] = [
  { value: "task.created", label: "Issue created", description: "When a new issue is created" },
  { value: "task.updated", label: "Issue updated", description: "When an issue is edited" },
  { value: "task.status_changed", label: "Issue transitioned", description: "When an issue status changes" },
  { value: "task.assigned", label: "Issue assigned", description: "When an issue is assigned" },
  { value: "comment.added", label: "Comment added", description: "When a comment is added to an issue" },
  { value: "scheduled", label: "Scheduled", description: "Run on a schedule (cron expression)" },
  { value: "sprint.started", label: "Sprint started", description: "When a sprint begins" },
  { value: "sprint.completed", label: "Sprint completed", description: "When a sprint ends" },
];

const PRESET_SCHEDULES = [
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every day at 9am", cron: "0 9 * * *" },
  { label: "Every week on Monday 9am", cron: "0 9 * * 1" },
  { label: "Every month on the 1st", cron: "0 0 1 * *" },
];

export function TriggerConfig({ value, onChange, cronExpression = "", onCronChange }: TriggerConfigProps) {
  const [cronInput, setCronInput] = useState(cronExpression);
  const [showPresets, setShowPresets] = useState(false);

  function handleTriggerChange(newTrigger: AutomationTrigger) {
    onChange(newTrigger);
    if (newTrigger !== "scheduled" && onCronChange) {
      onCronChange("");
    }
  }

  function handleCronChange(val: string) {
    setCronInput(val);
    onCronChange?.(val);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-[#737686]">Choose what event triggers this rule.</p>
      <div className="space-y-2">
        {triggerOptions.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTriggerChange(opt.value)}
              className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                selected
                  ? "border-[#2563EB] bg-[#EFF6FF]"
                  : "border-[#C3C6D7]/30 bg-white hover:border-[#2563EB]/40 hover:bg-[#F8F9FF]"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? "border-[#2563EB] bg-[#2563EB]" : "border-[#C3C6D7]"
                }`}
              >
                {selected && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <div>
                <span className={`text-sm font-semibold ${selected ? "text-[#2563EB]" : "text-[#121C28]"}`}>
                  {opt.label}
                </span>
                <p className="text-xs text-[#737686]">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {value === "scheduled" && (
        <div className="mt-4 rounded-lg border border-[#2563EB]/20 bg-[#EFF6FF]/50 p-4">
          <label className="mb-2 block text-xs font-semibold text-[#434655]">Cron expression</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={cronInput}
              onChange={(e) => handleCronChange(e.target.value)}
              placeholder="e.g. 0 9 * * *"
              className="flex-1 rounded-md border border-[#C3C6D7] bg-white px-3 py-2 text-xs text-[#121C28] placeholder:text-[#C3C6D7] focus:border-[#2563EB] focus:outline-none"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="rounded-md border border-[#C3C6D7] bg-white px-3 py-2 text-xs font-medium text-[#737686] hover:bg-[#F8F9FF]"
              >
                Presets
              </button>
              {showPresets && (
                <div className="absolute right-0 top-full z-10 mt-1 w-52 rounded-lg border border-[#C3C6D7]/20 bg-white py-1 shadow-lg">
                  {PRESET_SCHEDULES.map((ps) => (
                    <button
                      key={ps.cron}
                      type="button"
                      onClick={() => {
                        handleCronChange(ps.cron);
                        setShowPresets(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-xs text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28]"
                    >
                      <span>{ps.label}</span>
                      <code className="text-[10px] text-[#C3C6D7]">{ps.cron}</code>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-[10px] text-[#C3C6D7]">
            Format: minute hour day-of-month month day-of-week (e.g., <code className="text-[#2563EB]">0 9 * * *</code> = daily at 9am)
          </p>
        </div>
      )}
    </div>
  );
}
