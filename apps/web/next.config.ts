import type { NextConfig } from "next";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

// 모노레포 루트 env 파일 로드 (Next.js는 apps/web/.env만 자동 로드하므로)
// ENV_FILE 환경변수로 .env.prod 등 다른 파일 지정 가능
const envFile = process.env.ENV_FILE || ".env";
dotenvConfig({ path: resolve(__dirname, `../../${envFile}`) });

// dotenvConfig으로 로드된 NEXT_PUBLIC_* 변수를 클라이언트 번들에 자동 주입
const publicEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => key.startsWith("NEXT_PUBLIC_")),
);

const isDev = process.env.NODE_ENV !== "production";

// CSP connect-src: 개발 환경에서는 로컬 Supabase 허용, 프로덕션에서는 원격만
const connectSrc = [
  "'self'",
  "https://*.supabase.co",
  "wss://*.supabase.co",
  "https://*.tosspayments.com",
  ...(isDev ? ["http://localhost:54321", "ws://localhost:54321"] : []),
].join(" ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.tosspayments.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      `connect-src ${connectSrc}`,
      "font-src 'self' data:",
      "frame-src https://*.tosspayments.com https://js.tosspayments.com",
    ].join("; "),
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  env: publicEnv,
  transpilePackages: ["@cg/ui", "@cg/shared", "@cg/api"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "k.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  serverExternalPackages: ["@react-pdf/renderer", "pdfjs-dist", "pdf-to-img"],
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
