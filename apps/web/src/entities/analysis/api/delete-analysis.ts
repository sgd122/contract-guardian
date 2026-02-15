import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/api/supabase/server";
import { createAdminClient } from "@/shared/api/supabase/admin";

export async function handleDeleteAnalysis(
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

    // Fetch analysis to get file_path and validate ownership
    const { data: analysis, error: fetchError } = await supabase
      .from("analyses")
      .select("status, file_path")
      .eq("id", id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "분석 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Prevent deletion during active processing
    if (analysis.status === "processing") {
      return NextResponse.json(
        {
          code: "INVALID_STATUS",
          message: "분석 진행 중에는 삭제할 수 없습니다.",
        },
        { status: 400 }
      );
    }

    // Delete related payments first (FK constraint)
    const adminClient = createAdminClient();
    await adminClient
      .from("payments")
      .delete()
      .eq("analysis_id", id);

    // Delete analysis record (DB is source of truth)
    const { error: deleteError } = await supabase
      .from("analyses")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Analysis deletion error:", deleteError);
      return NextResponse.json(
        { code: "DELETE_FAILED", message: "삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    // Then clean up storage file (best effort)
    if (analysis.file_path) {
      await adminClient.storage
        .from("contracts")
        .remove([analysis.file_path])
        .catch((err: unknown) => console.error("Storage cleanup error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete analysis error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
