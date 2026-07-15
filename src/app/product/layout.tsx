"use client";

import { Header } from "@/components/sections/header";
import { FooterSection } from "@/components/sections/footer-section";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF]">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <FooterSection />
    </div>
  );
}
