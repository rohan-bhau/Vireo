"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetOrCreateDMMutation } from "@/store/chatApi";
import { ChatView } from "@/components/chat/chat-view";
import { CallManager } from "@/components/chat/call-manager";
import { connectSocket } from "@/lib/socket";
import { useCall } from "@/components/chat/use-call";
import { useGetWorkspacesQuery } from "@/store/workspaceApi";
import { Loader2 } from "lucide-react";
import type { Conversation } from "@/store/chatApi";

export default function DMPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const user = useSelector((state: RootState) => state.auth.user);
  const [getOrCreateDM] = useGetOrCreateDMMutation();
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { startCall } = useCall();

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    async function init() {
      if (!workspaces.length || !user) return;
      const workspace = workspaces[0];
      try {
        const conv = await getOrCreateDM({
          workspaceId: workspace.id,
          userId,
        }).unwrap();
        setConversation(conv);
      } catch (err) {
        setError("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [workspaces, userId, user, getOrCreateDM]);

  const handleStartCall = useCallback(
    (type: "audio" | "video") => {
      if (!conversation) return;
      const otherId = conversation.participants.find((p) => p !== user?.id);
      if (otherId) {
        startCall(conversation._id, otherId, type);
      }
    },
    [conversation, user?.id, startCall]
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#004AC6]" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-sm text-[#737686]">{error || "Conversation not found"}</p>
      </div>
    );
  }

  return (
    <>
      <CallManager />
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-[#C3C6D7]/20 bg-white">
        <div className="flex-1 flex flex-col">
          <ChatView
            conversation={conversation}
            currentUserId={user?.id || ""}
            onStartCall={handleStartCall}
          />
        </div>
      </div>
    </>
  );
}
