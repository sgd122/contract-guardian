"use client";

import { FadeIn, StaggerList, CountUp } from "@cg/ui";

const SIGNALS = [
  {
    value: 1000,
    prefix: "",
    suffix: "+",
    label: "분석 완료",
  },
  {
    value: 4.2,
    prefix: "평균 ",
    suffix: "개",
    label: "위험 조항 발견",
    decimals: 1,
  },
  {
    value: 98,
    prefix: "",
    suffix: "%",
    label: "사용자 만족도",
  },
];

export function TrustSignals() {
  return (
    <section className="py-20">
      <div className="container">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold">
            신뢰할 수 있는 서비스
          </h2>
        </FadeIn>

        <StaggerList className="mt-12 grid gap-8 md:grid-cols-3">
          {SIGNALS.map((signal) => (
            <div key={signal.label} className="text-center">
              <div className="text-4xl font-bold text-primary md:text-5xl">
                {signal.prefix}
                <CountUp
                  end={signal.value}
                  format={(v) =>
                    signal.decimals
                      ? v.toFixed(signal.decimals)
                      : String(v)
                  }
                />
                {signal.suffix}
              </div>
              <p className="mt-2 text-muted-foreground">{signal.label}</p>
            </div>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
