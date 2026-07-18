"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Mic, Square } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, onStopTyping, disabled }: MessageInputProps) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      onTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onStopTyping(), 2000);

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
      }
    },
    [onTyping, onStopTyping]
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    onStopTyping();
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }, [text, onSend, onStopTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      console.error("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  const sendAudio = useCallback(() => {
    if (audioUrl) {
      onSend("[Voice message]");
      setAudioUrl(null);
    }
  }, [audioUrl, onSend]);

  return (
    <div className="border-t border-[#C3C6D7]/20 bg-white px-4 py-3">
      {audioUrl && (
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-[#F8F9FF] p-2">
          <audio controls className="h-8 flex-1">
            <source src={audioUrl} />
          </audio>
          <button
            onClick={sendAudio}
            className="rounded-lg bg-[#004AC6] px-3 py-1 text-xs text-white hover:bg-[#003DA6] transition-colors"
          >
            Send
          </button>
          <button
            onClick={() => setAudioUrl(null)}
            className="text-xs text-[#737686] hover:text-[#121C28]"
          >
            Discard
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={disabled}
            className="w-full resize-none rounded-xl border border-[#C3C6D7]/40 bg-[#F8F9FF] px-3.5 py-2.5 pr-10 text-sm text-[#121C28] placeholder:text-[#A0A3B1] focus:outline-none focus:border-[#004AC6] focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            recording
              ? "bg-red-500 text-white animate-pulse"
              : "text-[#737686] hover:text-[#121C28] hover:bg-[#F8F9FF]"
          }`}
          title={recording ? "Stop recording" : "Voice message"}
        >
          {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004AC6] text-white hover:bg-[#003DA6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
