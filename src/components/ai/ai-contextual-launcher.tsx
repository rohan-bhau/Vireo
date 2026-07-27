"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AIChatPanel } from "./ai-chat-panel";

type PageContext = "backlog" | "board" | "reports" | "issue" | "summary";

interface AIContextualLauncherProps {
  context: PageContext;
  taskKey?: string;
  workspaceId?: string;
  projectId?: string;
  onAction?: (action: string) => void;
}

const CONTEXT_ACTIONS: Record<PageContext, { label: string; icon?: string }> = {
  backlog: { label: "Suggest sprint plan" },
  board: { label: "Analyze bottlenecks" },
  reports: { label: "Explain this chart" },
  issue: { label: "Summarize / Draft description" },
  summary: { label: "Ask AI about this workspace" },
};

export function AIContextualLauncher({
  context,
  taskKey,
  workspaceId,
  projectId,
  onAction,
}: AIContextualLauncherProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const action = CONTEXT_ACTIONS[context];

  function handleClick() {
    if (onAction) {
      onAction(context);
    } else {
      setChatOpen(true);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg transition-all hover:bg-[#1d4ed8] hover:shadow-xl hover:scale-105 group"
        title={action.label}
      >
        <Sparkles className="h-5 w-5" />
        <span className="absolute right-14 top-1/2 -translate-y-1/2 rounded-lg bg-[#121C28] px-2.5 py-1.5 text-xs font-medium text-white whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 shadow-lg pointer-events-none">
          {action.label}
        </span>
      </button>
      <AIChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={{ taskKey, workspaceId, projectId }}
      />
    </>
  );
}