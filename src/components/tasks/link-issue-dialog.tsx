"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useLinkTasksMutation,
  useUnlinkTasksMutation,
  type LinkedTask,
} from "@/store/taskApi";

interface LinkIssueDialogProps {
  open: boolean;
  onClose: () => void;
  taskKey: string;
  existingLinks: LinkedTask[];
}

const LINK_TYPES = [
  { value: "blocks", label: "Blocks" },
  { value: "blocked_by", label: "Blocked by" },
  { value: "relates_to", label: "Relates to" },
  { value: "duplicates", label: "Duplicates" },
  { value: "is_duplicated_by", label: "Is duplicated by" },
  { value: "clones", label: "Clones" },
  { value: "is_cloned_by", label: "Is cloned by" },
];

export function LinkIssueDialog({ open, onClose, taskKey, existingLinks }: LinkIssueDialogProps) {
  const [linkTasks] = useLinkTasksMutation();
  const [unlinkTasks] = useUnlinkTasksMutation();
  const [linkType, setLinkType] = useState("relates_to");
  const [targetKey, setTargetKey] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLink() {
    if (!targetKey.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await linkTasks({ taskKey, linkedTaskKey: targetKey.trim(), linkType: linkType as any }).unwrap();
      setTargetKey("");
      onClose();
    } catch (e: any) {
      setError(e?.data?.message || "Failed to link issues");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnlink(linkedTaskKey: string) {
    try {
      await unlinkTasks({ taskKey, linkedTaskKey }).unwrap();
    } catch {}
  }

  return (
    <Dialog open={open} onClose={onClose} title="Link issue" className="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Link type</label>
          <select
            value={linkType}
            onChange={(e) => setLinkType(e.target.value)}
            className="rounded-[3px] border border-border-input bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {LINK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Issue key</label>
          <input
            value={targetKey}
            onChange={(e) => setTargetKey(e.target.value)}
            placeholder="e.g. WEB-42"
            className="rounded-[3px] border border-border-input bg-surface px-3 py-2 text-sm text-text placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => { if (e.key === "Enter") handleLink(); }}
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleLink} disabled={!targetKey.trim() || submitting} isLoading={submitting}>
            Link
          </Button>
        </div>

        {existingLinks.length > 0 && (
          <div className="border-t border-border-light pt-3">
            <h4 className="text-xs font-semibold text-text-secondary mb-2">Existing links</h4>
            <div className="flex flex-col gap-1">
              {existingLinks.map((link) => (
                <div key={link.taskId} className="flex items-center gap-2 rounded bg-bg-light px-2.5 py-1.5">
                  <span className="text-[11px] font-medium uppercase text-text-placeholder">
                    {link.type.replace("_", " ")}
                  </span>
                  <span className="text-xs font-medium text-primary">{link.taskId}</span>
                  <button
                    type="button"
                    onClick={() => handleUnlink(link.taskId)}
                    className="ml-auto text-text-placeholder hover:text-danger transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}