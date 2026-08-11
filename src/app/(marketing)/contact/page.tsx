"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, MessageSquare, Headset, MapPin, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/sections/marketing/page-hero";

const contactChannels = [
  {
    icon: Headset,
    title: "Sales",
    body: "Questions about plans, enterprise, or migrations? Our sales team replies within one business day.",
    email: "sales@vireo.app",
  },
  {
    icon: MessageSquare,
    title: "Support",
    body: "Stuck on a bug or a workflow? Hit us up on chat or email and we'll get back to you fast.",
    email: "support@vireo.app",
  },
  {
    icon: Mail,
    title: "Press",
    body: "For media and partnership inquiries, write to our comms team.",
    email: "press@vireo.app",
  },
];

const offices = [
  { icon: MapPin, city: "Amsterdam", country: "Netherlands", address: "Herengracht 182" },
  { icon: MapPin, city: "Lisbon", country: "Portugal", address: "Av. da Liberdade 110" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Talk to a human"
        subtitle="Pick the right channel below, or send us a message — a real person reads every one."
      />

      <section className="border-t border-[#C3C6D7]/20 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="space-y-4"
            >
              {contactChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.title} className="rounded-xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#004A9E]/10 text-[#004A9E]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#121C28]">{channel.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-[#434655]">{channel.body}</p>
                        <a
                          href={`mailto:${channel.email}`}
                          className="mt-2 inline-block text-sm font-bold text-[#004AC6] transition-colors hover:text-[#003da8]"
                        >
                          {channel.email}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="rounded-xl border border-[#C3C6D7]/20 bg-white p-6">
                <h3 className="mb-3 text-base font-semibold text-[#121C28]">Offices</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {offices.map((office) => {
                    const Icon = office.icon;
                    return (
                      <div key={office.city} className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#737686]" />
                        <div>
                          <p className="text-sm font-semibold text-[#121C28]">
                            {office.city}, {office.country}
                          </p>
                          <p className="text-xs text-[#737686]">{office.address}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="rounded-2xl border border-[#C3C6D7]/20 bg-[#F8F9FF] p-8"
            >
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="h-12 w-12 text-[#10B981]" />
                  <h3 className="mt-4 text-xl font-semibold text-[#121C28]">Message sent</h3>
                  <p className="mt-2 max-w-sm text-sm text-[#434655]">
                    Thanks for reaching out. We&apos;ll get back to you within one business day.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-5"
                >
                  <h2 className="text-xl font-semibold text-[#121C28]">Send us a message</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#737686]">
                        Full name
                      </label>
                      <input
                        id="name"
                        required
                        type="text"
                        placeholder="Ada Lovelace"
                        className="w-full rounded-lg border border-[#C3C6D7]/40 bg-white px-4 py-2.5 text-sm text-[#121C28] outline-none transition-colors placeholder:text-[#B3B8C7] focus:border-[#004AC6]"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#737686]">
                        Work email
                      </label>
                      <input
                        id="email"
                        required
                        type="email"
                        placeholder="you@company.com"
                        className="w-full rounded-lg border border-[#C3C6D7]/40 bg-white px-4 py-2.5 text-sm text-[#121C28] outline-none transition-colors placeholder:text-[#B3B8C7] focus:border-[#004AC6]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="topic" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#737686]">
                      Topic
                    </label>
                    <select
                      id="topic"
                      className="w-full cursor-pointer rounded-lg border border-[#C3C6D7]/40 bg-white px-4 py-2.5 text-sm text-[#121C28] outline-none transition-colors focus:border-[#004AC6]"
                    >
                      <option>Sales & pricing</option>
                      <option>Enterprise & migrations</option>
                      <option>Technical support</option>
                      <option>Partnerships & press</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#737686]">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      placeholder="Tell us a little about what you're trying to do…"
                      className="w-full resize-none rounded-lg border border-[#C3C6D7]/40 bg-white px-4 py-2.5 text-sm text-[#121C28] outline-none transition-colors placeholder:text-[#B3B8C7] focus:border-[#004AC6]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-lg bg-[#004AC6] py-3 text-sm font-bold text-white shadow-[0_4px_6px_rgba(0,74,198,0.10),0_10px_15px_rgba(0,74,198,0.10)] transition-colors hover:bg-[#003da8]"
                  >
                    Send message
                  </button>
                  <p className="text-center text-xs text-[#8A8FA3]">
                    This demo form doesn&apos;t send anywhere — email one of the channels above.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}