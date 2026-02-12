"use client";

import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { Button, FadeIn, CountUp } from "@cg/ui";

const STATS = [
  { value: 3900, suffix: "원/건", label: "분석 비용" },
  { value: 3, suffix: "분 이내", label: "분석 시간" },
  { value: 24, suffix: "시간", label: "이용 가능" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.1),rgba(255,255,255,0))]" />

      <div className="container flex flex-col items-center text-center">
        <FadeIn>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
            <Shield className="h-4 w-4 text-primary" />
            AI 계약서 검토 서비스
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            AI가 계약서의{" "}
            <span className="text-primary">위험을 찾아드립니다</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            프리랜서와 1인 사업자를 위한 AI 계약서 분석 서비스.
            <br />
            독소 조항, 불리한 조건을 자동으로 찾아 수정 방향을 제안합니다.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#pricing">가격 보기</a>
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground md:text-3xl">
                  <CountUp end={stat.value} />
                  <span>{stat.suffix}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
