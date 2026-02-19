import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { GoogleAnalytics } from "@/shared/ui/google-analytics";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://contract-guardian.kr";
const SITE_NAME = "계약서 지킴이";
const SITE_DESCRIPTION =
  "프리랜서·1인 사업자를 위한 AI 계약서 분석 서비스. 8대 위험 카테고리 자동 검토, 독소 조항 식별, 수정 제안, PDF 리포트까지. 3,900원부터.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - AI 계약서 검토 서비스`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "계약서 검토",
    "AI 계약서 분석",
    "프리랜서 계약서",
    "용역 계약서 검토",
    "외주 계약서 위험",
    "독소 조항",
    "계약서 위험 분석",
    "1인 사업자 계약서",
    "NDA 검토",
    "계약서 리스크",
  ],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - AI가 계약서의 위험을 찾아드립니다`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "계약서 지킴이 - AI 계약서 검토 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - AI 계약서 검토 서비스`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen font-sans antialiased`}
      >
        <GoogleAnalytics />
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
