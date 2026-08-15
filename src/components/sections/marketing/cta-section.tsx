"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface CTALink {
  label: string;
  href: string;
}

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primary?: CTALink;
  secondary?: CTALink;
  footnote?: string;
}

export function CTASection({
  title = "Ready to move faster?",
  subtitle = "Join 2,500+ engineering teams already using Vireo to plan, track, and ship better software.",
  primary = { label: "Start free trial", href: "/register" },
  secondary = { label: "Talk to sales", href: "/contact" },
  footnote = "No credit card required. Free tier includes unlimited members.",
}: CTASectionProps) {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004AC6] via-[#00348f] to-[#001f63] px-8 py-14 text-center shadow-[0_20px_60px_-15px_rgba(0,74,198,0.45)] md:px-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.12)_0%,_transparent_70%)]" />
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#4C9AFF]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[#10B981]/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
            {subtitle && <p className="mx-auto mt-4 max-w-xl text-white/70">{subtitle}</p>}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {primary && (
                <Link
                  href={primary.href}
                  className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-bold text-[#004AC6] shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
                >
                  {primary.label}
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              )}
              {secondary && (
                <Link
                  href={secondary.href}
                  className="rounded-lg border border-white/20 px-8 py-3.5 text-base font-bold text-white/90 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
                >
                  {secondary.label}
                </Link>
              )}
            </div>
            {footnote && <p className="mt-4 text-xs text-white/50">{footnote}</p>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}