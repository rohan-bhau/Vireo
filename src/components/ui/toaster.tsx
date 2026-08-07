"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToasts } from "@/lib/toast";

const STYLES: Record<string, string> = {
  success: "border-[#36B37E]/30 bg-[#F0FDF4] text-[#0B7A4B]",
  error: "border-[#FF5630]/30 bg-[#FFFBEB] text-[#DE350B]",
  info: "border-[#C3C6D7]/30 bg-white text-[#121C28]",
};

const ICONS: Record<string, string> = {
  success: "✓",
  error: "!",
  info: "i",
};

export function Toaster() {
  const toasts = useToasts();
  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast }: { toast: { id: number; message: string; type: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: "spring", damping: 22, stiffness: 320 }}
      className={`flex w-full items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${STYLES[toast.type] || STYLES.info}`}
    >
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-current text-white text-[11px] font-bold">
        {ICONS[toast.type] || "i"}
      </span>
      <span className="flex-1">{toast.message}</span>
    </motion.div>
  );
}