import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Validate redirect path to prevent open redirect attacks
  const isValidRedirect =
    next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
  const safePath = isValidRedirect ? next : "/dashboard";

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create redirect response first so cookies can be set on it
    const redirectUrl = new URL(safePath, origin);
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Ensure cookies are readable by browser JavaScript (not httpOnly)
            response.cookies.set(name, value, {
              ...options,
              httpOnly: false,
            });
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth Callback] exchangeCodeForSession failed:", error.message);
    } else {
      console.log("[Auth Callback] Session created for:", data.session?.user?.email);
      return response;
    }
  }

  // Auth error - redirect to login with error
  console.error("[Auth Callback] No code or exchange failed, redirecting to login");
  return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
}
