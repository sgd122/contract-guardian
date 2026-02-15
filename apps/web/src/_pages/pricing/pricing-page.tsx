import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import { PricingCard, FaqSection } from "@/widgets/landing";

export function PricingPage() {
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
