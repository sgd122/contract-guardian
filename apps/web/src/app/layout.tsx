import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "계약서 지킴이 - AI 계약서 검토 서비스",
  description:
    "프리랜서와 1인 사업자를 위한 AI 계약서 분석 서비스. 계약서의 위험 조항을 자동으로 찾아드립니다.",
  keywords: ["계약서", "AI", "프리랜서", "계약서 검토", "위험 조항"],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen font-sans antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
