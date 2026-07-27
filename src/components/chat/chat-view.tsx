"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Phone, Video, MoreHorizontal, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import type { Conversation, Message } from "@/store/chatApi";
import { useGetMessagesQuery, useMarkConversationReadMutation } from "@/store/chatApi";
import type { RootState } from "@/store";
import { ChatMessage } from "./chat-message";
import { MessageInput } from "./message-input";
import { getSocket } from "@/lib/socket";

interface ChatViewProps {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
  onStartCall?: (type: "audio" | "video") => void;
}

export function ChatView({ conversation, currentUserId, onBack, onStartCall }: ChatViewProps) {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserName = currentUser?.name || "You";

  const [page, setPage] = useState(1);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  const { data, isFetching } = useGetMessagesQuery({
    conversationId: conversation._id,
    page,
  });
  const [markRead] = useMarkConversationReadMutation();

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllMessages(data.messages);
      } else {
        setAllMessages((prev) => [...data.messages, ...prev]);
      }
    }
  }, [data, page]);

  useEffect(() => {
    setAllMessages([]);
    setPage(1);
    setTypingUsers({});
  }, [conversation._id]);

  const isNearBottom = useCallback(() => {
    if (!scrollRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    return scrollHeight - scrollTop - clientHeight < 150;
  }, []);

  useEffect(() => {
    if (page !== 1) return;
    const count = allMessages.length;
    if (count > prevMessageCountRef.current && count > 0) {
      if (prevMessageCountRef.current === 0 || isNearBottom()) {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      }
    }
    prevMessageCountRef.current = count;
  }, [allMessages.length, page, isNearBottom]);

  useEffect(() => {
    markRead(conversation._id);

    const socket = getSocket();
    if (!socket) return;

    socket.emit("join-conversation", conversation._id);
    socket.emit("mark-read", { conversationId: conversation._id, userId: currentUserId });

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversation._id) {
        setAllMessages((prev) => [...prev, message]);
        socket.emit("mark-read", { conversationId: conversation._id, userId: currentUserId });
        markRead(conversation._id);
      }
    };

    const handleTyping = (data: { conversationId: string; userId: string; userName: string }) => {
      if (data.conversationId === conversation._id && data.userId !== currentUserId) {
        setTypingUsers((prev) => ({ ...prev, [data.userId]: data.userName }));
      }
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversation._id) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[data.userId];
          return next;
        });
      }
    };

    const handleReadReceipt = (data: { messageId: string; conversationId: string; userId: string }) => {
      if (data.conversationId === conversation._id) {
        setAllMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId && !msg.readBy.includes(data.userId)
              ? { ...msg, readBy: [...msg.readBy, data.userId] }
              : msg
          )
        );
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
    socket.on("read-receipt", handleReadReceipt);

    return () => {
      socket.emit("leave-conversation", conversation._id);
      socket.off("new-message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
      socket.off("read-receipt", handleReadReceipt);
    };
  }, [conversation._id, currentUserId, markRead]);

  const handleSend = useCallback(
    (content: string) => {
      const socket = getSocket();
      if (!socket) return;
      socket.emit("send-message", {
        conversationId: conversation._id,
        content,
        type: "text",
      });
      socket.emit("stop-typing", {
        conversationId: conversation._id,
        userId: currentUserId,
      });
    },
    [conversation._id, currentUserId]
  );

  const handleTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing", {
      conversationId: conversation._id,
      userId: currentUserId,
      userName: currentUserName,
    });
  }, [conversation._id, currentUserId, currentUserName]);

  const handleStopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("stop-typing", {
      conversationId: conversation._id,
      userId: currentUserId,
    });
  }, [conversation._id, currentUserId]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isFetching) return;
    if (scrollRef.current.scrollTop < 50 && data?.hasMore) {
      setPage((p) => p + 1);
    }
  }, [isFetching, data?.hasMore]);

  const isDM = conversation.type === "dm";
  const otherParticipantId = isDM
    ? conversation.participants.find((p) => p !== currentUserId)
    : undefined;
  const displayName = isDM
    ? conversation.name || otherParticipantId || "User"
    : conversation.name || "Group Chat";
  const isTyping = Object.keys(typingUsers).length > 0;

  const typingLabel = useMemo(() => {
    const names = Object.values(typingUsers);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names[0]} and ${names.length - 1} others are typing...`;
  }, [typingUsers]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#C3C6D7]/20 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737686] hover:bg-[#F8F9FF] md:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-sm font-semibold text-[#004AC6]">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#121C28]">{displayName}</h3>
            {typingLabel && (
              <p className="text-[11px] text-[#004AC6] animate-pulse">
                {typingLabel}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStartCall?.("audio")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors"
            title="Voice call"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={() => onStartCall?.("video")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors"
            title="Video call"
          >
            <Video className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737686] hover:bg-[#F8F9FF] hover:text-[#121C28] transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {isFetching && page > 1 && (
          <div className="flex justify-center py-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C3C6D7] border-t-[#004AC6]" />
          </div>
        )}
        {allMessages.length === 0 && !isFetching && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-tertiary">No messages yet. Start the conversation!</p>
          </div>
        )}
        {allMessages.map((msg, i) => {
          const prevMsg = i > 0 ? allMessages[i - 1] : null;
          const showSender = !prevMsg || prevMsg.senderId !== msg.senderId;
          return (
            <ChatMessage
              key={msg._id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
              showSender={showSender}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
}
