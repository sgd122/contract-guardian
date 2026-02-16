import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "https://contract-guardian.kr",
  "https://www.contract-guardian.kr",
].filter(Boolean);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // same-origin requests have no Origin header
  return ALLOWED_ORIGINS.includes(origin);
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || ALLOWED_ORIGINS[0],
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = NextResponse.next();

  // Set CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    if (origin && !isAllowedOrigin(origin)) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "Origin not allowed" },
        { status: 403 }
      );
    }
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
