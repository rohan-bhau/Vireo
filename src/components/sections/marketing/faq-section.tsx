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
        <div className="mx-auto mt-12 max-w-3xl">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="border-b border-[#C3C6D7]/20 py-5 last:border-0"
            >
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-[#121C28]">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#737686] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#434655]">{faq.a}</p>
              </details>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
