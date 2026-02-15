import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/api/supabase/server";

export async function handleListAnalyses(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // RLS enforces user_id filter
    const { data: analyses, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("List analyses error:", error);
      return NextResponse.json(
        { code: "DATABASE_ERROR", message: "분석 목록을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(analyses ?? []);
  } catch (error) {
    console.error("List analyses error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
