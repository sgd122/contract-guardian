import Script from "next/script";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import {
  HeroSection,
  HowItWorks,
  PricingCard,
  TrustSignals,
  FaqSection,
  CtaSection,
  FAQ_ITEMS,
} from "@/widgets/landing";
import {
  organizationJsonLd,
  productJsonLd,
  faqJsonLd,
} from "@/shared/lib/seo";

export function LandingPage() {
  const orgLd = organizationJsonLd();
  const productLd = productJsonLd();
  const faqLd = faqJsonLd(FAQ_ITEMS);

  return (
    <div className="flex min-h-screen flex-col">
      <Script
        id="ld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <Script
        id="ld-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
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
