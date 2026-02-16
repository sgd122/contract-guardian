import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { rateLimited, notFound, apiError, internalError } from "@/shared/lib/api-errors";
import { createAdminClient } from "@/shared/api/supabase/admin";
import { cancelPayment } from "@/entities/payment/api";

export async function handleRefund(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { user } = auth;

  const { allowed } = checkRateLimit(`refund:${user.id}`, 3, 3600000);
  if (!allowed) return rateLimited();

  let body: { analysisId: string; reason: string };
  try {
    body = await req.json();
  } catch {
    return apiError("INVALID_INPUT", "Invalid JSON body", 400);
  }

  const { analysisId, reason } = body;
  if (!analysisId || !reason) {
    return apiError("INVALID_INPUT", "analysisId and reason are required", 400);
  }

  const adminClient = createAdminClient();

  // Get payment record by analysis_id
  const { data: payment, error: paymentError } = await adminClient
    .from("payments")
    .select("*")
    .eq("analysis_id", analysisId)
    .eq("user_id", user.id)
    .eq("status", "done")
    .single();

  if (paymentError || !payment) {
    return notFound("결제 기록을 찾을 수 없습니다.");
  }

  // Check if analysis has started
  const { data: analysis } = await adminClient
    .from("analyses")
    .select("status")
    .eq("id", analysisId)
    .single();

  if (analysis?.status === "processing" || analysis?.status === "completed") {
    return apiError(
      "INVALID_STATUS",
      "분석이 이미 시작되었거나 완료되어 환불할 수 없습니다.",
      400
    );
  }

  if (!payment.payment_key) {
    return apiError("NOT_READY", "Payment key not found", 400);
  }

  try {
    // Cancel payment via Toss API
    await cancelPayment(payment.payment_key, reason);

    // Update payment status to canceled
    const { error: updatePaymentError } = await adminClient
      .from("payments")
      .update({ status: "canceled" })
      .eq("id", payment.id);

    if (updatePaymentError) {
      throw updatePaymentError;
    }

    // Update analysis status to canceled
    const { error: updateAnalysisError } = await adminClient
      .from("analyses")
      .update({ status: "canceled" })
      .eq("id", analysisId);

    if (updateAnalysisError) {
      throw updateAnalysisError;
    }

    return NextResponse.json({
      success: true,
      message: "환불이 완료되었습니다.",
    });
  } catch (error) {
    console.error("Refund error:", error);
    return internalError(
      error instanceof Error ? error.message : "환불 처리 중 오류가 발생했습니다."
    );
  }
}
