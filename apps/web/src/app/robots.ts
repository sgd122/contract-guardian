import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://contract-guardian.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/analyze/", "/settings/", "/payment/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
