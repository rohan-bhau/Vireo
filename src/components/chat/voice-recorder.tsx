"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Send, X } from "lucide-react";

interface VoiceRecorderProps {
  onSendAudio: (blob: Blob, url: string) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSendAudio, onCancel }: VoiceRecorderProps) {
  const [state, setState] = useState<"permission" | "recording" | "preview">("permission");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setState("recording");
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      setState("permission");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setState("preview");
    }
  }, []);

  const handleSend = useCallback(() => {
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = audioUrl || URL.createObjectURL(blob);
      onSendAudio(blob, url);
    }
  }, [audioUrl, onSendAudio]);

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-sm sm:rounded-2xl">
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              state === "recording" ? "bg-red-500/10" : "bg-[#EEF4FF]"
            }`}
          >
            <Mic
              className={`h-6 w-6 ${state === "recording" ? "text-red-500" : "text-[#004AC6]"}`}
            />
          </div>

          {state === "permission" && (
            <>
              <p className="text-sm text-[#737686]">Microphone access is required to record.</p>
              <button
                onClick={startRecording}
                className="rounded-lg bg-[#004AC6] px-4 py-2 text-sm font-medium text-white hover:bg-[#003DA6] transition-colors"
              >
                Allow Microphone
              </button>
              <button
                onClick={onCancel}
                className="text-xs text-[#737686] hover:text-[#121C28]"
              >
                Cancel
              </button>
            </>
          )}

          {state === "recording" && (
            <>
              <p className="text-2xl font-mono font-bold text-[#121C28]">{formatDuration(duration)}</p>
              <p className="text-xs text-[#A0A3B1]">Recording...</p>
              <button
                onClick={stopRecording}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <Square className="h-5 w-5" />
              </button>
            </>
          )}

          {state === "preview" && audioUrl && (
            <>
              <p className="text-sm font-medium text-[#121C28]">Preview</p>
              <audio controls className="h-10 w-full">
                <source src={audioUrl} />
              </audio>
              <p className="text-xs text-[#A0A3B1]">{formatDuration(duration)}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSend}
                  className="flex items-center gap-2 rounded-lg bg-[#004AC6] px-4 py-2 text-sm font-medium text-white hover:bg-[#003DA6] transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
                <button
                  onClick={onCancel}
                  className="rounded-lg border border-[#C3C6D7]/40 px-4 py-2 text-sm font-medium text-[#737686] hover:bg-[#F8F9FF] transition-colors"
                >
                  <X className="h-4 w-4" />
                  Discard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
