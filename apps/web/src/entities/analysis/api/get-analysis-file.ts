import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { createAdminClient } from "@/shared/api/supabase/admin";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { notFound, rateLimited, internalError, apiError } from "@/shared/lib/api-errors";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  image: "image/jpeg",
};

export async function handleGetAnalysisFile(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user, supabase } = auth;

    // Rate limit: 30 file requests per 5 minutes per user
    const { allowed } = checkRateLimit(`file:${user.id}`, 30, 300_000);
    if (!allowed) {
      return rateLimited();
    }

    const { id } = await params;

    // RLS enforces user_id filter
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("file_path, file_type")
      .eq("id", id)
      .single();

    if (error || !analysis) {
      return notFound();
    }

    // Download file from storage and stream to client
    const admin = createAdminClient();
    const { data: fileData, error: downloadError } = await admin.storage
      .from("contracts")
      .download(analysis.file_path);

    if (downloadError || !fileData) {
      return apiError("FILE_ERROR", "파일을 불러올 수 없습니다.", 500);
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
    return internalError();
  }
}
