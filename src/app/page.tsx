import { Header } from "@/components/sections/header";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { ProductPreviewSection } from "@/components/sections/product-preview-section";
import { TemplateShowcaseSection } from "@/components/sections/template-showcase-section";
import { ModernEngineerSection } from "@/components/sections/modern-engineer-section";
import { AIBenefitsSection } from "@/components/sections/ai-benefits-section";
import { IntegrationsSection } from "@/components/sections/integrations-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { CTASection } from "@/components/sections/cta-section";
import { FooterSection } from "@/components/sections/footer-section";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FF]">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ProductPreviewSection />
        <TemplateShowcaseSection />
        <ModernEngineerSection />
        <AIBenefitsSection />
        <IntegrationsSection />
        <PricingSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
