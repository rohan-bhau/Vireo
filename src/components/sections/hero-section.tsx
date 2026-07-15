"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#D9DFF5_0%,_transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm text-[#5C6274]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          New: AI-Sprint Intelligence is live
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#121C28] md:text-5xl lg:text-6xl"
        >
          Plan, track, and ship software with{" "}
          <span className="text-[#004AC6]">AI-powered clarity</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#434655] md:text-lg"
        >
          Vireo combines Jira-style workflow rigor with real-time collaboration
          and AI assistance. Designed for engineering teams who value speed,
          precision, and intelligence.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="rounded-lg bg-[#004AC6] px-8 py-3.5 text-base font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
          >
            Start free trial
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-[#C3C6D7] px-8 py-3.5 text-base font-bold text-[#121C28] transition-colors hover:bg-[#F8F9FF]"
          >
            View demo
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-2 text-xs font-medium text-[#414752]"
        >
          <Shield className="h-3 w-3 text-[#10B981]" />
          Trusted by 2,500+ engineering leaders
        </motion.div>
      </div>
    </section>
  );
}
