"use client";

import { motion } from "framer-motion";

const integrations = [
  {
    name: "GitHub",
    svg: (
      <svg viewBox="0 0 24 24" fill="#121C28" className="h-6 w-6">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
      </svg>
    ),
  },
  {
    name: "GitLab",
    svg: (
      <svg viewBox="0 0 24 24" fill="#E24329" className="h-6 w-6">
        <path d="M12 23.34l-2.08-6.4H2.44l2.06-6.4L12 17.54l2.08-6.4 2.06 6.4-2.08 6.4z" opacity="0.6" />
        <path d="M12 23.34l2.08-6.4h7.48l-2.06-6.4L12 17.54l-2.08-6.4-2.06 6.4h7.48z" opacity="0.8" />
        <path d="M2.44 16.94L0 8.14c-.1-.3.04-.62.32-.76L8.7 3.66a.44.44 0 01.48.12l2.82 3.36 2.82-3.36a.44.44 0 01.48-.12l8.38 3.72c.28.14.42.46.32.76l-2.44 8.8H14.1L12 10.94 9.9 16.94H2.44z" />
      </svg>
    ),
  },
  {
    name: "Slack",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M6.11 13.68a2.74 2.74 0 0 1-2.74-2.74 2.74 2.74 0 0 1 2.74-2.74h2.74v2.74a2.74 2.74 0 0 1-2.74 2.74z" fill="#E01E5A" />
        <path d="M12 13.68a2.74 2.74 0 0 1-2.74-2.74V4.89A2.74 2.74 0 0 1 12 2.15a2.74 2.74 0 0 1 2.74 2.74v6.05A2.74 2.74 0 0 1 12 13.68z" fill="#36C5F0" />
        <path d="M12 23.85a2.74 2.74 0 0 1-2.74-2.74 2.74 2.74 0 0 1 2.74-2.74h2.74v2.74a2.74 2.74 0 0 1-2.74 2.74z" fill="#2EB67D" />
        <path d="M12 23.85a2.74 2.74 0 0 1-2.74-2.74 2.74 2.74 0 0 1 2.74-2.74h2.74v2.74a2.74 2.74 0 0 1-2.74 2.74z" fill="#ECB22E" />
        <path d="M10.32 12a2.74 2.74 0 0 1-2.74 2.74H4.89A2.74 2.74 0 0 1 2.15 12a2.74 2.74 0 0 1 2.74-2.74h2.69A2.74 2.74 0 0 1 10.32 12z" fill="#E01E5A" />
      </svg>
    ),
  },
  {
    name: "Figma",
    svg: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M8.25 2.5a4 4 0 0 0-4 4 4 4 0 0 0 4 4h4v-4a4 4 0 0 0-4-4z" fill="#1ABCFE" />
        <path d="M16.25 2.5a4 4 0 0 0-4 4v4h4a4 4 0 0 0 4-4 4 4 0 0 0-4-4z" fill="#0ACF83" />
        <path d="M12.25 10.5a4 4 0 0 1 0 8 4 4 0 0 1 0-8z" fill="#FF7262" />
        <path d="M8.25 10.5a4 4 0 0 0 0 8 4 4 0 0 0 4-4v-4h-4z" fill="#F24E1E" />
        <path d="M8.25 22.5a4 4 0 0 0 4-4v-4h-4a4 4 0 0 0-4 4 4 4 0 0 0 4 4z" fill="#A259FF" />
      </svg>
    ),
  },
  {
    name: "Docker",
    svg: (
      <svg viewBox="0 0 24 24" fill="#2496ED" className="h-6 w-6">
        <path d="M23.84 9.93c-.44-.3-1.61-.57-2.46-.46-.2-.56-.52-1.06-.92-1.48l-.57-.57-.57.57c-.56.56-.92 1.3-1.04 2.1-.06.42-.04.84.08 1.24-.22.1-.46.16-.7.18H9.24V4.5H7.16v1.69H5.58V4.5H3.5v1.69H1.92V4.5H-.16v1.69H0V17.5c0 1.1.9 2 2 2h17c.92 0 1.72-.62 1.96-1.52.46-1.78 1.12-3.64 2.14-5.34.44-.73.7-1.54.74-2.38 0-.18 0-.36-.08-.52zM2 14.5v-3h3v3H2zm4-3h3v3H6v-3zm4-3h3v3h-3v-3zm0 6h3v3h-3v-3zm4-6h3v3h-3v-3zm0 6h3v3h-3v-3z" />
      </svg>
    ),
  },
  {
    name: "Git",
    svg: (
      <svg viewBox="0 0 24 24" fill="#F05032" className="h-6 w-6">
        <path d="M23.55 11.23L12.77.45a1.54 1.54 0 0 0-2.18 0L8.4 2.64l2.75 2.75a1.83 1.83 0 0 1 2.32 2.32l2.65 2.65a1.83 1.83 0 1 1-1.1 1.1l-2.47-2.47v6.5a1.83 1.83 0 1 1-1.5-.18V8.7a1.83 1.83 0 0 1-.99-2.4L7.34 3.56l-6.9 6.9a1.54 1.54 0 0 0 0 2.18l10.78 10.78a1.54 1.54 0 0 0 2.18 0l10.15-10.15a1.54 1.54 0 0 0 0-2.18z" />
      </svg>
    ),
  },
];

export function IntegrationsSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-[#121C28] md:text-3xl">
            Works with your stack
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#434655]">
            Connect Vireo with the tools your team already uses. No
            configuration headaches.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ staggerChildren: 0.06 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {integrations.map((integration, i) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2 rounded-xl border border-[#C3C6D7]/10 bg-[#F8F9FF] px-5 py-3 transition-all hover:border-[#C3C6D7]/30 hover:shadow-sm"
            >
              {integration.svg}
              <span className="text-sm font-semibold text-[#434655]">
                {integration.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
