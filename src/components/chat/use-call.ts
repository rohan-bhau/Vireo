"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getSocket } from "@/lib/socket";

interface CallState {
  status: "idle" | "calling" | "ringing" | "connecting" | "ongoing" | "ended" | "missed" | "declined";
  direction: "incoming" | "outgoing" | null;
  type: "audio" | "video";
  callerId?: string;
  calleeId?: string;
  conversationId?: string;
}

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useCall() {
  const [callState, setCallState] = useState<CallState>({
    status: "idle",
    direction: null,
    type: "audio",
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const startCall = useCallback(
    async (conversationId: string, calleeId: string, type: "audio" | "video") => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === "video",
        });
        setLocalStream(stream);

        const peer = new RTCPeerConnection(iceServers);
        peerRef.current = peer;

        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        peer.onicecandidate = (e) => {
          if (e.candidate) {
            getSocket()?.emit("ice-candidate", {
              targetUserId: calleeId,
              candidate: e.candidate,
            });
          }
        };

        peer.ontrack = (e) => {
          setRemoteStream(e.streams[0]);
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        setCallState({
          status: "calling",
          direction: "outgoing",
          type,
          calleeId,
          conversationId,
        });

        getSocket()?.emit("call-user", {
          conversationId,
          receiverId: calleeId,
          type,
          offer,
        });
      } catch (err) {
        console.error("Failed to start call:", err);
        setCallState({
          status: "idle",
          direction: null,
          type: "audio",
        });
      }
    },
    []
  );

  const acceptCall = useCallback(async (type: "audio" | "video") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      setLocalStream(stream);

      const peer = new RTCPeerConnection(iceServers);
      peerRef.current = peer;

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.onicecandidate = (e) => {
        if (e.candidate && callState.callerId) {
          getSocket()?.emit("ice-candidate", {
            targetUserId: callState.callerId,
            candidate: e.candidate,
          });
        }
      };

      peer.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
      };

      setCallState((prev) => ({
        ...prev,
        status: "connecting",
        direction: "incoming",
        type,
      }));

      return peer;
    } catch (err) {
      console.error("Failed to accept call:", err);
      return null;
    }
  }, [callState.callerId]);

  const endCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    pendingCandidatesRef.current = [];

    if (callState.calleeId) {
      getSocket()?.emit("call-ended", {
        conversationId: callState.conversationId,
        targetUserId: callState.calleeId,
      });
    }
    if (callState.callerId) {
      getSocket()?.emit("call-ended", {
        conversationId: callState.conversationId,
        targetUserId: callState.callerId,
      });
    }

    setCallState({
      status: "idle",
      direction: null,
      type: "audio",
    });
  }, [localStream, callState.calleeId, callState.callerId, callState.conversationId]);

  const rejectCall = useCallback(() => {
    if (callState.callerId) {
      getSocket()?.emit("call-rejected", {
        conversationId: callState.conversationId,
        callerId: callState.callerId,
      });
    }
    setCallState({
      status: "idle",
      direction: null,
      type: "audio",
    });
  }, [callState.callerId, callState.conversationId]);

  const setupPeerAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const peer = new RTCPeerConnection(iceServers);
    peerRef.current = peer;

    peer.onicecandidate = (e) => {
      if (e.candidate && callState.callerId) {
        getSocket()?.emit("ice-candidate", {
          targetUserId: callState.callerId,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };

    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    for (const candidate of pendingCandidatesRef.current) {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
    pendingCandidatesRef.current = [];

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    return answer;
  }, [callState.callerId]);

  const handleRemoteOffer = useCallback(
    async (data: { conversationId: string; callerId: string; type: "audio" | "video"; offer: any }) => {
      setCallState({
        status: "ringing",
        direction: "incoming",
        type: data.type,
        callerId: data.callerId,
        conversationId: data.conversationId,
      });
    },
    []
  );

  const handleCallAccepted = useCallback(
    async (data: { conversationId: string; answer: any }) => {
      if (peerRef.current && callState.status === "calling") {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        setCallState((prev) => ({ ...prev, status: "ongoing" }));
      }
    },
    [callState.status]
  );

  const handleIceCandidate = useCallback(
    async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      if (peerRef.current && peerRef.current.remoteDescription) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else {
        pendingCandidatesRef.current.push(data.candidate);
      }
    },
    []
  );

  const handleCallEnded = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    pendingCandidatesRef.current = [];
    setCallState({
      status: "idle",
      direction: null,
      type: "audio",
    });
  }, [localStream]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("incoming-call", handleRemoteOffer);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-rejected", () => {
      setCallState((prev) => ({ ...prev, status: "declined" }));
      setTimeout(() => {
        setCallState({
          status: "idle",
          direction: null,
          type: "audio",
        });
      }, 2000);
    });

    return () => {
      socket.off("incoming-call", handleRemoteOffer);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-rejected");
    };
  }, [handleRemoteOffer, handleCallAccepted, handleIceCandidate, handleCallEnded]);

  return {
    callState,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    endCall,
    rejectCall,
    setupPeerAnswer,
    setCallState,
  };
}
