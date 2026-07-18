"use client";

import { useMemo } from "react";
import { clsx } from "clsx";
import { MessageSquare, Users } from "lucide-react";
import type { Conversation } from "@/store/chatApi";
import { PresenceIndicator } from "./presence-indicator";

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conversation: Conversation) => void;
  onlineUsers: string[];
  currentUserId: string;
  loading?: boolean;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onlineUsers,
  currentUserId,
  loading,
}: ConversationListProps) {
  const sorted = useMemo(
    () =>
      [...conversations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [conversations]
  );

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-[#E8EAF0]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-[#E8EAF0]" />
              <div className="h-2.5 w-40 rounded bg-[#E8EAF0]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-8 w-8 text-[#C3C6D7] mb-2" />
        <p className="text-sm text-[#737686]">No conversations yet</p>
        <p className="text-xs text-[#A0A3B1] mt-1">Start a chat with a team member</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 p-2">
      {sorted.map((conv) => {
        const isDM = conv.type === "dm";
        const otherParticipantId = isDM
          ? conv.participants.find((p) => p !== currentUserId)
          : undefined;
        const isOnline = otherParticipantId ? onlineUsers.includes(otherParticipantId) : false;

        const displayName = isDM
          ? conv.name || otherParticipantId || "User"
          : conv.name || "Group Chat";

        const hasUnread = (conv.unreadCount ?? 0) > 0;

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={clsx(
              "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors",
              activeId === conv._id
                ? "bg-[#EEF4FF]"
                : "hover:bg-[#F8F9FF]"
            )}
          >
            <div className="relative shrink-0">
              <div
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                  isDM
                    ? "bg-[#EEF4FF] text-[#004AC6]"
                    : "bg-[#F0F0F5] text-[#737686]"
                )}
              >
                {isDM ? (
                  displayName.charAt(0).toUpperCase()
                ) : (
                  <Users className="h-4 w-4" />
                )}
              </div>
              {isDM && <PresenceIndicator isOnline={isOnline} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={clsx(
                    "truncate text-sm font-medium",
                    hasUnread ? "text-[#121C28]" : "text-[#434655]"
                  )}
                >
                  {displayName}
                </span>
                {conv.lastMessage && (
                  <span className="shrink-0 text-[10px] text-[#A0A3B1]">
                    {formatDate(conv.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="truncate text-xs text-[#A0A3B1]">
                  {conv.lastMessage
                    ? `${conv.lastMessage.senderName}: ${conv.lastMessage.content}`
                    : "No messages yet"}
                </span>
                {hasUnread && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#004AC6] px-1 text-[9px] font-bold text-white">
                    {conv.unreadCount! > 99 ? "99+" : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
