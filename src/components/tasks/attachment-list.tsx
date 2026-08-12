"use client";

import { useRef, useState } from "react";
import {
  useUploadAttachmentMutation,
  useRemoveAttachmentMutation,
  type Attachment,
} from "@/store/taskApi";
import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "@/lib/toast";

interface AttachmentListProps {
  taskKey: string;
  attachments: Attachment[];
}

export function AttachmentList({ taskKey, attachments }: AttachmentListProps) {
  const [uploadAttachment, { isLoading: uploading }] = useUploadAttachmentMutation();
  const [removeAttachment] = useRemoveAttachmentMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    try {
      await uploadAttachment({ taskKey, file }).unwrap();
      toastSuccess(`Uploaded ${file.name}`);
    } catch (e) {
      toastError((e as { data?: { message?: string }; message?: string })?.data?.message ||
        (e as { message?: string })?.message ||
        "Upload failed");
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const f of Array.from(files)) await handleFile(f);
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

  function isImage(url: string): boolean {
    return /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(url);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#121C28]">Attachments ({attachments.length})</h3>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? "border-[#2563EB] bg-[#EEF4FF]" : "border-[#C3C6D7] hover:border-[#2563EB] hover:bg-[#F8F9FF]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        />
        <svg className="h-6 w-6 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
        <p className="text-xs text-[#737686]">
          {uploading ? "Uploading..." : "Drop files here or click to upload"}
        </p>
        <p className="text-[10px] text-[#C3C6D7]">Max 15 MB per file</p>
      </div>

      {attachments.length > 0 ? (
        <div className="flex flex-col gap-2">
          {attachments.map((att) => (
            <div
              key={att.publicId}
              className="flex items-center gap-3 rounded-lg border border-[#C3C6D7]/20 bg-white px-3 py-2"
            >
              {isImage(att.url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={att.url} alt={att.filename} className="h-9 w-9 flex-shrink-0 rounded object-cover" />
              ) : (
                <span className="text-base">{getFileIcon(att.filename)}</span>
              )}
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
              <Button size="sm" variant="outline" onClick={() => handleRemove(att.publicId)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-tertiary">No attachments yet.</p>
      )}
    </div>
  );
}