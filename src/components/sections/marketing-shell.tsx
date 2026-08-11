"use client";

import { Header } from "@/components/sections/header";
import { FooterSection } from "@/components/sections/footer-section";
import { MobileMarketingNav } from "@/components/sections/mobile-marketing-nav";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF] pb-[calc(env(safe-area-inset-bottom)+88px)] md:pb-0">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <FooterSection />
      <MobileMarketingNav />
    </div>
  );
}