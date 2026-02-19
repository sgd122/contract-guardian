import { AboutPage } from "@/_pages/about";

import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://contract-guardian.kr";

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "계약서 지킴이는 AI로 계약서의 8대 위험 카테고리를 자동 분석합니다. 프리랜서·1인 사업자의 계약 리스크를 빠르게 파악하세요.",
  openGraph: {
    title: "서비스 소개 | 계약서 지킴이",
    description:
      "AI가 계약서의 독소 조항을 찾아 수정 방향을 제안합니다. 프리랜서·1인 사업자를 위한 계약서 검토 서비스.",
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function Page() {
  return <AboutPage />;
}
