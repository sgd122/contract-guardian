import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Validate redirect path to prevent open redirect attacks
  const isValidRedirect =
    next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
  const safePath = isValidRedirect ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(safePath, origin));
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
}
