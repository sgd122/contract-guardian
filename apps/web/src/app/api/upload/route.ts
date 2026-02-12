import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsePdf } from "@/lib/file-processing/pdf-parser";
import { cleanExtractedText } from "@/lib/file-processing/text-cleaner";
import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from "@cg/shared";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "파일이 필요합니다." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          code: "FILE_TOO_LARGE",
          message: `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다.`,
        },
        { status: 400 }
      );
    }

    if (!(SUPPORTED_FORMATS as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        {
          code: "UNSUPPORTED_FORMAT",
          message: "PDF, JPEG, PNG 파일만 지원합니다.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
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
      return NextResponse.json(
        { code: "UPLOAD_FAILED", message: "파일 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    // Create analysis record
    const analysisId = randomUUID();
    const { error: dbError } = await admin.from("analyses").insert({
      id: analysisId,
      user_id: user.id,
      original_filename: file.name,
      file_path: filePath,
      file_type: file.type === "application/pdf" ? "pdf" : "image",
      file_size_bytes: file.size,
      extracted_text: isScanned ? null : extractedText,
      page_count: pageCount,
      status: "pending_payment",
    });

    if (dbError) {
      return NextResponse.json(
        { code: "DB_ERROR", message: "분석 기록 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analysisId,
      filename: file.name,
      pageCount,
      isScanned,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
