import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisResult } from "@cg/shared";
import { generateReportPdf } from "@/lib/report/generate-pdf";

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

    // Use server client (RLS enforces user_id filter automatically)
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("status", "completed")
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "완료된 분석 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateReportPdf(analysis as AnalysisResult);
    const baseName = analysis.original_filename.replace(/\.[^.]+$/, '');
    const filename = encodeURIComponent(`분석리포트_${baseName}.pdf`);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
