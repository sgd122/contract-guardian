import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";
import { dbError, internalError, apiError } from "@/shared/lib/api-errors";

const ConsentSchema = z.object({
  analysisId: z.string().uuid("유효하지 않은 분석 ID입니다."),
  consentType: z.enum(["ai_disclaimer", "privacy_policy"], {
    errorMap: () => ({ message: "유효하지 않은 동의 유형입니다." }),
  }),
  consentVersion: z
    .string()
    .regex(/^v\d+\.\d+$/, "유효하지 않은 버전 형식입니다."),
});

export async function handleConsent(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user, supabase } = auth;

    const body = await request.json();
    const validation = ConsentSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return apiError("INVALID_INPUT", errors, 400);
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
      return dbError("동의 기록 저장에 실패했습니다.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Consent error:", error);
    return internalError();
  }
}
