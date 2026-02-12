import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { PricingCard } from "@/components/landing/pricing-card";
import { FaqSection } from "@/components/landing/faq-section";

export const metadata = {
  title: "가격 정책 - 계약서 지킴이",
  description: "투명한 건당 결제. 첫 1건 무료 분석.",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 text-center">
          <div className="container">
            <h1 className="text-3xl font-bold">가격 정책</h1>
            <p className="mt-3 text-muted-foreground">
              건당 결제, 숨겨진 비용 없이 합리적인 가격으로 이용하세요
            </p>
          </div>
        </section>
        <PricingCard />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
