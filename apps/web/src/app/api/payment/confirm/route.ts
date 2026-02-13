import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmPayment } from "@/lib/payment/toss-client";
import { PaymentConfirmSchema } from "@cg/shared";

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
      return NextResponse.json(
        { code: "NOT_FOUND", message: "결제 기록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (payment.amount !== amount) {
      return NextResponse.json(
        { code: "AMOUNT_MISMATCH", message: "결제 금액이 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // Idempotency guard: reject if already confirmed
    if (payment.status !== "ready") {
      return NextResponse.json(
        { code: "ALREADY_PROCESSED", message: "이미 처리된 결제입니다." },
        { status: 409 }
      );
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
      return NextResponse.json(
        { code: "DB_ERROR", message: "결제 기록 업데이트에 실패했습니다." },
        { status: 500 }
      );
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
    return NextResponse.json(
      {
        code: "PAYMENT_FAILED",
        message: "결제 확인에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
