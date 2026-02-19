const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://contract-guardian.kr";

/** Organization JSON-LD */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "계약서 지킴이",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description:
      "프리랜서·1인 사업자를 위한 AI 계약서 분석 서비스",
    sameAs: [],
  };
}

/** SoftwareApplication JSON-LD */
export function productJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "계약서 지킴이",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "AI가 계약서의 8대 위험 카테고리를 자동 분석하고, 독소 조항을 식별하여 수정 방향을 제안합니다.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "KRW",
      lowPrice: "0",
      highPrice: "5900",
      offerCount: "3",
      offers: [
        {
          "@type": "Offer",
          name: "무료 체험",
          price: "0",
          priceCurrency: "KRW",
          description: "첫 1건 무료 분석",
        },
        {
          "@type": "Offer",
          name: "일반 분석",
          price: "3900",
          priceCurrency: "KRW",
          description: "1~5페이지 계약서 분석",
        },
        {
          "@type": "Offer",
          name: "확장 분석",
          price: "5900",
          priceCurrency: "KRW",
          description: "6페이지 이상 계약서 분석",
        },
      ],
    },
    aggregateRating: undefined,
  };
}

/** BreadcrumbList JSON-LD */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** FAQ JSON-LD */
export function faqJsonLd(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
