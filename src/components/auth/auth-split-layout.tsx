"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";

interface AuthSplitLayoutProps {
  variant: "login" | "register";
  children: ReactNode;
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        <div className="mb-8 flex justify-center">
          <Logo variant="full" className="h-10 w-auto" />
        </div>
        {children}
      </motion.div>
    </div>
  );
}