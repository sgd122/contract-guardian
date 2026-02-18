import { PricingPage } from "@/_pages/pricing";

import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://contract-guardian.kr";

export const metadata: Metadata = {
  title: "가격 정책",
  description:
    "계약서 지킴이 가격 안내. 첫 1건 무료 체험, 일반 분석 3,900원, 확장 분석 5,900원. 건당 결제, 숨은 비용 없음.",
  openGraph: {
    title: "가격 정책 | 계약서 지킴이",
    description: "첫 1건 무료, 3,900원부터. 투명한 건당 결제 AI 계약서 분석.",
  },
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
};

export default function Page() {
  return <PricingPage />;
}
