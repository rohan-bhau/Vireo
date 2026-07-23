"use client";

import { useState } from "react";
import { useUpdateProjectMutation } from "@/store/projectApi";
import type { Project } from "@/store/projectApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const emojis = ["📁", "🚀", "🎯", "💡", "🔧", "📦", "🎨", "⚡", "🌟", "🔥", "💎", "📈"];

export function ProjectSettingsDetails({ project }: { project: Project }) {
  const [updateProject, { isLoading }] = useUpdateProjectMutation();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [key, setKey] = useState(project.key);
  const [avatar, setAvatar] = useState(project.avatar || "📁");
  const [isTeamManaged, setIsTeamManaged] = useState(project.isTeamManaged);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateProject({
      workspaceId: project.workspaceId,
      projectId: project.id,
      name: name.trim(),
      description: description.trim() || undefined,
      key: key.trim().toUpperCase(),
      avatar,
      isTeamManaged,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#121C28]">Project Details</h2>
        <p className="text-sm text-[#737686]">Manage your project name, key, and description</p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="flex items-center gap-4">
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
          <Input
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#434655]">Description</label>
          <textarea
            className="w-full rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Warning:</strong> Changing the project key will break any existing URLs or integrations that reference the old key.
        </div>

        <Input
          label="Project key"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          required
        />

        <div className="flex items-center justify-between rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] p-4">
          <div>
            <p className="text-sm font-semibold text-[#121C28]">Team-managed project</p>
            <p className="text-xs text-[#737686]">Simpler, configured by the team</p>
          </div>
          <button
            type="button"
            onClick={() => setIsTeamManaged(!isTeamManaged)}
            className={`relative h-6 w-11 rounded-full transition-colors ${isTeamManaged ? "bg-[#2563EB]" : "bg-[#C3C6D7]"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isTeamManaged ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" isLoading={isLoading}>
            Save changes
          </Button>
          {saved && <span className="text-sm text-green-600">Changes saved</span>}
        </div>
      </form>
    </div>
  );
}
