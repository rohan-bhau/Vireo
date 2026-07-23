"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCreateProjectMutation } from "@/store/projectApi";
import type { ProjectTemplate } from "@/store/projectApi";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

type Step = "template" | "configure" | "create";

interface TemplateOption {
  id: ProjectTemplate;
  title: string;
  description: string;
  icon: string;
  recommended?: boolean;
}

const templates: TemplateOption[] = [
  { id: "SCRUM", title: "Scrum", description: "Plan and track work in sprints with a backlog, board, and reports", icon: "🔄", recommended: true },
  { id: "KANBAN", title: "Kanban", description: "Visualize and manage work in a continuous flow with WIP limits", icon: "📋" },
  { id: "BUG_TRACKING", title: "Bug tracking", description: "Track and resolve bugs with a dedicated workflow and reports", icon: "🐛" },
  { id: "PROJECT_MANAGEMENT", title: "Project management", description: "Plan, track, and deliver projects with timeline and task views", icon: "📊" },
  { id: "DEVOPS", title: "DevOps", description: "Connect development and operations with CI/CD pipelines", icon: "⚙️" },
  { id: "TASK_TRACKING", title: "Task tracking", description: "Simple task management for teams that need a lightweight workflow", icon: "✅" },
  { id: "BLANK", title: "Blank project", description: "Start from scratch with no template or predefined settings", icon: "⬜" },
];

const emojis = ["📁", "🚀", "🎯", "💡", "🔧", "📦", "🎨", "⚡", "🌟", "🔥", "💎", "📈"];

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const [step, setStep] = useState<Step>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("📁");
  const [isTeamManaged, setIsTeamManaged] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!key || key === generateKey(name)) {
      setKey(generateKey(value));
    }
  }

  function generateKey(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase())
      .join("")
      .slice(0, 4) || "PROJ";
  }

  function handleTemplateSelect(template: ProjectTemplate) {
    setSelectedTemplate(template);
    setStep("configure");
  }

  function handleBack() {
    setStep("template");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    if (!key.trim()) {
      setError("Project key is required");
      return;
    }

    try {
      const project = await createProject({
        workspaceId,
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
        template: selectedTemplate || undefined,
        avatar,
        isTeamManaged,
      }).unwrap();

      onClose();
      setStep("template");
      setSelectedTemplate(null);
      setName("");
      setKey("");
      setDescription("");
      setAvatar("📁");
      setIsTeamManaged(true);
      router.push(`/p/${project.id}/board`);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create project");
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("template");
      setSelectedTemplate(null);
      setName("");
      setKey("");
      setDescription("");
      setAvatar("📁");
      setIsTeamManaged(true);
      setError(null);
    }, 200);
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Create project" className="max-w-2xl">
      {step === "template" && (
        <div>
          <p className="mb-5 text-sm text-[#737686]">Pick a template to get started, or start from scratch with a blank project.</p>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateSelect(t.id)}
                className={clsx(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
                  selectedTemplate === t.id
                    ? "border-[#2563EB] bg-[#EFF6FF]"
                    : "border-[#C3C6D7]/30 bg-white hover:border-[#2563EB]/40 hover:bg-[#F8F9FF]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <span className="text-sm font-semibold text-[#121C28]">{t.title}</span>
                    {t.recommended && (
                      <span className="ml-2 rounded-full bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">Popular</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#737686] leading-relaxed">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "configure" && (
        <form onSubmit={handleSubmit}>
          <div className="mb-5 flex items-center gap-1 text-xs text-[#737686]">
            <button type="button" onClick={handleBack} className="text-[#2563EB] hover:underline">Templates</button>
            <span>/</span>
            <span className="font-medium text-[#121C28]">Configure</span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="mb-5 flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const current = emojis.indexOf(avatar);
                  setAvatar(emojis[(current + 1) % emojis.length]);
                }}
                className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-[#C3C6D7]/50 bg-[#F8F9FF] text-2xl hover:border-[#2563EB]/40 transition-colors"
                title="Click to change avatar"
              >
                {avatar}
              </button>
            </div>
            <div className="flex-1">
              <Input
                label="Project name"
                placeholder="e.g. Mobile App"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4">
            <Input
              label="Project key"
              placeholder="e.g. MAP"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434655]">Project lead</label>
              <div className="flex items-center gap-2 rounded-lg border border-[#C3C6D7] bg-[#F8F9FF] px-3 py-2.5 text-sm text-[#737686]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                You (current user)
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434655]">Description (optional)</label>
            <textarea
              className="w-full rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
              placeholder="Describe the project..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-5 rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#121C28]">Team-managed project</span>
                  <div className="group relative">
                    <svg className="h-4 w-4 text-[#C3C6D7] cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-64 rounded-lg bg-[#121C28] p-3 text-xs text-white shadow-lg group-hover:block">
                      Team-managed projects are simpler to configure and managed by the team. Company-managed projects are configured by an admin with shared workflows and schemes.
                    </div>
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-[#737686]">Simpler, configured by the team</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTeamManaged(!isTeamManaged)}
                className={clsx(
                  "relative h-6 w-11 rounded-full transition-colors",
                  isTeamManaged ? "bg-[#2563EB]" : "bg-[#C3C6D7]"
                )}
              >
                <span className={clsx(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  isTeamManaged ? "translate-x-[22px]" : "translate-x-0.5"
                )} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#C3C6D7]/20">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create project
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
