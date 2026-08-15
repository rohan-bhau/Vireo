"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/pricing-data";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function PricingSection() {
  return (
    <section className="bg-[#F8F9FF] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#434655]">
            Start free, upgrade when you grow. Workspace-based pricing billed per user — no
            hidden fees, no surprises.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3 lg:items-start"
        >
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`relative rounded-2xl p-8 text-left transition-all ${
                plan.highlighted
                  ? "border border-[#004AC6]/40 bg-gradient-to-b from-[#004AC6]/[0.05] to-white shadow-[0_4px_24px_rgba(0,74,198,0.14),0_24px_56px_rgba(0,74,198,0.12)] ring-1 ring-[#004AC6]/30 lg:z-10 lg:scale-[1.05]"
                  : "border border-[#C3C6D7]/20 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[#C3C6D7]/40 hover:shadow-[0_12px_32px_rgba(16,24,40,0.08)]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#004AC6] to-[#0B82EC] px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(0,74,198,0.35)]">
                  Most popular
                </div>
              )}
              <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#004AC6]">
                {plan.name}
              </div>
              <div className="mt-3">
                <span className="text-4xl font-bold text-[#121C28]">
                  {plan.price === 0 ? "$0" : `$${plan.price}`}
                </span>
                {plan.period && (
                  <span className="ml-1 text-sm text-[#434655]">
                    / {plan.period}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[#434655]">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-[#434655]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-bold transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-[#004AC6] to-[#0B82EC] text-white shadow-[0_4px_6px_rgba(0,74,198,0.15),0_10px_20px_rgba(0,74,198,0.18)] hover:from-[#003da8] hover:to-[#006fe0]"
                    : "border border-[#C3C6D7]/40 text-[#121C28] hover:border-[#004AC6]/50 hover:bg-[#F8F9FF]"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
