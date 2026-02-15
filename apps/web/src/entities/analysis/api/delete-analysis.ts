import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { createAdminClient } from "@/shared/api/supabase/admin";
import { notFound, internalError, apiError } from "@/shared/lib/api-errors";

export async function handleDeleteAnalysis(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user, supabase } = auth;

    const { id } = await params;

    // Fetch analysis to get file_path and validate ownership
    const { data: analysis, error: fetchError } = await supabase
      .from("analyses")
      .select("status, file_path")
      .eq("id", id)
      .single();

    if (fetchError || !analysis) {
      return notFound();
    }

    // Prevent deletion during active processing
    if (analysis.status === "processing") {
      return apiError("INVALID_STATUS", "분석 진행 중에는 삭제할 수 없습니다.", 400);
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
      return apiError("DELETE_FAILED", "삭제에 실패했습니다.", 500);
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
    return internalError();
  }
}
