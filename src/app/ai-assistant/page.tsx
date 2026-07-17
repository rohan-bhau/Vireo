"use client";

import { useState } from "react";
import { useChatWithAIMutation } from "@/store/aiApi";
import { Sparkles, Send, User } from "lucide-react";
import { clsx } from "clsx";
import { AuthGuard } from "@/components/auth/auth-guard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function AIAssistantContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm VIREO AI. I can help you with writing tickets, summarizing discussions, planning sprints, and answering project management questions. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [chat, { isLoading }] = useChatWithAIMutation();

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    try {
      const res = await chat({ message: userMessage }).unwrap();
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err: any) {
      const message = err?.data?.message || err?.message || "AI request failed. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${message}` }]);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-6 py-6 max-sm:px-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#121C28]">AI Assistant</h1>
        <p className="text-sm text-[#737686]">Ask questions, get suggestions, and manage your projects with AI</p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
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
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
        </div>

        <div className="flex items-center gap-2 border-t border-[#C3C6D7]/20 pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask me anything about your projects..."
            className="flex-1 rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB] text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
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