"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function PricingSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Start your 14-day free trial today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#434655]">
            No credit card required. Invite your team and start building with
            AI-powered clarity in minutes.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-10 max-w-sm rounded-2xl bg-[#F8F9FF] p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
          <div className="text-xs font-bold tracking-[0.8px] text-[#004AC6] uppercase">
            Standard Plan
          </div>
          <div className="mt-4 text-4xl font-bold text-[#121C28]">
            $12
            <span className="text-lg font-medium text-[#434655]">
              / user / mo
            </span>
          </div>
          <p className="mt-3 text-sm text-[#434655]">
            Unlimited projects, AI features included.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#004AC6] px-8 py-3.5 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
          >
            Get Started Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
