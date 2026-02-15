import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/api/supabase/server";
import { generateReportPdf } from "../lib/generate-pdf";
import { checkRateLimit } from "@/shared/lib/rate-limit";

export async function handleReportGeneration(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const { id } = await context.params;

    // Rate limit: 20 report downloads per hour per user
    const { allowed } = checkRateLimit(`report:${user.id}`, 20, 3600_000);
    if (!allowed) {
      return NextResponse.json(
        { code: "RATE_LIMITED", message: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    // Fetch analysis with RLS (ensures user owns this analysis)
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "분석 기록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (analysis.status !== "completed") {
      return NextResponse.json(
        { code: "NOT_READY", message: "분석이 완료되지 않았습니다." },
        { status: 400 }
      );
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
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "리포트 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
