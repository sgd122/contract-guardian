import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  analyzeContractText,
  analyzeContractImages,
} from "@/lib/claude/analyze-contract";
import { convertPdfToImages } from "@/lib/file-processing/pdf-to-images";
import { cleanExtractedText } from "@/lib/file-processing/text-cleaner";
// FREE_ANALYSES_COUNT used for initial profile setup; here we just check remaining > 0

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

    const body = await request.json();
    const { analysisId } = body;

    if (!analysisId) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "분석 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Fetch analysis record
    const { data: analysis, error: fetchError } = await admin
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "분석 기록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Check if already processing or completed
    if (analysis.status === "processing") {
      return NextResponse.json(
        { code: "ALREADY_PROCESSING", message: "이미 분석 중입니다." },
        { status: 409 }
      );
    }

    if (analysis.status === "completed") {
      return NextResponse.json({ analysisId, status: "completed" });
    }

    // Check payment or free analyses
    const isFreeAnalysis = await checkFreeAnalysis(admin, user.id);
    if (analysis.status === "pending_payment" && !isFreeAnalysis) {
      // Check payment exists
      const { data: payment } = await admin
        .from("payments")
        .select("status")
        .eq("analysis_id", analysisId)
        .eq("status", "done")
        .single();

      if (!payment) {
        return NextResponse.json(
          { code: "PAYMENT_REQUIRED", message: "결제가 필요합니다." },
          { status: 402 }
        );
      }
    }

    // Update status to processing
    await admin
      .from("analyses")
      .update({ status: "processing" })
      .eq("id", analysisId);

    try {
      let result;

      if (analysis.extracted_text && !isScannedDocument(analysis)) {
        // Text-based analysis
        result = await analyzeContractText({
          text: analysis.extracted_text,
          contractType: analysis.contract_type ?? undefined,
        });
      } else {
        // Vision-based analysis (scanned PDF or image)
        const { data: fileData, error: downloadError } = await admin.storage
          .from("contracts")
          .download(analysis.file_path);

        if (downloadError || !fileData) {
          throw new Error("Failed to download file for analysis");
        }

        const buffer = Buffer.from(await fileData.arrayBuffer());

        if (analysis.file_type === "pdf") {
          const { images, totalPages, truncated } = await convertPdfToImages(buffer);
          if (truncated) {
            console.warn(
              `[Analyze] Analysis limited to first ${images.length} of ${totalPages} pages for analysis ${analysisId}`
            );
          }
          result = await analyzeContractImages({
            images: images.map((img) => ({
              data: img.data,
              mediaType: img.mediaType,
            })),
            contractType: analysis.contract_type ?? undefined,
          });
        } else {
          // Single image
          const base64 = buffer.toString("base64");
          result = await analyzeContractImages({
            images: [{ data: base64, mediaType: "image/jpeg" }],
            contractType: analysis.contract_type ?? undefined,
          });
        }
      }

      // Store results
      await admin
        .from("analyses")
        .update({
          status: "completed",
          overall_risk_level: result.overall_risk_level,
          overall_risk_score: result.overall_risk_score,
          summary: result.summary,
          clauses: result.clauses,
          improvements: result.improvements,
          contract_type: result.contract_type,
          contract_parties: result.contract_parties,
          missing_clauses: result.missing_clauses,
        })
        .eq("id", analysisId);

      // Decrement free analyses if applicable
      if (isFreeAnalysis) {
        await admin.rpc("decrement_free_analyses", { uid: user.id });
      }

      return NextResponse.json({ analysisId, status: "completed" });
    } catch (analysisError) {
      console.error("Analysis failed:", analysisError);

      await admin
        .from("analyses")
        .update({ status: "failed" })
        .eq("id", analysisId);

      return NextResponse.json(
        { code: "ANALYSIS_FAILED", message: "계약서 분석에 실패했습니다." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

function isScannedDocument(analysis: { extracted_text?: string | null }): boolean {
  return !analysis.extracted_text || analysis.extracted_text.length < 100;
}

async function checkFreeAnalysis(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<boolean> {
  const { data: profile } = await admin
    .from("profiles")
    .select("free_analyses_remaining")
    .eq("id", userId)
    .single();

  return (profile?.free_analyses_remaining ?? 0) > 0;
}
