import { MarketingNavbar } from "@/components/marketing/navbar";
import { HeroSection } from "@/components/marketing/hero-section";
import { TrustedBySection } from "@/components/marketing/trusted-by-section";
import { TemplatesSection } from "@/components/marketing/templates-section";
import { IntegrationsSection } from "@/components/marketing/integrations-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { MarketingFooter } from "@/components/marketing/cta-footer";
import { LeaderQuotesSection } from "@/components/marketing/leader-quotes-section";

export function HomePage() {
  return (
    <>
      <MarketingNavbar />
      <main className="overflow-x-hidden">
        <HeroSection />
        <TrustedBySection />
        <TemplatesSection />
        <IntegrationsSection />
        <FaqSection />
        <TestimonialsSection />
      </main>
      <LeaderQuotesSection />
      <MarketingFooter />
    </>
  );
}
