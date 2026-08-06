"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/store/api";
import {
  useGetOnboardingQuery,
  useUpdateOnboardingMutation,
  useSubmitOnboardingMutation,
} from "@/store/authApi";
import { completeOnboarding } from "@/store/authSlice";
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Building2,
  Lightbulb,
  LayoutTemplate,
} from "lucide-react";

interface OnboardingPopupProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = ["role", "company", "usecase", "template"] as const;
type Step = (typeof STEPS)[number];

const roles = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "engineering-manager", label: "Engineering Manager" },
  { value: "product-manager", label: "Product Manager" },
  { value: "project-manager", label: "Project Manager" },
  { value: "designer", label: "Designer" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "operations", label: "Operations / IT" },
  { value: "data", label: "Data / Analytics" },
  { value: "support", label: "Support / Customer Success" },
  { value: "founder", label: "Founder / Executive" },
  { value: "other", label: "Other" },
];

const companySizes = ["1-10", "11-50", "51-200", "200+"];

const useCases = [
  {
    value: "software-development",
    label: "Software development",
    desc: "Plan, track and release products",
  },
  {
    value: "project-management",
    label: "Project management",
    desc: "Organize projects and deliverables",
  },
  {
    value: "task-tracking",
    label: "Task tracking",
    desc: "Keep personal or team tasks organized",
  },
  {
    value: "marketing",
    label: "Marketing",
    desc: "Plan campaigns and content",
  },
  {
    value: "operations",
    label: "Operations / IT",
    desc: "Manage workflows and requests",
  },
  {
    value: "other",
    label: "Something else",
    desc: "We'll help you figure it out",
  },
];

const templates = [
  {
    id: "scrum",
    name: "Scrum",
    desc: "Sprints, backlog, velocity tracking",
  },
  {
    id: "kanban",
    name: "Kanban",
    desc: "Continuous flow, WIP limits",
  },
  {
    id: "bug-tracking",
    name: "Bug Tracking",
    desc: "Triage and resolve defects",
  },
  {
    id: "blank",
    name: "Start from scratch",
    desc: "Empty project, you configure everything",
  },
];

const stepMeta: Record<Step, { icon: typeof Briefcase; title: string; subtitle: string }> = {
  role: {
    icon: Briefcase,
    title: "What's your role?",
    subtitle: "We'll tailor your workspace to your job.",
  },
  company: {
    icon: Building2,
    title: "How big is your company?",
    subtitle: "This helps us recommend the right setup.",
  },
  usecase: {
    icon: Lightbulb,
    title: "How will you use Vireo?",
    subtitle: "Choose what fits you best — you can change it later.",
  },
  template: {
    icon: LayoutTemplate,
    title: "Pick a starting template",
    subtitle: "We'll scaffold your first project for you.",
  },
};

export function OnboardingPopup({ open, onClose }: OnboardingPopupProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: draft } = useGetOnboardingQuery();
  const [updateOnboarding] = useUpdateOnboardingMutation();
  const [submitOnboarding, { isLoading: isSubmitting }] = useSubmitOnboardingMutation();

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [useCase, setUseCase] = useState("");
  const [template, setTemplate] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevDraft, setPrevDraft] = useState(draft);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setError(null);
    }
  }

  if (open && draft !== prevDraft) {
    setPrevDraft(draft);
    if (draft) {
      if (draft.role) setRole(draft.role);
      if (draft.companySize) setCompanySize(draft.companySize);
      if (draft.useCase) setUseCase(draft.useCase);
      if (draft.template) setTemplate(draft.template);
      if (draft.workspaceName) setWorkspaceName(draft.workspaceName);
      const draftStep = draft.step as Step | undefined;
      if (draftStep && STEPS.includes(draftStep)) setStep(draftStep);
    }
  }

  const stepIndex = STEPS.indexOf(step);
  const StepIcon = stepMeta[step].icon;

  async function persist(partial: Partial<Record<string, string>>, nextStep: Step) {
    setSaving(true);
    try {
      await updateOnboarding({ ...partial, step: nextStep }).unwrap();
      setStep(nextStep);
    } catch {
      // Persisting the draft is best-effort; still allow navigation.
      setStep(nextStep);
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1]);
    }
  }

  async function handleContinue() {
    setError(null);
    if (step === "role") {
      if (!role) {
        setError("Please select your role to continue.");
        return;
      }
      await persist({ role }, "company");
    } else if (step === "company") {
      if (!companySize) {
        setError("Please select your company size to continue.");
        return;
      }
      await persist({ companySize }, "usecase");
    } else if (step === "usecase") {
      if (!useCase) {
        setError("Please select a use case to continue.");
        return;
      }
      await persist({ useCase }, "template");
    } else if (step === "template") {
      if (!template) {
        setError("Please select a template to continue.");
        return;
      }
      if (!workspaceName.trim()) {
        setError("Please give your workspace a name.");
        return;
      }
      await handleFinish();
    }
  }

  async function handleFinish() {
    setError(null);
    if (!role || !companySize || !useCase || !template || !workspaceName.trim()) {
      setError("Please complete all the steps.");
      return;
    }
    try {
      await submitOnboarding({
        role,
        companySize,
        useCase,
        template,
        workspaceName: workspaceName.trim(),
      }).unwrap();

      dispatch(completeOnboarding());
      dispatch(api.util.invalidateTags(["Workspace"]));
      router.replace("/dashboard");
      onClose();
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ||
          "Something went wrong while creating your workspace."
      );
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex h-full w-full flex-col overflow-hidden bg-surface shadow-modal sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-[3px]"
          >
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-primary-bg">
                  <StepIcon className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-text">
                  Set up your workspace
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-medium text-text-tertiary transition-colors hover:text-text cursor-pointer"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="h-1 w-full bg-bg-neutral">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <h3 className="text-xl font-bold tracking-tight text-text">
                    {stepMeta[step].title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {stepMeta[step].subtitle}
                  </p>

                  {error && (
                    <div className="mt-4 rounded-[3px] border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
                      {error}
                    </div>
                  )}

                  {step === "role" && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {roles.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => {
                            setRole(r.value);
                            setError(null);
                          }}
                          className={`flex cursor-pointer items-center justify-between gap-2 rounded-[3px] border px-4 py-3 text-sm font-medium transition-all ${
                            role === r.value
                              ? "border-primary bg-primary-bg text-primary"
                              : "border-border-light text-text-secondary hover:border-border hover:bg-bg-light"
                          }`}
                        >
                          <span className="truncate text-left">{r.label}</span>
                          {role === r.value && (
                            <Check className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === "company" && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {companySizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setCompanySize(size);
                            setError(null);
                          }}
                          className={`flex cursor-pointer items-center justify-center rounded-[3px] border px-4 py-5 text-sm font-semibold transition-all ${
                            companySize === size
                              ? "border-primary bg-primary-bg text-primary"
                              : "border-border-light text-text-secondary hover:border-border hover:bg-bg-light"
                          }`}
                        >
                          <span>
                            {size}
                            <span className="mt-0.5 block text-xs font-normal text-text-tertiary">
                              members
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === "usecase" && (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {useCases.map((uc) => (
                        <button
                          key={uc.value}
                          type="button"
                          onClick={() => {
                            setUseCase(uc.value);
                            setError(null);
                          }}
                          className={`cursor-pointer rounded-[3px] border p-4 text-left transition-all ${
                            useCase === uc.value
                              ? "border-primary bg-primary-bg"
                              : "border-border-light hover:border-border hover:bg-bg-light"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-text">
                              {uc.label}
                            </span>
                            {useCase === uc.value && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-text-tertiary">{uc.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === "template" && (
                    <div className="mt-6 space-y-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-secondary">
                          Workspace name
                        </label>
                        <input
                          type="text"
                          value={workspaceName}
                          onChange={(e) => {
                            setWorkspaceName(e.target.value);
                            setError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleContinue();
                            }
                          }}
                          placeholder="e.g. Acme Engineering"
                          className="w-full rounded-[3px] border border-border-input bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-placeholder transition-[border-color,box-shadow] duration-[200ms] ease-in-out focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      {templates.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            setTemplate(tpl.id);
                            setError(null);
                          }}
                          className={`w-full cursor-pointer rounded-[3px] border p-4 text-left transition-all ${
                            template === tpl.id
                              ? "border-primary bg-primary-bg"
                              : "border-border-light hover:border-border hover:bg-bg-light"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-text">
                                {tpl.name}
                              </div>
                              <div className="mt-0.5 text-xs text-text-tertiary">
                                {tpl.desc}
                              </div>
                            </div>
                            {template === tpl.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </button>
                       ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-border-light px-6 py-4">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0 || saving || isSubmitting}
                className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-text-tertiary transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <Button
                type="button"
                onClick={handleContinue}
                isLoading={saving || isSubmitting}
                className="cursor-pointer"
              >
                {step === "template" ? "Create workspace" : "Continue"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}