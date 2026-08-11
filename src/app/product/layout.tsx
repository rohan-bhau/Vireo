"use client";

import { MarketingShell } from "@/components/sections/marketing-shell";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}