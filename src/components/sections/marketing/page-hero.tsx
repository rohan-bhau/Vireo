"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHero({ eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-20 pb-14 md:pt-28 md:pb-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#D9DFF5_0%,_transparent_65%)]" />
      <div className="pointer-events-none absolute -right-40 -top-24 h-[480px] w-[480px] rounded-full bg-[#004AC6]/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,74,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,74,198,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C3C6D7]/30 bg-white/80 px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#005DA7] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
            </span>
            {eyebrow}
          </motion.div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl lg:text-5xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 max-w-2xl text-base leading-relaxed text-[#434655] md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
        {children}
      </div>
    </section>
  );
}