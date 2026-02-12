"use client";

import { Upload, Brain, FileText } from "lucide-react";
import { FadeIn, StaggerList, AnimatedCard } from "@cg/ui";

const STEPS = [
  {
    icon: Upload,
    title: "계약서 업로드",
    description: "PDF 파일을 드래그하거나 카메라로 촬영하세요",
    step: "01",
  },
  {
    icon: Brain,
    title: "AI 분석",
    description: "8대 체크 항목 기준으로 2~3분 내 분석 완료",
    step: "02",
  },
  {
    icon: FileText,
    title: "결과 확인",
    description: "위험 조항, 수정 제안, PDF 리포트 다운로드",
    step: "03",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 scroll-mt-16">
      <div className="container">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold">이용 방법</h2>
            <p className="mt-3 text-muted-foreground">
              간단한 3단계로 계약서를 분석하세요
            </p>
          </div>
        </FadeIn>

        <StaggerList className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <AnimatedCard key={step.step} className="relative p-8">
              <span className="absolute right-4 top-4 text-4xl font-bold text-muted/50">
                {step.step}
              </span>
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </AnimatedCard>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
