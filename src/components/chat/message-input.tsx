"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Mic } from "lucide-react";
import { VoiceRecorder } from "./voice-recorder";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onSendAudio?: (blob: Blob, url: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, onStopTyping, onSendAudio, disabled }: MessageInputProps) {
  const [text, setText] = useState("");
  const [showRecorder, setShowRecorder] = useState(false);
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

  const handleSendAudio = useCallback(
    (_blob: Blob, _url: string) => {
      if (onSendAudio) {
        onSendAudio(_blob, _url);
      } else {
        onSend("[Voice message]");
      }
      setShowRecorder(false);
    },
    [onSendAudio, onSend]
  );

  return (
    <div className="border-t border-[#C3C6D7]/20 bg-white px-4 py-3">
      {showRecorder && (
        <VoiceRecorder
          onSendAudio={handleSendAudio}
          onCancel={() => setShowRecorder(false)}
        />
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
          onClick={() => setShowRecorder(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#737686] hover:text-[#121C28] hover:bg-[#F8F9FF] transition-colors"
          title="Voice message"
        >
          <Mic className="h-4 w-4" />
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
