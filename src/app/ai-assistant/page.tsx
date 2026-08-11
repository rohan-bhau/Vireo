"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useChatWithAIMutation,
  useGetAIConversationsQuery,
  useLazyGetAIConversationQuery,
  type AIConversationSummary,
} from "@/store/aiApi";
import {
  Sparkles,
  ArrowUp,
  SquarePen,
  Search,
  ArrowLeft,
  Menu,
  MessageSquare,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { AuthGuard } from "@/components/auth/auth-guard";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

const SUGGESTED_PROMPTS = [
  { icon: "TaskSquare", title: "What's happening this week?", prompt: "What's happening this week?" },
  { icon: "ListChecks", title: "Show my tasks", prompt: "Show my tasks" },
  { icon: "Sparkle", title: "Draft a ticket for dark mode", prompt: "Draft a ticket for dark mode" },
  { icon: "Puzzle", title: "What's blocking my sprint?", prompt: "What's blocking my sprint?" },
];

function groupLabel(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Older";
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (diffDays <= 1) return "Today";
  if (diffDays <= 2) return "Yesterday";
  if (diffDays <= 7) return "Previous 7 days";
  if (diffDays <= 30) return "Previous 30 days";
  return "Older";
}

function groupConversations(items: AIConversationSummary[]) {
  const order = ["Today", "Yesterday", "Previous 7 days", "Previous 30 days", "Older"];
  const groups = new Map<string, AIConversationSummary[]>();
  for (const item of items) {
    const label = groupLabel(item.updatedAt);
    const arr = groups.get(label) ?? [];
    arr.push(item);
    groups.set(label, arr);
  }
  return order
    .filter((label) => groups.has(label))
    .map((label) => ({ label, items: groups.get(label)! }));
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function WelcomeScreen({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center pt-10 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple shadow-md">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-2xl font-light text-text sm:text-3xl">How can I help you today?</h1>
      <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((item) => (
          <button
            key={item.title}
            onClick={() => onSelect(item.prompt)}
            className="flex items-center gap-2.5 rounded-xl border border-border-light bg-surface px-4 py-3 text-left text-sm text-text-secondary transition-colors hover:border-border hover:bg-surface-hover"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span className="line-clamp-2">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistorySidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  open,
  onClose,
}: {
  conversations: AIConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.prompt.toLowerCase().includes(q) || c.response.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  const groups = groupConversations(filtered);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={clsx(
          "flex w-[280px] shrink-0 flex-col border-r border-border-light bg-[#f9f9f9]",
          "md:flex",
          open ? "fixed inset-y-0 left-0 z-40 flex md:hidden" : "hidden"
        )}
      >
        <div className="flex items-center gap-2 px-3 pb-2 pt-3">
          <button
            onClick={onNewChat}
            className="flex w-full items-center gap-2.5 rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm font-medium text-text shadow-sm transition-colors hover:bg-surface-hover"
          >
            <SquarePen className="h-4 w-4 text-text" />
            New chat
          </button>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-lg border border-border-light bg-white px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-tertiary"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          {groups.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-text-tertiary">
              {query ? "No matching conversations." : "No conversations yet. Start a new chat!"}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((c) => (
                    <button
                      key={c.conversationId}
                      onClick={() => onSelect(c.conversationId)}
                      className={clsx(
                        "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors",
                        c.conversationId === activeId ? "bg-white shadow-sm" : "hover:bg-white/60"
                      )}
                    >
                      <span className="line-clamp-1 text-sm text-text">{c.prompt}</span>
                      <span className="line-clamp-1 text-xs text-text-tertiary">
                        {formatTime(c.updatedAt)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}

function AIAssistantContent() {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chat, { isLoading }] = useChatWithAIMutation();
  const { data: conversations = [] } = useGetAIConversationsQuery({ limit: 50 });
  const [fetchConversation, { isFetching: loadingConversation }] = useLazyGetAIConversationQuery();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isNewChat = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingConversation]);

  useEffect(() => {
    if (!isNewChat && !loadingConversation) {
      textareaRef.current?.focus();
    }
  }, [isNewChat, loadingConversation]);

  function autoResize() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }

  const resetComposer = useCallback(() => {
    setInput("");
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) ta.style.height = "auto";
    });
  }, []);

  async function handleSend(message?: string) {
    const text = message || input.trim();
    if (!text || isLoading) return;
    if (!message) resetComposer();
    setMessages((prev) => [...prev, { role: "user", content: text, timestamp: new Date().toISOString() }]);
    try {
      const res = await chat({ message: text, conversationId: conversationId || undefined }).unwrap();
      if (res.conversationId) setConversationId(res.conversationId);
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

  function handleNewChat() {
    setConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
  }

  async function handleSelectConversation(id: string) {
    setConversationId(id);
    setSidebarOpen(false);
    try {
      const result = await fetchConversation(id).unwrap();
      if (result.length > 0) {
        setMessages(
          result.flatMap((item) => [
            { role: "user" as const, content: item.prompt, timestamp: item.createdAt },
            { role: "assistant" as const, content: item.response, timestamp: item.createdAt },
          ])
        );
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([{ role: "assistant", content: "Failed to load this conversation." }]);
    }
  }

  const activeConversation = conversations.find((c) => c.conversationId === conversationId);
  const activeTitle = activeConversation?.prompt || (isNewChat ? "New chat" : "");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <HistorySidebar
        conversations={conversations}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-light px-3 md:px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="hidden truncate text-sm font-medium text-text sm:block">{activeTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1.5 rounded-full bg-primary-bg px-2.5 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Vireo AI
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
            {isNewChat ? (
              <WelcomeScreen onSelect={handleSend} />
            ) : (
              <div className="flex flex-col gap-6">
                {messages.map((msg, i) => (
                  <div key={i} className={clsx("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={clsx(
                        "max-w-full whitespace-pre-wrap text-[15px] leading-relaxed sm:max-w-[85%]",
                        msg.role === "user"
                          ? "rounded-2xl bg-[#f1f1f3] px-4 py-3 text-text"
                          : "px-1 text-text"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {(isLoading || loadingConversation) && (
                  <div className="flex gap-1.5 px-1 py-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 px-4 pb-4 pt-2 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-end gap-2 rounded-3xl border border-border-light bg-white p-2 shadow-[0_0_0_0.5px_rgba(0,0,0,0.02),0_4px_20px_rgba(0,0,0,0.06)] focus-within:border-primary">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResize();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Ask anything..."
                className="max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f0f0f] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Send"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-text-tertiary">
              Vireo AI can make mistakes. Check important information.
            </p>
          </div>
        </div>
      </main>
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
