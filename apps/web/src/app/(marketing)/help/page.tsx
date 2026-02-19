import type { Metadata } from "next";
import { HelpPage } from "@/_pages/help";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://contract-guardian.kr";

export const metadata: Metadata = {
  title: "도움말",
  description:
    "계약서 지킴이 사용 방법, 지원 형식, 분석 과정 등 자주 묻는 질문과 가이드를 확인하세요.",
  alternates: {
    canonical: `${SITE_URL}/help`,
  },
};

export default function Page() {
  return <HelpPage />;
}
