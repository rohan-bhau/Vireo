"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For small teams getting started.",
    features: [
      "Up to 10 users",
      "2 projects",
      "10 MB storage",
      "Basic boards",
      "Community support",
    ],
    cta: "Get started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Standard",
    price: "$12",
    period: "per user / month",
    description: "For growing teams that need more power.",
    features: [
      "Unlimited projects",
      "Advanced permissions",
      "AI features included",
      "Automation rules",
      "All reports & dashboards",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For organizations with advanced needs.",
    features: [
      "Unlimited everything",
      "SAML/SSO",
      "Audit logs",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    href: "/contact",
    highlighted: false,
  },
];

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
          viewport={{ once: false, margin: "-80px" }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#434655]">
            Start free, upgrade when you grow. No hidden fees, no surprises.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
          variants={containerVariants}
          className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`relative rounded-2xl border p-8 text-left transition-shadow hover:shadow-lg ${
                plan.highlighted
                  ? "border-[#004AC6] bg-white shadow-[0_4px_24px_rgba(0,74,198,0.08)]"
                  : "border-[#C3C6D7]/20 bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#004AC6] px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Most popular
                </div>
              )}
              <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#004AC6]">
                {plan.name}
              </div>
              <div className="mt-3">
                <span className="text-4xl font-bold text-[#121C28]">
                  {plan.price}
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
                    ? "bg-[#004AC6] text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] hover:bg-[#003da8]"
                    : "border border-[#C3C6D7]/40 text-[#121C28] hover:bg-[#F8F9FF]"
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
