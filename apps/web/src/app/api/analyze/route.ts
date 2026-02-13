import { getAIProvider } from "@/lib/ai";
import { convertPdfToImages } from "@/lib/file-processing/pdf-to-images";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AIProvider } from "@cg/shared";
import { DEFAULT_AI_PROVIDER, aiProviderSchema, AI_PROVIDERS } from "@cg/shared";
import { NextRequest, NextResponse, after } from "next/server";
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
        { status: 401 },
      );
    }

    const body = await request.json();
    const { analysisId, provider: rawProvider } = body;

    // Validate provider with fallback to default
    const providerResult = aiProviderSchema.safeParse(rawProvider);
    const provider: AIProvider = providerResult.success
      ? providerResult.data
      : DEFAULT_AI_PROVIDER;

    if (!analysisId) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "분석 ID가 필요합니다." },
        { status: 400 },
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
        { status: 404 },
      );
    }

    // Check if already processing or completed
    if (analysis.status === "processing") {
      return NextResponse.json(
        { code: "ALREADY_PROCESSING", message: "이미 분석 중입니다." },
        { status: 409 },
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
          { status: 402 },
        );
      }
    }

    // Atomic status update with guard to prevent race conditions
    const allowedStatuses = isFreeAnalysis
      ? ["pending_payment", "paid"]
      : ["paid"];
    const { data: updated, error: processingError } = await admin
      .from("analyses")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
      .in("status", allowedStatuses)
      .select("id")
      .single();

    if (processingError || !updated) {
      console.error("Failed to update status to processing:", processingError);
      return NextResponse.json(
        {
          code: "CONFLICT",
          message: "분석을 시작할 수 없는 상태입니다. 이미 처리 중이거나 결제가 필요합니다.",
        },
        { status: 409 },
      );
    }

    // Run analysis in background after response is sent
    const userId = user.id;
    after(async () => {
      try {
        let analysisWithUsage;

        // Get the AI provider
        const aiProvider = await getAIProvider(provider);

        if (analysis.extracted_text && !isScannedDocument(analysis)) {
          // Text-based analysis
          analysisWithUsage = await aiProvider.analyzeText({
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
            const { images, totalPages, truncated } =
              await convertPdfToImages(buffer);
            if (truncated) {
              console.warn(
                `[Analyze] Analysis limited to first ${images.length} of ${totalPages} pages for analysis ${analysisId}`,
              );
            }
            analysisWithUsage = await aiProvider.analyzeImages({
              images: images.map((img) => ({
                data: img.data,
                mediaType: img.mediaType,
              })),
              contractType: analysis.contract_type ?? undefined,
            });
          } else {
            // Single image
            const base64 = buffer.toString("base64");
            analysisWithUsage = await aiProvider.analyzeImages({
              images: [{ data: base64, mediaType: "image/jpeg" }],
              contractType: analysis.contract_type ?? undefined,
            });
          }
        }

        const { result, usage } = analysisWithUsage;

        // Calculate cost from token usage
        const providerConfig = AI_PROVIDERS[provider];
        const apiCostUsd = usage
          ? usage.inputTokens * providerConfig.costPerInputToken +
            usage.outputTokens * providerConfig.costPerOutputToken
          : undefined;

        // Store results with error checking
        const { error: updateError } = await admin
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
            ai_provider: provider,
            input_tokens: usage?.inputTokens,
            output_tokens: usage?.outputTokens,
            api_cost_usd: apiCostUsd,
          })
          .eq("id", analysisId);

        if (updateError) {
          throw new Error(`DB update failed: ${updateError.message}`);
        }

        // Decrement free analyses if applicable
        if (isFreeAnalysis) {
          await admin.rpc("decrement_free_analyses", { uid: userId });
        }
      } catch (analysisError) {
        console.error("Background analysis failed:", analysisError);

        await admin
          .from("analyses")
          .update({ status: "failed" })
          .eq("id", analysisId);
      }
    });

    // Respond immediately
    return NextResponse.json({ analysisId, status: "processing" });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

function isScannedDocument(analysis: {
  extracted_text?: string | null;
}): boolean {
  return !analysis.extracted_text || analysis.extracted_text.length < 100;
}

async function checkFreeAnalysis(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<boolean> {
  const { data: profile } = await admin
    .from("profiles")
    .select("free_analyses_remaining")
    .eq("id", userId)
    .single();

  return (profile?.free_analyses_remaining ?? 0) > 0;
}
