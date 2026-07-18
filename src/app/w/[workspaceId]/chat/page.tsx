"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetConversationsQuery } from "@/store/chatApi";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatView } from "@/components/chat/chat-view";
import { CallManager } from "@/components/chat/call-manager";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useCall } from "@/components/chat/use-call";
import { getSocket } from "@/lib/socket";
import { useGetMembersQuery } from "@/store/workspaceApi";
import { MessageSquare } from "lucide-react";
import type { Conversation } from "@/store/chatApi";

export default function ChatPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showMobileList, setShowMobileList] = useState(true);
  const { data: members } = useGetMembersQuery(workspaceId, { skip: !workspaceId });
  const { startCall, callState } = useCall();

  const { data: conversations, isLoading } = useGetConversationsQuery(workspaceId, {
    skip: !workspaceId,
  });

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    socket.on("presence-online", (data: { userId: string }) => {
      setOnlineUsers((prev) => (prev.includes(data.userId) ? prev : [...prev, data.userId]));
    });

    socket.on("presence-offline", (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    return () => {
      socket.off("presence-online");
      socket.off("presence-offline");
    };
  }, []);

  const handleStartCall = useCallback(
    (type: "audio" | "video") => {
      if (!activeConversation) return;
      const otherId = activeConversation.participants.find((p) => p !== user?.id);
      if (otherId) {
        startCall(activeConversation._id, otherId, type);
      }
    },
    [activeConversation, user?.id, startCall]
  );

  return (
    <>
      <CallManager />
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-[#C3C6D7]/20 bg-white">
        <div
          className={`${
            showMobileList || !activeConversation ? "flex" : "hidden"
          } md:flex w-full md:w-80 shrink-0 flex-col border-r border-[#C3C6D7]/20`}
        >
          <div className="border-b border-[#C3C6D7]/20 px-4 py-3">
            <h2 className="text-base font-semibold text-[#121C28]">Team Chat</h2>
            <p className="text-xs text-[#A0A3B1] mt-0.5">
              {onlineUsers.length} online
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations || []}
              activeId={activeConversation?._id}
              onSelect={(conv) => {
                setActiveConversation(conv);
                setShowMobileList(false);
              }}
              onlineUsers={onlineUsers}
              currentUserId={user?.id || ""}
              loading={isLoading}
            />
          </div>
        </div>

        <div
          className={`${
            activeConversation && !showMobileList ? "flex" : "hidden"
          } md:flex flex-1 flex-col`}
        >
          {activeConversation ? (
            <ChatView
              conversation={activeConversation}
              currentUserId={user?.id || ""}
              onBack={() => setShowMobileList(true)}
              onStartCall={handleStartCall}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FF] mb-4">
                <MessageSquare className="h-8 w-8 text-[#004AC6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#121C28]">Team Chat</h3>
              <p className="mt-1 max-w-sm text-sm text-[#737686]">
                Select a conversation from the left or start a new chat with your team members.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
