"use client";

import { Sparkles, User } from "lucide-react";
import { clsx } from "clsx";

interface AIChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export function AIChatMessage({ role, content, isLoading }: AIChatMessageProps) {
  return (
    <div className={clsx("flex gap-3", role === "user" ? "flex-row-reverse" : "flex-row")}>
      <div
        className={clsx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          role === "assistant" ? "bg-[#EEF4FF]" : "bg-[#2563EB]"
        )}
      >
        {role === "assistant" ? (
          <Sparkles className="h-4 w-4 text-[#2563EB]" />
        ) : (
          <User className="h-4 w-4 text-white" />
        )}
      </div>
      <div
        className={clsx(
          "max-w-[75%] rounded-xl px-4 py-3",
          role === "user"
            ? "bg-[#2563EB] text-white"
            : "border border-[#C3C6D7]/20 bg-white text-[#434655]"
        )}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {role === "assistant" ? "VIREO AI" : "You"}
          </span>
        </div>
        {isLoading ? (
          <div className="flex gap-1 py-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#2563EB]" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#2563EB]" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#2563EB]" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        )}
      </div>
    </div>
  );
}