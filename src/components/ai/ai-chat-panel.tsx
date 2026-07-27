"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { useChatWithAIMutation } from "@/store/aiApi";
import { AIChatMessage } from "./ai-chat-message";
import { AISuggestedPrompts } from "./ai-suggested-prompts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
  context?: {
    taskKey?: string;
    workspaceId?: string;
    projectId?: string;
  };
}

export function AIChatPanel({ open, onClose, context }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Vireo AI. Ask me about your projects, tasks, or sprints.",
    },
  ]);
  const [input, setInput] = useState("");
  const [chat, { isLoading }] = useChatWithAIMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  async function handleSend(message?: string) {
    const text = message || input.trim();
    if (!text || isLoading) return;
    if (!message) setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    try {
      const res = await chat({ message: text, context }).unwrap();
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting. Please try again." },
      ]);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/20"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-40 flex h-full w-[420px] max-w-full flex-col border-l border-[#C3C6D7]/20 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#C3C6D7]/20 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
                  <Sparkles className="h-4 w-4 text-[#2563EB]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#121C28]">Vireo AI</h2>
                  <p className="text-xs text-[#737686]">Ask me anything</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737686] hover:bg-[#F8F9FF] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-4">
                {messages.length === 1 && (
                  <div className="mb-2">
                    <AISuggestedPrompts onSelect={(p) => handleSend(p)} />
                  </div>
                )}
                {messages.map((msg, i) => (
                  <AIChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isLoading && (
                  <AIChatMessage role="assistant" content="" isLoading />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-[#C3C6D7]/20 px-5 py-4">
              <div className="flex items-center gap-2">
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
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-lg border border-[#C3C6D7] bg-[#F8F9FF] px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#C3C6D7] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}