import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";
import { PRICE_STANDARD, PRICE_EXTENDED, PAGE_THRESHOLD_EXTENDED } from "@cg/shared";

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
    const { analysisId, amount } = body;

    if (!analysisId || !amount) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "분석 ID와 금액이 필요합니다." },
        { status: 400 }
      );
    }

    // Validate amount against expected pricing
    if (amount !== PRICE_STANDARD && amount !== PRICE_EXTENDED) {
      return NextResponse.json(
        { code: "INVALID_AMOUNT", message: "유효하지 않은 결제 금액입니다." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Verify analysis exists and belongs to user
    const { data: analysis, error: analysisError } = await admin
      .from("analyses")
      .select("id, original_filename, page_count, status")
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "분석 기록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Validate amount matches page count
    const expectedAmount =
      (analysis.page_count ?? 1) > PAGE_THRESHOLD_EXTENDED
        ? PRICE_EXTENDED
        : PRICE_STANDARD;

    if (amount !== expectedAmount) {
      return NextResponse.json(
        { code: "AMOUNT_MISMATCH", message: "금액이 일치하지 않습니다." },
        { status: 400 }
      );
    }

    const orderId = randomUUID();
    const orderName = `계약서 분석 - ${analysis.original_filename}`;

    // Create payment record
    const { error: dbError } = await admin.from("payments").insert({
      id: randomUUID(),
      user_id: user.id,
      analysis_id: analysisId,
      order_id: orderId,
      amount,
      status: "ready",
    });

    if (dbError) {
      return NextResponse.json(
        { code: "DB_ERROR", message: "결제 기록 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ orderId, amount, orderName });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
