"use client";

import { useRef } from "react";
import { CallDialog } from "./call-dialog";
import { useCall } from "./use-call";

export function CallManager() {
  const {
    callState,
    localStream,
    remoteStream,
    acceptCall,
    endCall,
    rejectCall,
  } = useCall();
  const acceptingRef = useRef(false);

  async function handleAccept() {
    if (acceptingRef.current) return;
    acceptingRef.current = true;
    try {
      await acceptCall(callState.type);
    } finally {
      acceptingRef.current = false;
    }
  }

  const isActive =
    callState.status === "ringing" ||
    callState.status === "calling" ||
    callState.status === "ongoing" ||
    callState.status === "connecting" ||
    callState.status === "declined";

  return (
    <CallDialog
      open={isActive}
      type={callState.type}
      direction={callState.direction || "incoming"}
      onAccept={handleAccept}
      onReject={rejectCall}
      onEnd={endCall}
      localStream={localStream}
      remoteStream={remoteStream}
    />
  );
}
