"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Compass, Home } from "lucide-react";
import { MarketingShell } from "@/components/sections/marketing-shell";

export default function NotFound() {
  return (
    <MarketingShell>
      <div className="relative min-h-[60vh] overflow-hidden py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#D9DFF5_0%,_transparent_65%)]" />
        <div className="pointer-events-none absolute -right-40 -top-24 h-[480px] w-[480px] rounded-full bg-[#004AC6]/[0.05] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-[#10B981]/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,74,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,74,198,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_72%)]" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white/80 px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#005DA7] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
            </span>
            Lost in the workspace
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-[#004AC6] via-[#0075FF] to-[#10B981] bg-clip-text text-[7rem] font-bold leading-none tracking-tight text-transparent md:text-[10rem]"
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-semibold tracking-tight text-[#121C28] md:text-3xl"
          >
            This page wandered off the board
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 max-w-xl text-base leading-relaxed text-[#434655]"
          >
            The link may be broken, the page may have been moved, or it never
            existed. Either way, the work you&apos;re looking for is somewhere
            else.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#0075FF] px-8 py-3.5 text-base font-bold text-white shadow-[0_8px_24px_rgba(0,74,198,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,74,198,0.45)]"
            >
              <Home className="h-4.5 w-4.5" />
              Back home
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg border border-[#C3C6D7]/30 bg-white px-8 py-3.5 text-base font-bold text-[#004AC6] shadow-sm transition-all hover:border-[#004AC6]/40 hover:shadow-[0_8px_24px_-8px_rgba(0,74,198,0.25)]"
            >
              <Compass className="h-4.5 w-4.5" />
              Start with Vireo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex items-center gap-2 text-sm text-[#8A8FA3]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Use your browser&apos;s back button to return where you came from</span>
          </motion.div>
        </div>
      </div>
    </MarketingShell>
  );
}