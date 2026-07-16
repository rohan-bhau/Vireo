"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCreateProjectMutation } from "@/store/projectApi";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
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
      }).unwrap();

      onClose();
      setName("");
      setKey("");
      setDescription("");
      router.push(`/p/${project.id}/board`);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create project");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        <Input
          label="Project name"
          placeholder="e.g. Mobile App"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
        />
        <Input
          label="Project key"
          placeholder="e.g. MAP"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#434655]">
            Description (optional)
          </label>
          <textarea
            className="w-full rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
            placeholder="Describe the project..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
