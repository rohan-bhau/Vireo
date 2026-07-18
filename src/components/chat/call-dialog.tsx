"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { getSocket } from "@/lib/socket";

type CallStatus = "ringing" | "connecting" | "ongoing" | "ended" | "missed" | "declined";

interface CallDialogProps {
  open: boolean;
  type: "audio" | "video";
  direction: "incoming" | "outgoing";
  callerId?: string;
  calleeId?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
  remoteStream?: MediaStream | null;
  localStream?: MediaStream | null;
}

export function CallDialog({
  open,
  type,
  direction,
  callerId,
  calleeId,
  onAccept,
  onReject,
  onEnd,
  remoteStream,
  localStream,
}: CallDialogProps) {
  const [status, setStatus] = useState<CallStatus>("ringing");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (status === "ongoing") {
      timerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = muted;
      });
      setMuted(!muted);
    }
  }, [localStream, muted]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = videoOff;
      });
      setVideoOff(!videoOff);
    }
  }, [localStream, videoOff]);

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  if (!open) return null;

  const isRinging = status === "ringing";
  const isOngoing = status === "ongoing";
  const isVideo = type === "video";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md rounded-2xl bg-[#121C28] p-6 text-center shadow-2xl">
        {isVideo && isOngoing && remoteStream && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full rounded-2xl object-cover"
          />
        )}

        <div className="relative z-10 flex flex-col items-center gap-4">
          {isVideo && localStream && (
            <div className="absolute right-3 top-3 z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-28 w-20 rounded-lg object-cover border-2 border-white/20"
              />
            </div>
          )}

          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${
            isRinging ? "bg-green-500/20" : "bg-white/10"
          }`}>
            <Phone className={`h-8 w-8 ${
              isRinging ? "text-green-500" : "text-white"
            }`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              {direction === "incoming" ? "Incoming Call" : "Calling..."}
            </h3>
            <p className="text-sm text-white/60">
              {isOngoing ? formatDuration(callDuration) : type === "audio" ? "Audio call" : "Video call"}
            </p>
          </div>

          {isOngoing && (
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  muted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              {isVideo && (
                <button
                  onClick={toggleVideo}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    videoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {videoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-6">
            {isRinging && direction === "incoming" && (
              <>
                <button
                  onClick={onAccept}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <Phone className="h-6 w-6" />
                </button>
                <button
                  onClick={onReject}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
              </>
            )}
            {isRinging && direction === "outgoing" && (
              <button
                onClick={onReject}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            )}
            {isOngoing && (
              <button
                onClick={onEnd}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
