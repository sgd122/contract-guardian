import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/api/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { code: "INVALID_INPUT", message: "Authorization code is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.json(
      { code: "AUTH_FAILED", message: error.message },
      { status: 401 }
    );
  }

  // Redirect to mobile app with deep link
  const appScheme = "contractguardian";
  const redirectUrl = `${appScheme}://auth/callback?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;

  return NextResponse.redirect(redirectUrl);
}
