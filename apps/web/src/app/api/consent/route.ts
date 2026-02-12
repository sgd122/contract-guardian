import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const body = await request.json();
    const { analysisId, consentType, consentVersion } = body;

    if (!analysisId || !consentType || !consentVersion) {
      return NextResponse.json(
        { code: "INVALID_INPUT", message: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { error } = await admin.from("consent_logs").insert({
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
