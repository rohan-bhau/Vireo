"use client";

import { useState } from "react";
import {
  useAddAttachmentMutation,
  useRemoveAttachmentMutation,
  type Attachment,
} from "@/store/taskApi";
import { Button } from "@/components/ui/button";

interface AttachmentListProps {
  taskKey: string;
  attachments: Attachment[];
}

export function AttachmentList({ taskKey, attachments }: AttachmentListProps) {
  const [addAttachment] = useAddAttachmentMutation();
  const [removeAttachment] = useRemoveAttachmentMutation();
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd() {
    if (!url.trim() || !filename.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addAttachment({
        taskKey,
        url: url.trim(),
        filename: filename.trim(),
        publicId: `attach-${Date.now()}`,
      }).unwrap();
      setUrl("");
      setFilename("");
      setShowAdd(false);
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(publicId: string) {
    if (!confirm("Remove this attachment?")) return;
    try {
      await removeAttachment({ taskKey, publicId }).unwrap();
    } catch {}
  }

  function getFileIcon(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) return "🖼";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
    if (["zip", "rar", "tar", "gz"].includes(ext)) return "📦";
    return "📎";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#121C28]">
          Attachments ({attachments.length})
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs font-medium text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
        >
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAdd && (
        <div className="flex flex-col gap-2 rounded-lg border border-[#C3C6D7]/40 bg-white p-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Attachment URL"
            className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
          <input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="File name (e.g. screenshot.png)"
            className="w-full rounded-lg border border-[#C3C6D7] px-3 py-2 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!url.trim() || !filename.trim() || submitting}
              isLoading={submitting}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {attachments.length > 0 ? (
        <div className="flex flex-col gap-2">
          {attachments.map((att) => (
            <div
              key={att.publicId}
              className="flex items-center gap-3 rounded-lg border border-[#C3C6D7]/20 bg-white px-3 py-2"
            >
              <span className="text-base">{getFileIcon(att.filename)}</span>
              <div className="flex flex-1 flex-col min-w-0">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#2563EB] hover:text-[#1d4ed8] truncate transition-colors"
                >
                  {att.filename}
                </a>
              </div>
              <button
                onClick={() => handleRemove(att.publicId)}
                className="flex h-7 w-7 items-center justify-center rounded text-[#C3C6D7] hover:bg-[#F1F2F6] hover:text-red-500 transition-colors"
                title="Remove"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#C3C6D7]">No attachments yet.</p>
      )}
    </div>
  );
}
