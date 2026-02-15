import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { createAdminClient } from "@/shared/api/supabase/admin";
import { randomUUID } from "crypto";
import { PRICE_STANDARD, PRICE_EXTENDED, PAGE_THRESHOLD_EXTENDED } from "@cg/shared";
import { notFound, dbError, internalError, apiError } from "@/shared/lib/api-errors";

export async function handleCreatePayment(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user, supabase } = auth;

    const body = await request.json();
    const { analysisId, amount } = body;

    if (!analysisId || !amount) {
      return apiError("INVALID_INPUT", "분석 ID와 금액이 필요합니다.", 400);
    }

    // Validate amount against expected pricing
    if (amount !== PRICE_STANDARD && amount !== PRICE_EXTENDED) {
      return apiError("INVALID_AMOUNT", "유효하지 않은 결제 금액입니다.", 400);
    }

    // Use server client with RLS for read operations
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("id, original_filename, page_count, status")
      .eq("id", analysisId)
      .single();

    if (analysisError || !analysis) {
      return notFound("분석 기록을 찾을 수 없습니다.");
    }

    // Validate amount matches page count
    const expectedAmount =
      (analysis.page_count ?? 1) > PAGE_THRESHOLD_EXTENDED
        ? PRICE_EXTENDED
        : PRICE_STANDARD;

    if (amount !== expectedAmount) {
      return apiError("AMOUNT_MISMATCH", "금액이 일치하지 않습니다.", 400);
    }

    // Check for existing active payment (idempotency)
    const admin = createAdminClient();
    const { data: existingPayment } = await admin
      .from("payments")
      .select("order_id, amount, status")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .in("status", ["ready", "in_progress"])
      .single();

    if (existingPayment) {
      return NextResponse.json({
        orderId: existingPayment.order_id,
        amount: existingPayment.amount,
        orderName: `계약서 분석 - ${analysis.original_filename}`,
      });
    }

    const orderId = randomUUID();
    const orderName = `계약서 분석 - ${analysis.original_filename}`;

    // Create payment record (admin needed for INSERT without user_id RLS issues)
    const { error: dbInsertError } = await admin.from("payments").insert({
      id: randomUUID(),
      user_id: user.id,
      analysis_id: analysisId,
      order_id: orderId,
      amount,
      status: "ready",
    });

    if (dbInsertError) {
      return dbError("결제 기록 생성에 실패했습니다.");
    }

    return NextResponse.json({ orderId, amount, orderName });
  } catch (error) {
    console.error("Payment create error:", error);
    return internalError();
  }
}
