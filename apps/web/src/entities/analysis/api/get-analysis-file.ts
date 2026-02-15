import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/api/supabase/server";
import { createAdminClient } from "@/shared/api/supabase/admin";
import { checkRateLimit } from "@/shared/lib/rate-limit";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  image: "image/jpeg",
};

export async function handleGetAnalysisFile(
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

    // Rate limit: 30 file requests per 5 minutes per user
    const { allowed } = checkRateLimit(`file:${user.id}`, 30, 300_000);
    if (!allowed) {
      return NextResponse.json(
        { code: "RATE_LIMITED", message: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const { id } = await params;

    // RLS enforces user_id filter
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("file_path, file_type")
      .eq("id", id)
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "분석 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Download file from storage and stream to client
    const admin = createAdminClient();
    const { data: fileData, error: downloadError } = await admin.storage
      .from("contracts")
      .download(analysis.file_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { code: "FILE_ERROR", message: "파일을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    const contentType = CONTENT_TYPES[analysis.file_type] || "application/octet-stream";

    return new NextResponse(fileData, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileData.size),
        "Cache-Control": "private, max-age=600",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    console.error("File download error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
