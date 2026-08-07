"use client";

import { useSyncExternalStore } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toasts: Toast[] = [];
let listeners: Array<() => void> = [];
let nextId = 1;

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return toasts;
}

export function toast(message: string, type: ToastType = "info", duration = 4000) {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const toastError = (message: string) => toast(message, "error");
export const toastSuccess = (message: string) => toast(message, "success");
export const toastInfo = (message: string) => toast(message, "info");
