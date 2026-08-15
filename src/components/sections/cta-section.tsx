"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTASection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      className="relative overflow-hidden bg-gradient-to-br from-[#004AC6] via-[#005DA7] to-[#0B82EC] py-20 md:py-28"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-white/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[320px] w-[320px] rounded-full bg-white/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-[280px] w-[280px] rounded-full bg-white/[0.06] blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold tracking-tight text-white md:text-5xl"
        >
          Ready to accelerate your shipping?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-base text-[#D3E3FF] md:text-lg"
        >
          Join 500+ teams who have increased their velocity by 40% with Vireo
          AI.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/register"
            className="rounded-lg bg-white px-8 py-3.5 text-base font-bold text-[#004AC6] shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:bg-gray-50 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)]"
          >
            Get Started for Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/30 bg-white/5 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
          >
            View Case Studies
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
