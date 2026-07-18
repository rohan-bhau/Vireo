"use client";

import { clsx } from "clsx";
import { Check, CheckCheck, FileText, Mic } from "lucide-react";
import type { Message } from "@/store/chatApi";

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ message, isOwn, showSender }: ChatMessageProps) {
  const isRead = message.readBy && message.readBy.length > 0;

  return (
    <div className={clsx("flex gap-2", isOwn ? "justify-end" : "justify-start")}>
      <div className={clsx("max-w-[75%] space-y-1", isOwn && "items-end")}>
        {showSender && !isOwn && (
          <p className="px-1 text-[11px] font-medium text-[#737686]">
            {message.senderName || "Unknown"}
          </p>
        )}
        <div
          className={clsx(
            "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            isOwn
              ? "bg-[#004AC6] text-white rounded-br-md"
              : "bg-white border border-[#C3C6D7]/30 text-[#121C28] rounded-bl-md"
          )}
        >
          {message.type === "voice" ? (
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="text-xs">Voice message</span>
              {message.fileUrl && (
                <audio controls className="h-8 max-w-[180px]">
                  <source src={message.fileUrl} />
                </audio>
              )}
            </div>
          ) : message.type === "file" ? (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-inherit hover:underline"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{message.fileName || "File"}</span>
            </a>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
        <div
          className={clsx(
            "flex items-center gap-1 px-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[10px] text-[#A0A3B1]">{formatTime(message.createdAt)}</span>
          {isOwn && (
            isRead ? (
              <CheckCheck className="h-3 w-3 text-[#004AC6]" />
            ) : (
              <Check className="h-3 w-3 text-[#A0A3B1]" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
