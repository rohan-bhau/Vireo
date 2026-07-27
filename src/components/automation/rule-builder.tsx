"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
  type AutomationRule,
  type AutomationTrigger,
  type AutomationCondition,
  type AutomationAction,
  type AutomationBranch,
} from "@/store/automationApi";
import { TriggerConfig } from "./trigger-config";
import { ConditionConfig } from "./condition-config";
import { BranchConfig } from "./branch-config";
import { ActionConfig } from "./action-config";
import { RuleSummary } from "./rule-summary";
import { NaturalLanguageInput } from "./natural-language-input";

interface RuleBuilderProps {
  open: boolean;
  onClose: () => void;
  editRule?: AutomationRule;
  projectId?: string;
}

type Step = "details" | "trigger" | "conditions" | "branches" | "actions" | "summary";

const STEPS: { id: Step; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "trigger", label: "Trigger" },
  { id: "conditions", label: "Conditions" },
  { id: "branches", label: "Branches" },
  { id: "actions", label: "Actions" },
  { id: "summary", label: "Summary" },
];

export function RuleBuilder({ open, onClose, editRule, projectId }: RuleBuilderProps) {
  const params = useParams();
  const workspaceId = params.workspaceId as string || editRule?.workspaceId || "";

  const [createRule, { isLoading: isCreating }] = useCreateAutomationRuleMutation();
  const [updateRule, { isLoading: isUpdating }] = useUpdateAutomationRuleMutation();

  const [step, setStep] = useState<Step>("details");
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(editRule?.name || "");
  const [description, setDescription] = useState(editRule?.description || "");
  const [trigger, setTrigger] = useState<AutomationTrigger>(editRule?.trigger || "task.created");
  const [cronExpression, setCronExpression] = useState(editRule?.cronExpression || "");
  const [conditions, setConditions] = useState<AutomationCondition[]>(editRule?.conditions || []);
  const [branches, setBranches] = useState<AutomationBranch[]>(editRule?.branches || []);
  const [actions, setActions] = useState<AutomationAction[]>(editRule?.actions || []);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const partialRule: Partial<AutomationRule> = {
    name,
    description,
    trigger,
    cronExpression,
    conditions,
    branches,
    actions,
  };

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("details");
      setName(editRule?.name || "");
      setDescription(editRule?.description || "");
      setTrigger(editRule?.trigger || "task.created");
      setCronExpression(editRule?.cronExpression || "");
      setConditions(editRule?.conditions || []);
      setBranches(editRule?.branches || []);
      setActions(editRule?.actions || []);
      setError(null);
    }, 200);
  }

  function canProceed(): boolean {
    switch (step) {
      case "details":
        return name.trim().length > 0;
      default:
        return true;
    }
  }

  function handleNext() {
    if (!canProceed()) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex].id);
    }
  }

  function handleBack() {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex].id);
    }
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Rule name is required");
      setStep("details");
      return;
    }
    if (actions.length === 0) {
      setError("At least one action is required");
      setStep("actions");
      return;
    }

    try {
      if (editRule) {
        await updateRule({
          id: editRule._id,
          data: {
            name: name.trim(),
            description,
            trigger,
            cronExpression: trigger === "scheduled" ? cronExpression : undefined,
            conditions,
            branches,
            actions,
            workspaceId: editRule.workspaceId,
          } as Partial<AutomationRule>,
        }).unwrap();
      } else {
        await createRule({
          name: name.trim(),
          description: description.trim() || undefined,
          workspaceId,
          projectId,
          trigger,
          cronExpression: trigger === "scheduled" ? cronExpression : undefined,
          conditions,
          branches,
          actions,
        }).unwrap();
      }
      handleClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? (err as { data: { message: string } }).data?.message
          : undefined;
      setError(msg || "Failed to save rule");
    }
  }

  const handleNaturalLanguageParsed = useCallback(
    (data: { trigger: AutomationTrigger; conditions: AutomationCondition[]; actions: AutomationAction[] }) => {
      setTrigger(data.trigger);
      if (data.trigger !== "scheduled") setCronExpression("");
      if (data.conditions.length > 0) setConditions(data.conditions);
      if (data.actions.length > 0) setActions(data.actions);
      setStep("summary");
    },
    []
  );

  return (
    <Dialog open={open} onClose={handleClose} title={editRule ? "Edit rule" : "Create rule"} className="max-w-2xl">
      <div>
        <div className="mb-5">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => i <= currentStepIndex + 1 && setStep(s.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    i === currentStepIndex
                      ? "text-[#2563EB]"
                      : i < currentStepIndex
                        ? "text-green-600"
                        : "text-[#C3C6D7] cursor-default"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      i === currentStepIndex
                        ? "bg-[#2563EB] text-white"
                        : i < currentStepIndex
                          ? "bg-green-100 text-green-600"
                          : "bg-[#F0F0F5] text-[#C3C6D7]"
                    }`}
                  >
                    {i < currentStepIndex ? (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <span className="mx-1 h-px w-4 bg-[#E5E7EB]" />}
              </div>
            ))}
          </div>
        </div>

        {step === "details" && (
          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm text-[#737686]">Give your rule a name and optional description.</p>
              <Input
                label="Rule name"
                placeholder="e.g. Auto-assign bugs to lead"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this rule does..."
                rows={2}
                className="w-full rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
              />
            </div>
            <NaturalLanguageInput onParsed={handleNaturalLanguageParsed} />
          </div>
        )}

        {step === "trigger" && (
          <TriggerConfig
            value={trigger}
            onChange={setTrigger}
            cronExpression={cronExpression}
            onCronChange={setCronExpression}
          />
        )}

        {step === "conditions" && <ConditionConfig conditions={conditions} onChange={setConditions} />}

        {step === "branches" && <BranchConfig branches={branches} onChange={setBranches} />}

        {step === "actions" && <ActionConfig actions={actions} onChange={setActions} />}

        {step === "summary" && <RuleSummary rule={partialRule} />}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-[#C3C6D7]/20 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step !== "details" && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {step !== "summary" ? (
              <Button type="button" onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSave}
                isLoading={isCreating || isUpdating}
              >
                {editRule ? "Save changes" : "Create rule"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
