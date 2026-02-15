"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, FadeIn } from "@cg/ui";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-background" />
      <div className="container text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold">
            지금 바로 계약서를 분석해보세요
          </h2>
          <p className="mt-4 text-muted-foreground">
            첫 1건은 무료입니다. 가입하고 바로 시작하세요.
          </p>
          <Button asChild size="lg" className="mt-8 gap-2">
            <Link href="/login">
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
