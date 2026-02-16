import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { rateLimited, internalError, apiError } from "@/shared/lib/api-errors";
import { createAdminClient } from "@/shared/api/supabase/admin";

export async function handleDeleteAccount() {
  // Auth check
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { user } = auth;

  // Rate limit: 1 request per hour per user
  const rateLimit = checkRateLimit(`delete-account:${user.id}`, 1, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimited();
  }

  try {
    const admin = createAdminClient();

    // Delete in order: storage files, payments, analyses, profile, auth user

    // 1. Delete storage files
    const { data: analyses } = await admin
      .from("analyses")
      .select("file_path")
      .eq("user_id", user.id);

    if (analyses && analyses.length > 0) {
      const filePaths = analyses
        .map((a) => a.file_path)
        .filter((path): path is string => !!path);

      if (filePaths.length > 0) {
        await admin.storage.from("contracts").remove(filePaths);
      }
    }

    // 2. Delete payments
    const { error: paymentsError } = await admin
      .from("payments")
      .delete()
      .eq("user_id", user.id);

    if (paymentsError) {
      console.error("Failed to delete payments:", paymentsError);
      return apiError("DELETE_FAILED", "결제 기록 삭제에 실패했습니다.", 500);
    }

    // 3. Delete analyses
    const { error: analysesError } = await admin
      .from("analyses")
      .delete()
      .eq("user_id", user.id);

    if (analysesError) {
      console.error("Failed to delete analyses:", analysesError);
      return apiError("DELETE_FAILED", "분석 기록 삭제에 실패했습니다.", 500);
    }

    // 4. Delete profile
    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) {
      console.error("Failed to delete profile:", profileError);
      return apiError("DELETE_FAILED", "프로필 삭제에 실패했습니다.", 500);
    }

    // 5. Delete auth user
    const { error: authError } = await admin.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error("Failed to delete auth user:", authError);
      return apiError("DELETE_FAILED", "계정 삭제에 실패했습니다.", 500);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return internalError("계정 삭제 중 오류가 발생했습니다.");
  }
}
