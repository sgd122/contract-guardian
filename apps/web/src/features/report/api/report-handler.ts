import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { generateReportPdf } from "../lib/generate-pdf";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { notFound, rateLimited, internalError, apiError } from "@/shared/lib/api-errors";

export async function handleReportGeneration(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user, supabase } = auth;

    const { id } = await context.params;

    // Rate limit: 20 report downloads per hour per user
    const { allowed } = checkRateLimit(`report:${user.id}`, 20, 3600_000);
    if (!allowed) {
      return rateLimited();
    }

    // Fetch analysis with RLS (ensures user owns this analysis)
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !analysis) {
      return notFound("분석 기록을 찾을 수 없습니다.");
    }

    if (analysis.status !== "completed") {
      return apiError("NOT_READY", "분석이 완료되지 않았습니다.", 400);
    }

    // Generate PDF
    const pdfBuffer = await generateReportPdf(analysis);

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contract-analysis-${id}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return internalError("리포트 생성 중 오류가 발생했습니다.");
  }
}
