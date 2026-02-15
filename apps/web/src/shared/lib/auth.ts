import { NextResponse } from "next/server";
import { createClient } from "@/shared/api/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

interface AuthResult {
  user: User;
  supabase: SupabaseClient;
}

type AuthError = NextResponse;

export async function requireAuth(): Promise<AuthResult | AuthError> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  return { user, supabase };
}

export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return result instanceof NextResponse;
}
