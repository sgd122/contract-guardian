import { Shield, Target, Lock, Zap } from "lucide-react";
import { FadeIn, StaggerList, AnimatedCard } from "@cg/ui";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { CtaSection } from "@/components/landing/cta-section";

export const metadata = {
  title: "서비스 소개 - 계약서 지킴이",
  description:
    "프리랜서와 1인 사업자를 위한 AI 계약서 분석 서비스를 소개합니다.",
};

const VALUES = [
  {
    icon: Target,
    title: "정확한 분석",
    description:
      "8대 핵심 체크 항목을 기준으로 계약서의 위험 요소를 정확하게 식별합니다. 대금 조건, 업무 범위, 지적재산권, 해지 조건 등을 꼼꼼히 검토합니다.",
  },
  {
    icon: Zap,
    title: "빠른 결과",
    description:
      "업로드 후 2~3분 내에 분석 결과를 제공합니다. 계약 체결 전 빠르게 위험 요소를 파악할 수 있습니다.",
  },
  {
    icon: Lock,
    title: "안전한 보관",
    description:
      "업로드된 계약서는 암호화되어 저장되며, 분석 완료 후 90일 이내에 자동 삭제됩니다. 제3자에게 공유되지 않습니다.",
  },
  {
    icon: Shield,
    title: "프리랜서 특화",
    description:
      "프리랜서와 1인 사업자가 자주 겪는 불리한 조건을 집중적으로 분석합니다. 쉬운 한국어로 설명하고 수정 방향을 제안합니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20">
          <div className="container max-w-3xl text-center">
            <FadeIn>
              <h1 className="text-3xl font-bold md:text-4xl">
                프리랜서의 계약을 지키는
                <br />
                <span className="text-primary">AI 파트너</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                계약서 지킴이는 프리랜서와 1인 사업자가 불리한 계약 조건에
                노출되지 않도록 AI 기술을 활용하여 계약서를 분석하고,
                위험 요소를 찾아 수정 방향을 제안하는 서비스입니다.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="container">
            <FadeIn>
              <h2 className="text-center text-2xl font-bold">
                핵심 가치
              </h2>
            </FadeIn>

            <StaggerList className="mt-12 grid gap-8 md:grid-cols-2">
              {VALUES.map((value) => (
                <AnimatedCard key={value.title} className="p-8">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </AnimatedCard>
              ))}
            </StaggerList>
          </div>
        </section>

        <section className="py-20">
          <div className="container max-w-3xl">
            <FadeIn>
              <h2 className="text-center text-2xl font-bold">
                왜 계약서 검토가 중요한가요?
              </h2>
              <div className="mt-8 space-y-4 text-muted-foreground">
                <p>
                  프리랜서의 73%가 계약서를 꼼꼼히 검토하지 않고 서명한
                  경험이 있다고 합니다. 불리한 계약 조건은 대금 지급 지연,
                  과도한 수정 요구, 지적재산권 분쟁 등 심각한 문제로
                  이어질 수 있습니다.
                </p>
                <p>
                  계약서 지킴이는 이러한 문제를 사전에 방지할 수 있도록,
                  계약서의 주요 조항을 분석하고 위험 요소를 쉬운 한국어로
                  설명합니다.
                </p>
                <p className="text-xs">
                  * 본 서비스는 AI 기반 참고 자료를 제공하며, 법률 자문을
                  대체하지 않습니다.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
