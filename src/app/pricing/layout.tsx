"use client";

import { MarketingShell } from "@/components/sections/marketing-shell";

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}