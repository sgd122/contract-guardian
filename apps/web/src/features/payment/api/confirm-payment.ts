import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { createAdminClient } from "@/shared/api/supabase/admin";
import { confirmPayment } from "@/entities/payment";
import { PaymentConfirmSchema } from "@cg/shared";
import { notFound, dbError, apiError } from "@/shared/lib/api-errors";

export async function handleConfirmPayment(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user } = auth;

    const body = await request.json();
    const validation = PaymentConfirmSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json(
        { code: "INVALID_INPUT", message: errors },
        { status: 400 }
      );
    }

    const { orderId, paymentKey, amount } = validation.data;
    const admin = createAdminClient();

    // Find payment record
    const { data: payment, error: findError } = await admin
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .single();

    if (findError || !payment) {
      return notFound("결제 기록을 찾을 수 없습니다.");
    }

    if (payment.amount !== amount) {
      return apiError("AMOUNT_MISMATCH", "결제 금액이 일치하지 않습니다.", 400);
    }

    // Idempotency guard: reject if already confirmed
    if (payment.status !== "ready") {
      return apiError("ALREADY_PROCESSED", "이미 처리된 결제입니다.", 409);
    }

    // Confirm with Toss
    const tossResult = await confirmPayment(paymentKey, orderId, amount);

    // Update payment record with error check
    const { error: paymentUpdateError } = await admin
      .from("payments")
      .update({
        payment_key: paymentKey,
        status: "done",
        method: tossResult.method,
        toss_response: tossResult,
        approved_at: tossResult.approvedAt,
      })
      .eq("id", payment.id)
      .eq("status", "ready");

    if (paymentUpdateError) {
      console.error("Payment DB update failed:", paymentUpdateError);
      return dbError("결제 기록 업데이트에 실패했습니다.");
    }

    // Update analysis status to paid with error check
    const { error: analysisUpdateError } = await admin
      .from("analyses")
      .update({ status: "paid" })
      .eq("id", payment.analysis_id)
      .eq("status", "pending_payment");

    if (analysisUpdateError) {
      console.error("Analysis status update failed:", analysisUpdateError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: "done",
    });
  } catch (error) {
    console.error("Payment confirm error:", error);
    return apiError("PAYMENT_FAILED", "결제 확인에 실패했습니다.", 500);
  }
}
