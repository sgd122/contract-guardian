import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { createAdminClient } from "@/shared/api/supabase/admin";
import { parsePdf } from "../lib/pdf-parser";
import { cleanExtractedText } from "../lib/text-cleaner";
import { validateMagicBytes } from "../lib/validate-magic-bytes";
import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from "@cg/shared";
import { randomUUID } from "crypto";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { rateLimited, internalError, dbError, apiError } from "@/shared/lib/api-errors";

export async function handleUpload(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user, supabase } = auth;

    // Rate limit: 10 uploads per 10 minutes per user
    const { allowed } = checkRateLimit(`upload:${user.id}`, 10, 600_000);
    if (!allowed) {
      return rateLimited();
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("INVALID_INPUT", "파일이 필요합니다.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("FILE_TOO_LARGE", `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다.`, 400);
    }

    if (!(SUPPORTED_FORMATS as readonly string[]).includes(file.type)) {
      return apiError("UNSUPPORTED_FORMAT", "PDF, JPEG, PNG 파일만 지원합니다.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file content matches claimed type (magic bytes)
    if (!validateMagicBytes(buffer, file.type)) {
      return apiError("INVALID_FILE", "파일 형식이 올바르지 않습니다.", 400);
    }

    let extractedText = "";
    let isScanned = false;
    let pageCount = 1;

    if (file.type === "application/pdf") {
      const result = await parsePdf(buffer);
      extractedText = cleanExtractedText(result.text);
      isScanned = result.isScanned;
      pageCount = result.pageCount;
    } else {
      // Image file - treat as scanned
      isScanned = true;
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop() || "pdf";
    const filePath = `${user.id}/${randomUUID()}.${fileExt}`;
    const admin = createAdminClient();

    const { error: uploadError } = await admin.storage
      .from("contracts")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return apiError("UPLOAD_FAILED", "파일 업로드에 실패했습니다.", 500);
    }

    // Create analysis record
    const analysisId = randomUUID();
    const { error: dbInsertError } = await supabase.from("analyses").insert({
      id: analysisId,
      user_id: user.id,
      original_filename: file.name.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 255),
      file_path: filePath,
      file_type: file.type === "application/pdf" ? "pdf" : "image",
      file_size_bytes: file.size,
      extracted_text: isScanned ? null : extractedText,
      page_count: pageCount,
      status: "pending_payment",
    });

    if (dbInsertError) {
      // Rollback: delete the uploaded file from storage
      await admin.storage.from("contracts").remove([filePath]).catch(() => {});
      return dbError("분석 기록 생성에 실패했습니다.");
    }

    return NextResponse.json({
      analysisId,
      filename: file.name,
      pageCount,
      isScanned,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return internalError();
  }
}
