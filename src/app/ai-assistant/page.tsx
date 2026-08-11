"use client";

import { useState, useRef, useEffect } from "react";
import { useChatWithAIMutation, useGetAIHistoryQuery } from "@/store/aiApi";
import { Sparkles, Send, User, Clock, History } from "lucide-react";
import { clsx } from "clsx";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AISuggestedPrompts } from "@/components/ai/ai-suggested-prompts";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

function formatHistoryResponse(response: string): string {
  let text = response.trim();

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    return response.trim();
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return response.trim();
  }

  const lines: string[] = [];
  const push = (label: string, value: unknown, bullet = false) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "string") {
      lines.push(bullet ? `• ${value}` : `${label}: ${value}`);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          const taskKey = obj.taskKey;
          const reason = obj.reason;
          lines.push(`• ${taskKey ? `${taskKey} — ` : ""}${reason ?? ""}`.trim());
        } else if (typeof item === "string" && item.trim()) {
          lines.push(bullet ? `• ${item}` : item);
        }
      });
    }
  };

  if (typeof parsed.summary === "string") {
    lines.push(parsed.summary);
  }
  push("", parsed.keyPoints, true);
  if (typeof parsed.suggestedAction === "string") {
    lines.push(`Next action: ${parsed.suggestedAction}`);
  }

  if (typeof parsed.description === "string") {
    lines.push(parsed.description);
  }
  if (Array.isArray(parsed.acceptanceCriteria)) {
    lines.push("Acceptance criteria:");
    (parsed.acceptanceCriteria as string[]).forEach((c) => lines.push(`• ${c}`));
  }
  if (Array.isArray(parsed.suggestedLabels) && (parsed.suggestedLabels as string[]).length > 0) {
    lines.push(`Labels: ${(parsed.suggestedLabels as string[]).join(", ")}`);
  }

  if (typeof parsed.reasoning === "string") {
    lines.push(parsed.reasoning);
  }
  if (typeof parsed.suggestedType === "string") {
    lines.push(`Type: ${parsed.suggestedType}`);
  }
  if (typeof parsed.suggestedPriority === "string") {
    lines.push(`Priority: ${parsed.suggestedPriority}`);
  }
  if (typeof parsed.suggestedAssignee === "string" && parsed.suggestedAssignee) {
    lines.push(`Assignee: ${parsed.suggestedAssignee}`);
  }

  if (typeof parsed.goal === "string") {
    lines.push(`Sprint goal: ${parsed.goal}`);
  }
  if (typeof parsed.estimatedPoints === "number") {
    lines.push(`Estimated points: ${parsed.estimatedPoints}`);
  }
  if (Array.isArray(parsed.suggestedTasks)) {
    lines.push("Suggested tasks:");
    push("", parsed.suggestedTasks);
  }

  const formatted = lines.filter(Boolean).join("\n").trim();
  return formatted.length > 0 ? formatted : response.trim();
}

function historyPreview(response: string): string {
  return formatHistoryResponse(response).replace(/\s+/g, " ").trim();
}

function AIAssistantContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Vireo AI. Ask me about your projects, tasks, or sprints.",
    },
  ]);
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [chat, { isLoading }] = useChatWithAIMutation();
  const { data: history } = useGetAIHistoryQuery({ limit: 10 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(message?: string) {
    const text = message || input.trim();
    if (!text || isLoading) return;
    if (!message) setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text, timestamp: new Date().toISOString() }]);
    try {
      const res = await chat({ message: text }).unwrap();
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply, timestamp: new Date().toISOString() }]);
    } catch (err: unknown) {
      const msg =
        (err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined) ||
        (err instanceof Error ? err.message : undefined) ||
        "AI request failed. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${msg}` }]);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-6 py-6 max-sm:px-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#121C28]">AI Assistant</h1>
          <p className="text-sm text-[#737686]">
            Ask questions, get suggestions, and manage your projects with AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              showHistory
                ? "border-[#2563EB] bg-[#EEF4FF] text-[#2563EB]"
                : "border-[#C3C6D7]/30 text-[#737686] hover:border-[#2563EB] hover:text-[#2563EB]"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            History
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {showHistory && history && history.length > 0 && (
          <div className="w-64 shrink-0 overflow-y-auto rounded-lg border border-[#C3C6D7]/20 bg-white p-3 max-lg:hidden">
            <h3 className="mb-2 text-xs font-semibold text-[#737686] uppercase tracking-wider">
              Recent Conversations
            </h3>
            <div className="flex flex-col gap-1">
              {history.map((item) => (
                <button
                  key={item._id}
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      { role: "user" as const, content: item.prompt },
                      { role: "assistant" as const, content: formatHistoryResponse(item.response) },
                    ]);
                    setShowHistory(false);
                  }}
                  className="rounded-lg px-2 py-2 text-left hover:bg-[#F8F9FF] transition-colors"
                >
                  <p className="text-xs font-medium text-[#121C28] line-clamp-1">{item.prompt}</p>
                  <p className="text-[11px] text-[#737686] line-clamp-1 mt-0.5">{historyPreview(item.response)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-[#C3C6D7]" />
                    <span className="text-[10px] text-[#C3C6D7]">{item.feature}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.length === 1 && (
              <div className="mb-4">
                <AISuggestedPrompts onSelect={(p) => handleSend(p)} />
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={clsx("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={clsx(
                    "max-w-[80%] rounded-xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-[#2563EB] text-white"
                      : "border border-[#C3C6D7]/20 bg-white text-[#434655]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === "assistant" ? (
                      <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                      {msg.role === "assistant" ? "VIREO AI" : "You"}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 px-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
                  <Sparkles className="h-4 w-4 text-[#2563EB]" />
                </div>
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#2563EB]" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#2563EB]" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#2563EB]" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-[#C3C6D7]/20 pt-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything about your projects..."
              className="flex-1 rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB] text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <AuthGuard>
      <AIAssistantContent />
    </AuthGuard>
  );
}