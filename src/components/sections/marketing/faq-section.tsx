"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "./section-heading";

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
}

export function FaqSection({
  faqs,
  title = "Frequently asked questions",
  subtitle,
  eyebrow = "FAQ",
}: FaqSectionProps) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="group rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] transition-all hover:border-[#004AC6]/25 hover:bg-white hover:shadow-[0_8px_24px_-8px_rgba(0,74,198,0.15)]"
            >
              <details className="group/faq px-6">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-base font-semibold text-[#121C28]">
                  {faq.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#C3C6D7]/30 bg-white text-[#737686] transition-all group-open/faq:rotate-180 group-open/faq:border-[#004AC6]/40 group-open/faq:text-[#004AC6]">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </summary>
                <p className="border-t border-[#C3C6D7]/15 pb-5 pt-3 text-sm leading-relaxed text-[#434655]">{faq.a}</p>
              </details>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
