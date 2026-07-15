"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTASection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      className="bg-[#005DA7] py-20 md:py-28"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
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
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="rounded-lg bg-white px-8 py-3.5 text-base font-bold text-[#005DA7] transition-colors hover:bg-gray-100"
          >
            Get Started for Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/30 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10"
          >
            View Case Studies
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
