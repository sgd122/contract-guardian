import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const admin = createAdminClient();

    const { data: analysis, error } = await admin
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "완료된 분석 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Return analysis data as JSON for client-side PDF generation
    return NextResponse.json({
      analysis,
      clauses: analysis.clauses ?? [],
      improvements: analysis.improvements ?? [],
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
