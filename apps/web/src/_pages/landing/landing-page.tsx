import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import {
  HeroSection,
  HowItWorks,
  PricingCard,
  TrustSignals,
  FaqSection,
  CtaSection,
} from "@/widgets/landing";

export function LandingPage() {
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
