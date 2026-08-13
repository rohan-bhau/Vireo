"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToasts, dismissToast, type Toast } from "@/lib/toast";

const META = {
  success: {
    title: "Success",
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-600",
    accent: "bg-emerald-500",
  },
  error: {
    title: "Error",
    icon: AlertCircle,
    badge: "bg-red-100 text-red-600",
    accent: "bg-red-500",
  },
  info: {
    title: "Notification",
    icon: Info,
    badge: "bg-blue-100 text-blue-600",
    accent: "bg-blue-500",
  },
} as const;

export function Toaster() {
  const toasts = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col items-center gap-2.5 sm:left-4 sm:translate-x-0 sm:items-start sm:max-w-md">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const meta = META[toast.type] || META.info;
  const Icon = meta.icon;
  const clickable = !!(toast.href || toast.onClick);

  const content = (
    <div className="flex w-full items-start gap-3">
      <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${meta.badge}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-[#121C28]">{meta.title}</p>
        <p className="mt-0.5 break-words text-[13px] leading-snug text-[#5B5F6B]">{toast.message}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          dismissToast(toast.id);
        }}
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[#A1A5B0] transition-colors hover:bg-[#F0F1F4] hover:text-[#121C28]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  const wrapper = (children: ReactNode) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: "spring", damping: 24, stiffness: 380 }}
      className="relative w-full overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
    >
      {children}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${meta.accent}`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: toast.duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );

  if (toast.href) {
    return wrapper(
      <Link
        href={toast.href}
        onClick={toast.onClick}
        className={`block px-4 pb-3.5 pt-3.5 ${clickable ? "cursor-pointer" : ""}`}
      >
        {content}
      </Link>
    );
  }

  const Element = toast.onClick ? "button" : "div";
  return wrapper(
    <Element
      type={toast.onClick ? "button" : undefined}
      onClick={toast.onClick}
      className={`block w-full px-4 pb-3.5 pt-3.5 text-left ${clickable ? "cursor-pointer" : ""}`}
    >
      {content}
    </Element>
  );
}
