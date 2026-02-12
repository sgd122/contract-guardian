import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingCard } from "@/components/landing/pricing-card";
import { TrustSignals } from "@/components/landing/trust-signals";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <PricingCard />
        <TrustSignals />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
