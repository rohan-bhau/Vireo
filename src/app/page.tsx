import { Header } from "@/components/sections/header";
import { HeroSection } from "@/components/sections/hero-section";
import { ProductPreviewSection } from "@/components/sections/product-preview-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { ModernEngineerSection } from "@/components/sections/modern-engineer-section";
import { AIBenefitsSection } from "@/components/sections/ai-benefits-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { CTASection } from "@/components/sections/cta-section";
import { FooterSection } from "@/components/sections/footer-section";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF]">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProductPreviewSection />
        <FeaturesSection />
        <ModernEngineerSection />
        <AIBenefitsSection />
        <PricingSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
