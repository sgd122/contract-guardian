import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { dbError, internalError } from "@/shared/lib/api-errors";

export async function handleListAnalyses(_request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user, supabase } = auth;

    // RLS enforces user_id filter
    const { data: analyses, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("List analyses error:", error);
      return dbError("분석 목록을 불러올 수 없습니다.");
    }

    return NextResponse.json(analyses ?? []);
  } catch (error) {
    console.error("List analyses error:", error);
    return internalError();
  }
}
