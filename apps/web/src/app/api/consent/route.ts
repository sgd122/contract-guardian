import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { z } from "zod";

const ConsentSchema = z.object({
  analysisId: z.string().uuid("유효하지 않은 분석 ID입니다."),
  consentType: z.enum(["ai_disclaimer", "privacy_policy"], {
    errorMap: () => ({ message: "유효하지 않은 동의 유형입니다." }),
  }),
  consentVersion: z
    .string()
    .regex(/^v\d+\.\d+$/, "유효하지 않은 버전 형식입니다."),
});

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
    const validation = ConsentSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json(
        { code: "INVALID_INPUT", message: errors },
        { status: 400 }
      );
    }

    const { analysisId, consentType, consentVersion } = validation.data;

    // Use server client (RLS enforces user_id via INSERT policy)
    const { error } = await supabase.from("consent_logs").insert({
      id: randomUUID(),
      user_id: user.id,
      analysis_id: analysisId,
      consent_type: consentType,
      consent_version: consentVersion,
    });

    if (error) {
      return NextResponse.json(
        { code: "DB_ERROR", message: "동의 기록 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Consent error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
