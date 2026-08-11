"use client";

import { motion } from "framer-motion";

export interface LegalSection {
  title: string;
  body: string[];
}

export interface LegalPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ eyebrow, title, subtitle, effectiveDate, intro, sections }: LegalPageProps) {
  return (
    <div>
      <section className="relative overflow-hidden pt-20 pb-14 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#D9DFF5_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center rounded-full border border-[#C3C6D7]/30 bg-white px-4 py-1.5 text-sm font-medium text-[#005DA7] shadow-sm"
          >
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#005DA7]" />
            {eyebrow}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold tracking-tight text-[#121C28] md:text-4xl lg:text-5xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-base leading-relaxed text-[#434655] md:text-lg"
          >
            {subtitle}
          </motion.p>
        </div>
      </section>

      <section className="border-t border-[#C3C6D7]/20 bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-8 rounded-lg border border-[#C3C6D7]/20 bg-[#F8F9FF] px-4 py-3 text-xs font-medium text-[#737686]">
            Effective date: {effectiveDate}
          </p>
          <p className="mb-10 leading-relaxed text-[#434655]">{intro}</p>
          <div className="space-y-10">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: idx * 0.03 }}
              >
                <h2 className="text-xl font-semibold text-[#121C28] md:text-2xl">{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mt-3 leading-relaxed text-[#434655]">
                    {paragraph}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}