import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "https://contract-guardian.kr",
  "https://www.contract-guardian.kr",
].filter(Boolean);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // same-origin requests have no Origin header
  return ALLOWED_ORIGINS.includes(origin);
}

/** Auth routes that logged-in users should not access */
const AUTH_ROUTES = ["/login"];

/** Protected routes that require authentication */
const PROTECTED_ROUTES = ["/dashboard", "/analyze", "/settings", "/payment-history"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Set CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    if (origin && !isAllowedOrigin(origin)) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "Origin not allowed" },
        { status: 403 }
      );
    }
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    return response;
  }

  // Auth guard: check session for auth/protected routes
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r);
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  if (isAuthRoute || isProtectedRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response = NextResponse.next({
                request: { headers: request.headers },
              });
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Logged-in user trying to access /login → redirect to dashboard
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Not logged-in user trying to access protected route → redirect to login
    if (isProtectedRoute && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/login",
    "/dashboard/:path*",
    "/analyze/:path*",
    "/settings/:path*",
    "/payment-history/:path*",
  ],
};
