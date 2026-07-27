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
    } catch {
      // error handled in use-call
    } finally {
      acceptingRef.current = false;
    }
  }

  const isActive =
    callState.status === "ringing" ||
    callState.status === "calling" ||
    callState.status === "ongoing" ||
    callState.status === "connecting" ||
    callState.status === "declined" ||
    callState.status === "failed";

  return (
    <CallDialog
      open={isActive}
      status={callState.status}
      type={callState.type}
      direction={callState.direction || "incoming"}
      error={callState.error}
      onAccept={handleAccept}
      onReject={rejectCall}
      onEnd={endCall}
      localStream={localStream}
      remoteStream={remoteStream}
    />
  );
}
