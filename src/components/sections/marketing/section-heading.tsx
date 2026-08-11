"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow?: string;
  theme?: "light" | "dark";
  align?: "center" | "left";
  title: string;
  subtitle?: string;
}

export function SectionHeading({ eyebrow, theme = "light", align = "center", title, subtitle }: SectionHeadingProps) {
  const dark = theme === "dark";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className={align === "center" ? "text-center" : "text-left"}
    >
      {eyebrow && (
        <div
          className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
            dark ? "border-white/10 bg-white/5 text-white/70" : "border-[#C3C6D7]/30 bg-white text-[#005DA7] shadow-sm"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-[#60A5FA]" : "bg-[#005DA7]"}`} />
          {eyebrow}
        </div>
      )}
      <h2
        className={`text-3xl font-semibold tracking-tight md:text-4xl ${
          dark ? "text-white" : "text-[#121C28]"
        } ${align === "left" ? "text-left" : ""}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 max-w-2xl text-base leading-relaxed ${align === "center" ? "mx-auto" : ""} ${dark ? "text-white/60" : "text-[#434655]"}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
