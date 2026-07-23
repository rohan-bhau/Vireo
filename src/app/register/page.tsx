"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { EmailVerification } from "@/components/auth/email-verification";
import { useRegisterMutation, useSubmitOnboardingMutation } from "@/store/authApi";
import { setCredentials, setOnboarding } from "@/store/authSlice";
import { setTokens } from "@/lib/auth";
import { GuestGuard } from "@/components/auth/guest-guard";
import { Check, ChevronRight, UserRound, Users, Lightbulb, Rocket, LayoutDashboard, Bug } from "lucide-react";

type Step = "account" | "verify" | "onboarding" | "template" | "invite" | "complete";

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const roles = [
  { value: "developer", label: "Developer", icon: UserRound },
  { value: "project-manager", label: "Project Manager", icon: LayoutDashboard },
  { value: "team-lead", label: "Team Lead", icon: Users },
  { value: "admin", label: "Admin", icon: Rocket },
  { value: "other", label: "Other", icon: Lightbulb },
];

const teamSizes = ["1-10", "11-50", "51-200", "200+"];

const useCases = [
  { value: "scrum", label: "Scrum", icon: Users },
  { value: "kanban", label: "Kanban", icon: LayoutDashboard },
  { value: "bug-tracking", label: "Bug tracking", icon: Bug },
  { value: "task-management", label: "Task management", icon: Lightbulb },
  { value: "all", label: "All of the above", icon: Rocket },
];

const templates = [
  { id: "scrum", name: "Scrum", desc: "Sprints, backlog, velocity tracking" },
  { id: "kanban", name: "Kanban", desc: "Continuous flow, WIP limits" },
  { id: "bug-tracking", name: "Bug Tracking", desc: "Triage and resolve defects" },
  { id: "blank", name: "Start from scratch", desc: "Empty project, you configure everything" },
];

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const [onboardingRole, setOnboardingRole] = useState("");
  const [onboardingTeamSize, setOnboardingTeamSize] = useState("");
  const [onboardingUseCase, setOnboardingUseCase] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [register, { isLoading }] = useRegisterMutation();
  const [submitOnboarding, { isLoading: onboardingLoading }] = useSubmitOnboardingMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const activeWorkspaceId = useSelector((state: RootState) => state.workspace.activeWorkspaceId);

  function goTo(next: Step) {
    setDirection(1);
    setStep(next);
  }

  function goBack() {
    setDirection(-1);
    if (step === "verify") setStep("account");
    else if (step === "onboarding") setStep("verify");
    else if (step === "template") setStep("onboarding");
    else if (step === "invite") setStep("template");
  }

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      await register({ name, email, password }).unwrap();
      goTo("verify");
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message || "Registration failed"
      );
    }
  }

  function handleVerified() {
    goTo("onboarding");
  }

  async function handleOnboardingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!onboardingRole || !onboardingTeamSize || !onboardingUseCase) {
      setError("Please fill in all fields to help us tailor your experience.");
      return;
    }
    dispatch(setOnboarding({ role: onboardingRole, teamSize: onboardingTeamSize, useCase: onboardingUseCase }));
    goTo("template");
  }

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplate(templateId);
  }

  async function handleTemplateContinue() {
    if (!selectedTemplate) {
      setError("Please select a template to continue.");
      return;
    }
    setError(null);
    try {
      await submitOnboarding({
        role: onboardingRole,
        teamSize: onboardingTeamSize,
        useCase: onboardingUseCase,
        selectedTemplate,
      }).unwrap();
      dispatch(setOnboarding({ selectedTemplate, completed: true }));
      goTo("invite");
    } catch {
      goTo("invite");
    }
  }

  async function handleSkipInvite() {
    try {
      const result = await register({ name, email, password }).unwrap();
      setTokens(result.data.accessToken, result.data.refreshToken);
      dispatch(setCredentials(result.data));
      goTo("complete");
      setTimeout(() => {
        router.replace(activeWorkspaceId ? `/w/${activeWorkspaceId}` : "/dashboard");
      }, 1500);
    } catch {
      router.replace("/dashboard");
    }
  }

  const stepLabels = ["Account", "Verify", "Onboarding", "Template", "Team"];
  const stepIndex = ["account", "verify", "onboarding", "template", "invite"].indexOf(step);

  function renderStepIndicator() {
    if (step === "complete") return null;
    return (
      <div className="mb-8 flex items-center justify-center gap-1">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                i <= stepIndex
                  ? "bg-[#004AC6] text-white"
                  : "bg-[#E5E7EB] text-[#9CA3AF]"
              }`}
            >
              {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className={`mx-1 h-px w-6 transition-colors ${
                  i < stepIndex ? "bg-[#004AC6]" : "bg-[#E5E7EB]"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <GuestGuard>
      <div className="relative flex min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9FA] to-[#EDEFF2]" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#2563EB]/10 to-transparent blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#2563EB]/6 to-transparent blur-3xl" />
        </div>
        <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center px-6">
          <div className="w-full py-12">
            <div className="mb-10 flex justify-center">
              <Logo variant="full" className="h-10 w-auto" />
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-10 py-12 shadow-sm shadow-black/[0.02]">
              {renderStepIndicator()}

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  {step === "account" && (
                    <div>
                      <h1 className="text-[22px] font-semibold tracking-tight text-[#121C28]">
                        Create an account
                      </h1>
                      <p className="mt-1.5 text-sm text-[#6B7280]">
                        Get started with your engineering workspace.
                      </p>
                      <form onSubmit={handleAccountSubmit} className="mt-8 space-y-5">
                        {error && (
                          <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
                            {error}
                          </div>
                        )}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                            Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="Alex Rivera"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="block w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm text-[#121C28] placeholder:text-[#9CA3AF] transition-shadow focus:border-[#121C28] focus:outline-none focus:ring-[3px] focus:ring-[#121C28]/10"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                            Email
                          </label>
                          <input
                            type="email"
                            placeholder="alex@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="block w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm text-[#121C28] placeholder:text-[#9CA3AF] transition-shadow focus:border-[#121C28] focus:outline-none focus:ring-[3px] focus:ring-[#121C28]/10"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="block w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 pr-10 text-sm text-[#121C28] placeholder:text-[#9CA3AF] transition-shadow focus:border-[#121C28] focus:outline-none focus:ring-[3px] focus:ring-[#121C28]/10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#9CA3AF] transition-colors hover:text-[#374151]"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                  <line x1="1" y1="1" x2="23" y2="23" />
                                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full bg-[#121C28] text-white hover:bg-[#1E293B] cursor-pointer"
                          isLoading={isLoading}
                        >
                          Create Account
                        </Button>
                      </form>
                      <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[#E5E7EB]" />
                        </div>
                        <div className="relative flex justify-center text-xs text-[#9CA3AF]">
                          <span className="bg-white px-3">or continue with</span>
                        </div>
                      </div>
                      <OAuthButtons />
                    </div>
                  )}

                  {step === "verify" && (
                    <EmailVerification
                      email={email}
                      onVerified={handleVerified}
                      onBack={() => setStep("account")}
                    />
                  )}

                  {step === "onboarding" && (
                    <div>
                      <h1 className="text-[22px] font-semibold tracking-tight text-[#121C28]">
                        Tell us about yourself
                      </h1>
                      <p className="mt-1.5 text-sm text-[#6B7280]">
                        Help us tailor Vireo to your needs.
                      </p>
                      <form onSubmit={handleOnboardingSubmit} className="mt-8 space-y-6">
                        {error && (
                          <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
                            {error}
                          </div>
                        )}
                        <div>
                          <label className="mb-2.5 block text-sm font-medium text-[#374151]">
                            What&apos;s your role?
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {roles.map((r) => {
                              const Icon = r.icon;
                              const selected = onboardingRole === r.value;
                              return (
                                <button
                                  key={r.value}
                                  type="button"
                                  onClick={() => setOnboardingRole(r.value)}
                                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                                    selected
                                      ? "border-[#004AC6] bg-[#EEF4FF] text-[#004AC6]"
                                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                                  }`}
                                >
                                  <Icon className="h-4 w-4 shrink-0" />
                                  {r.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <label className="mb-2.5 block text-sm font-medium text-[#374151]">
                            How large is your team?
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {teamSizes.map((size) => {
                              const selected = onboardingTeamSize === size;
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => setOnboardingTeamSize(size)}
                                  className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                                    selected
                                      ? "border-[#004AC6] bg-[#EEF4FF] text-[#004AC6]"
                                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                                  }`}
                                >
                                  {size} members
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <label className="mb-2.5 block text-sm font-medium text-[#374151]">
                            How do you plan to use Vireo?
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {useCases.map((uc) => {
                              const Icon = uc.icon;
                              const selected = onboardingUseCase === uc.value;
                              return (
                                <button
                                  key={uc.value}
                                  type="button"
                                  onClick={() => setOnboardingUseCase(uc.value)}
                                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                                    selected
                                      ? "border-[#004AC6] bg-[#EEF4FF] text-[#004AC6]"
                                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                                  }`}
                                >
                                  <Icon className="h-4 w-4 shrink-0" />
                                  {uc.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={goBack}
                            className="flex-1 cursor-pointer rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                          >
                            Back
                          </button>
                          <Button
                            type="submit"
                            size="lg"
                            className="flex-1"
                          >
                            Continue
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {step === "template" && (
                    <div>
                      <h1 className="text-[22px] font-semibold tracking-tight text-[#121C28]">
                        Choose your starting template
                      </h1>
                      <p className="mt-1.5 text-sm text-[#6B7280]">
                        Based on your answers, we recommend these options.
                      </p>
                      <div className="mt-6 space-y-3">
                        {error && (
                          <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
                            {error}
                          </div>
                        )}
                        {templates.map((tpl) => {
                          const selected = selectedTemplate === tpl.id;
                          return (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => handleTemplateSelect(tpl.id)}
                              className={`w-full cursor-pointer rounded-xl border p-4 text-left transition-all ${
                                selected
                                  ? "border-[#004AC6] bg-[#EEF4FF]"
                                  : "border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-[#121C28]">
                                    {tpl.name}
                                  </div>
                                  <div className="mt-0.5 text-xs text-[#6B7280]">
                                    {tpl.desc}
                                  </div>
                                </div>
                                {selected && (
                                  <Check className="h-5 w-5 text-[#004AC6]" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={goBack}
                          className="flex-1 cursor-pointer rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                        >
                          Back
                        </button>
                        <Button
                          type="button"
                          size="lg"
                          className="flex-1"
                          isLoading={onboardingLoading}
                          onClick={handleTemplateContinue}
                        >
                          Continue
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === "invite" && (
                    <div className="text-center">
                      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FF]">
                        <Users className="h-7 w-7 text-[#004AC6]" />
                      </div>
                      <h1 className="text-[22px] font-semibold tracking-tight text-[#121C28]">
                        Invite your team
                      </h1>
                      <p className="mt-1.5 text-sm text-[#6B7280]">
                        Get your teammates on board. You can always invite
                        people later from workspace settings.
                      </p>
                      <div className="mt-6">
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="colleague@company.com"
                            className="block flex-1 rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm text-[#121C28] placeholder:text-[#9CA3AF] transition-shadow focus:border-[#121C28] focus:outline-none focus:ring-[3px] focus:ring-[#121C28]/10"
                          />
                          <button
                            type="button"
                            className="cursor-pointer rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                          >
                            Send
                          </button>
                        </div>
                        <p className="mt-2 text-left text-xs text-[#9CA3AF]">
                          We&apos;ll send an invitation email. Separate
                          multiple emails with commas.
                        </p>
                      </div>
                      <div className="mt-8 flex flex-col gap-3">
                        <Button
                          type="button"
                          size="lg"
                          className="w-full"
                          onClick={handleSkipInvite}
                        >
                          Skip &rarr; Go to workspace
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === "complete" && (
                    <div className="py-8 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]"
                      >
                        <Check className="h-8 w-8 text-white" />
                      </motion.div>
                      <h1 className="text-[22px] font-semibold tracking-tight text-[#121C28]">
                        You&apos;re all set!
                      </h1>
                      <p className="mt-2 text-sm text-[#6B7280]">
                        Redirecting to your workspace...
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {step === "account" && (
              <p className="mt-8 text-center text-sm text-[#6B7280]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#121C28] transition-colors hover:text-[#6B7280]"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
