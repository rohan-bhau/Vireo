"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateSprintMutation, useUpdateSprintMutation } from "@/store/sprintApi";

interface CreateSprintDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  editSprint?: {
    id: string;
    name: string;
    goal: string | null;
    startDate: string | null;
    endDate: string | null;
  } | null;
}

export function CreateSprintDialog({ open, onClose, projectId, editSprint }: CreateSprintDialogProps) {
  const [createSprint] = useCreateSprintMutation();
  const [updateSprint] = useUpdateSprintMutation();

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editSprint) {
      setName(editSprint.name);
      setGoal(editSprint.goal || "");
      setStartDate(editSprint.startDate ? editSprint.startDate.split("T")[0] : "");
      setEndDate(editSprint.endDate ? editSprint.endDate.split("T")[0] : "");
    } else {
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
    }
  }, [editSprint, open]);

  async function handleSubmit() {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      if (editSprint) {
        await updateSprint({
          sprintId: editSprint.id,
          name: name.trim(),
          goal: goal.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }).unwrap();
      } else {
        await createSprint({
          name: name.trim(),
          goal: goal.trim() || undefined,
          projectId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }).unwrap();
      }
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editSprint ? "Edit sprint" : "Create sprint"}
      className="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Sprint name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sprint 1"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#434655]">Goal</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What should this sprint achieve?"
            rows={3}
            className="w-full resize-none rounded-lg border border-[#C3C6D7] px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            isLoading={submitting}
          >
            {editSprint ? "Save changes" : "Create sprint"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
