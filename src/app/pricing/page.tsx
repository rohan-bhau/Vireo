"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Check, ChevronDown, Users, Sparkles, ShieldCheck, Zap } from "lucide-react";
import type { RootState } from "@/store";
import {
  PRICING_PLANS,
  PRICING_COMPARISON,
  PRICING_FAQ,
  type PricingPlan,
} from "@/lib/pricing-data";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const perUserBills = [
  {
    icon: Users,
    title: "Workspace-based pricing",
    text: "Plans are priced per user (seat) per month. Invite your whole team and only pay for active members.",
  },
  {
    icon: Sparkles,
    title: "AI included on every plan",
    text: "Every plan includes AI calls, automation runs, and unlimited projects. Upgrade to raise your usage limits.",
  },
  {
    icon: ShieldCheck,
    title: "Upgrade instantly",
    text: "Self-serve upgrades via Stripe. Pay securely with card, change plans anytime, cancel when you want.",
  },
];

function PlanCard({ plan, isAuthenticated }: { plan: PricingPlan; isAuthenticated: boolean }) {
  const href = isAuthenticated ? "/dashboard" : plan.href;
  return (
    <motion.div
      variants={itemVariants}
      className={`relative flex flex-col rounded-2xl border bg-white p-8 text-left transition-shadow hover:shadow-lg ${
        plan.highlighted
          ? "border-[#004AC6] shadow-[0_4px_24px_rgba(0,74,198,0.08)]"
          : "border-[#C3C6D7]/20"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#004AC6] px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Most popular
        </div>
      )}
      <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#004AC6]">{plan.name}</div>
      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-bold text-[#121C28]">
          {plan.price === 0 ? "$0" : `$${plan.price}`}
        </span>
        <span className="pb-1 text-sm text-[#434655]">{plan.period}</span>
      </div>
      <p className="mt-2 text-sm text-[#434655]">{plan.description}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm text-[#434655]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
            {feat}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-bold transition-all ${
          plan.highlighted
            ? "bg-[#004AC6] text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] hover:bg-[#003da8]"
            : "border border-[#C3C6D7]/40 text-[#121C28] hover:bg-[#F8F9FF]"
        }`}
      >
        {plan.cta}
      </Link>
    </motion.div>
  );
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#C3C6D7]/20 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#C3C6D7]/20">
            <th className="px-6 py-4 text-left font-semibold text-[#121C28]">Compare plans</th>
            {PRICING_PLANS.map((p) => (
              <th key={p.id} className="px-4 py-4 text-left font-semibold text-[#121C28]">
                {p.name}
                <div className="mt-1 text-xs font-normal text-[#737686]">
                  {p.price === 0 ? "$0" : `$${p.price} / user / mo`}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PRICING_COMPARISON.map((row, idx) => (
            <tr key={row.label} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F9FF]/60"}>
              <td className="px-6 py-3 font-medium text-[#121C28]">{row.label}</td>
              {[row.free, row.pro, row.enterprise].map((value, i) => (
                <td key={i} className="px-4 py-3 text-[#434655]">
                  {value === "Included" ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#10B981]">
                      <Check className="h-4 w-4" /> Included
                    </span>
                  ) : (
                    value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {PRICING_FAQ.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.question}
            className="overflow-hidden rounded-xl border border-[#C3C6D7]/20 bg-white"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left"
            >
              <span className="text-sm font-semibold text-[#121C28]">{faq.question}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#737686] transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-[#C3C6D7]/10 px-6 py-4 text-sm leading-relaxed text-[#434655]">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PricingPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div>
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-5xl">
              Simple pricing that scales with your team
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[#434655]">
              Start free and upgrade when you grow. Workspace-based pricing billed per user,
              with unlimited projects on every plan.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3"
          >
            {PRICING_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isAuthenticated={isAuthenticated} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#C3C6D7]/20 bg-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {perUserBills.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#004A9E]/10 text-[#004A9E]">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#121C28]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434655]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-[#121C28] md:text-3xl">
            Compare all features
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[#434655]">
            Every plan includes unlimited projects, boards, and list views. Here&apos;s what else you get.
          </p>
          <div className="mt-10">
            <ComparisonTable />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-[#121C28] md:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-10">
            <FaqSection />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-2xl border border-[#C3C6D7]/20 bg-white p-10 shadow-[0_4px_24px_rgba(0,74,198,0.06)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#004A9E]/10 text-[#004A9E]">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[#121C28]">Ready to get started?</h2>
            <p className="mx-auto mt-2 max-w-lg text-[#434655]">
              Create your workspace free today and invite up to 10 teammates. Upgrade anytime
              from workspace settings.
            </p>
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#004AC6] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-all hover:bg-[#003da8]"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
