import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

    // Use server client (RLS enforces user_id filter automatically)
    const { data: analyses, error } = await supabase
      .from("analyses")
      .select(
        "id, original_filename, file_type, file_size_bytes, page_count, status, overall_risk_level, overall_risk_score, summary, contract_type, ai_provider, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("List analyses error:", error);
      return NextResponse.json(
        { code: "DB_ERROR", message: "분석 목록을 불러올 수 없습니다." },
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
