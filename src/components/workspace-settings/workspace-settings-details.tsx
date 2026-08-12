"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useUploadWorkspaceAvatarMutation,
} from "@/store/workspaceApi";
import type { ProjectTemplate } from "@/store/projectApi";
import { WorkspaceTypePicker } from "@/components/workspace/workspace-type-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Check, ImagePlus, Upload, Sparkles, Pencil } from "lucide-react";
import { PRESET_AVATARS } from "@/lib/avatar-utils";
import { useSettings } from "@/lib/settings-context";
import { SkeletonSettingsPage } from "@/components/ui/skeleton";

export function WorkspaceSettingsDetails() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { isAdmin } = useSettings();

  const { data: workspace, isLoading } = useGetWorkspaceQuery(workspaceId);
  const [updateWorkspace, { isLoading: isUpdating }] = useUpdateWorkspaceMutation();
  const [uploadAvatar] = useUploadWorkspaceAvatarMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<ProjectTemplate>("KANBAN");
  const [saveState, setSaveState] = useState<"idle" | "success" | "error">("idle");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [lastSyncedName, setLastSyncedName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (workspace && name !== workspace.name && lastSyncedName !== workspace.name) {
    setLastSyncedName(workspace.name);
    setName(workspace.name);
    setDescription(workspace.description || "");
    setTemplate(workspace.template || "KANBAN");
  }

  if (isLoading) {
    return <SkeletonSettingsPage />;
  }

  if (!workspace) {
    return (
      <div className="rounded-xl border border-border-light bg-surface p-8 text-center text-sm text-text-tertiary">
        Workspace not found.
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("idle");
    if (!name.trim()) {
      setNameError("Workspace name is required");
      return;
    }
    setNameError(null);
    try {
      await updateWorkspace({
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        template,
      }).unwrap();
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }

  async function handlePickPreset(preset: string) {
    try {
      await updateWorkspace({
        workspaceId,
        avatar: preset,
      }).unwrap();
      setShowAvatarPicker(false);
    } catch {
      setAvatarError("Failed to update workspace icon");
    }
  }

  async function handleUpload(file: File) {
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose a PNG or JPG image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 5MB");
      return;
    }
    try {
      await uploadAvatar({ workspaceId, file }).unwrap();
      setShowAvatarPicker(false);
    } catch (err: unknown) {
      setAvatarError(
        (err as { data?: { message?: string } })?.data?.message ||
          "Upload failed — file uploads may not be configured"
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">General details</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Workspace name, description, and default working style.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-xl border border-border-light bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text">Workspace icon</p>
            <p className="mt-1 text-sm text-text-tertiary">
              {isAdmin ? "Pick a preset icon or upload your own image (PNG/JPG, up to 5MB)." : "Set by a workspace admin."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Avatar name={workspace.name} avatar={workspace.avatar} size="lg" />
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => { setAvatarError(null); setShowAvatarPicker(true); }}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Change
              </Button>
            )}
          </div>
        </div>

        {isAdmin ? (
          <>
            <Input
              label="Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(null); }}
              error={nameError || undefined}
              placeholder="Acme Inc."
            />

            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this workspace about?"
            />

            <WorkspaceTypePicker value={template} onChange={setTemplate} />

            {saveState === "success" && (
              <p className="flex items-center gap-1.5 text-sm text-green-600">
                <Check className="h-4 w-4" /> Changes saved
              </p>
            )}
            {saveState === "error" && (
              <p className="text-sm text-danger">Could not save changes. Please try again.</p>
            )}

            <Button type="submit" isLoading={isUpdating}>Save changes</Button>
          </>
        ) : (
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Name</dt>
              <dd className="mt-1 text-sm font-medium text-text">{workspace.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Description</dt>
              <dd className="mt-1 text-sm text-text-secondary">{workspace.description || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Working style</dt>
              <dd className="mt-1 text-sm text-text-secondary">
                {workspace.template === "SCRUM" ? "Scrum" : "Kanban"}
              </dd>
            </div>
          </dl>
        )}
      </form>

      <Dialog open={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} title="Change workspace icon" className="max-w-md">
        <div className="space-y-5">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Sparkles className="h-3.5 w-3.5" /> Preset icons
            </p>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePickPreset(preset)}
                  title="Use this icon"
                  className={`rounded-lg border border-border-light transition-transform hover:scale-105 ${
                    workspace.avatar === preset
                      ? "border-primary ring-2 ring-primary/40"
                      : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preset} alt="preset" className="h-full w-full rounded-lg" />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border-light pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Upload className="h-3.5 w-3.5" /> Upload image
            </p>
            <Button variant="outline" size="sm" className="w-full gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
              Choose a file
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
          </div>

          {avatarError && <p className="text-xs text-danger">{avatarError}</p>}
        </div>
      </Dialog>

      <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Check className="h-3.5 w-3.5" />
        New workspaces get a preset icon automatically — swap it anytime.
      </p>
    </div>
  );
}