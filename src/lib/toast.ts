"use client";

import { useSyncExternalStore } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  onClick?: () => void;
  href?: string;
  duration: number;
}

export interface ToastOptions {
  duration?: number;
  onClick?: () => void;
  href?: string;
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

export function toast(message: string, type: ToastType = "info", options: ToastOptions | number = {}) {
  const opts: ToastOptions = typeof options === "number" ? { duration: options } : options;
  const id = nextId++;
  const duration = opts.duration ?? 4000;
  toasts = [...toasts, { id, message, type, onClick: opts.onClick, href: opts.href, duration }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toastError = (message: string, options?: ToastOptions) => toast(message, "error", options);
export const toastSuccess = (message: string, options?: ToastOptions) => toast(message, "success", options);
export const toastInfo = (message: string, options?: ToastOptions) => toast(message, "info", options);