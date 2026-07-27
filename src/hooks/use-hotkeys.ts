"use client";

import { useEffect, useCallback, useRef } from "react";

type ShortcutHandler = (e: KeyboardEvent) => void;

interface HotkeyOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  ignoreInputs?: boolean;
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (document.activeElement?.getAttribute("contenteditable") === "true");
}

export function useHotkey(
  key: string,
  handler: ShortcutHandler,
  options: HotkeyOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    ignoreInputs = true,
  } = options;
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const wrappedHandler = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (ignoreInputs && isInputFocused()) return;
      if (e.key === key && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (preventDefault) e.preventDefault();
        handlerRef.current(e);
      }
    },
    [enabled, preventDefault, ignoreInputs, key]
  );

  useEffect(() => {
    document.addEventListener("keydown", wrappedHandler);
    return () => document.removeEventListener("keydown", wrappedHandler);
  }, [wrappedHandler]);
}

export function useHotkeySequence(
  sequence: string[],
  handler: ShortcutHandler,
  options: HotkeyOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    ignoreInputs = true,
  } = options;
  const handlerRef = useRef(handler);
  const bufferRef = useRef<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const wrappedHandler = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (ignoreInputs && isInputFocused()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) {
        bufferRef.current = [];
        return;
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      bufferRef.current.push(e.key.toLowerCase());

      if (bufferRef.current.length > sequence.length) {
        bufferRef.current = bufferRef.current.slice(-sequence.length);
      }

      if (
        bufferRef.current.length === sequence.length &&
        bufferRef.current.every((k, i) => k === sequence[i].toLowerCase())
      ) {
        bufferRef.current = [];
        if (preventDefault) e.preventDefault();
        handlerRef.current(e);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        bufferRef.current = [];
      }, 1500);
    },
    [enabled, preventDefault, ignoreInputs, sequence]
  );

  useEffect(() => {
    document.addEventListener("keydown", wrappedHandler);
    return () => {
      document.removeEventListener("keydown", wrappedHandler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [wrappedHandler]);
}
