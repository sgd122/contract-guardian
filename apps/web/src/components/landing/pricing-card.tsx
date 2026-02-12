"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button, Badge, FadeIn, StaggerList, AnimatedCard } from "@cg/ui";
import { formatCurrency, PRICE_STANDARD, PRICE_EXTENDED } from "@cg/shared";

const PLANS = [
  {
    name: "무료 체험",
    price: 0,
    description: "첫 1건 무료 분석",
    badge: "추천",
    features: [
      "PDF 계약서 분석",
      "8대 체크 항목 검토",
      "위험 조항 식별",
      "수정 제안 제공",
    ],
    cta: "무료로 시작하기",
    href: "/login",
    highlight: true,
  },
  {
    name: "일반 분석",
    price: PRICE_STANDARD,
    description: "1~5페이지 계약서",
    features: [
      "PDF 계약서 분석",
      "8대 체크 항목 검토",
      "위험 조항 식별",
      "수정 제안 제공",
      "PDF 리포트 다운로드",
    ],
    cta: "분석하기",
    href: "/analyze",
    highlight: false,
  },
  {
    name: "확장 분석",
    price: PRICE_EXTENDED,
    description: "6~20페이지 계약서",
    features: [
      "PDF 계약서 분석",
      "8대 체크 항목 검토",
      "위험 조항 식별",
      "수정 제안 제공",
      "PDF 리포트 다운로드",
      "관련 법령 참조",
    ],
    cta: "분석하기",
    href: "/analyze",
    highlight: false,
  },
];

export function PricingCard() {
  return (
    <section id="pricing" className="bg-muted/30 py-20 scroll-mt-16">
      <div className="container">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold">투명한 가격</h2>
            <p className="mt-3 text-muted-foreground">
              건당 결제, 숨겨진 비용 없이 합리적인 가격
            </p>
          </div>
        </FadeIn>

        <StaggerList className="mt-12 grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <AnimatedCard
              key={plan.name}
              className={`flex flex-col p-8 ${
                plan.highlight ? "border-primary shadow-md" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                {plan.badge && (
                  <Badge variant="default">{plan.badge}</Badge>
                )}
              </div>

              <div className="mt-6">
                <span className="text-3xl font-bold">
                  {plan.price === 0 ? "무료" : formatCurrency(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-muted-foreground"> /건</span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="mt-8 w-full"
                variant={plan.highlight ? "default" : "outline"}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </AnimatedCard>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
