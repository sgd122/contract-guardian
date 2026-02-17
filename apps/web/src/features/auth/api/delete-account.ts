import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { rateLimited, internalError, apiError } from "@/shared/lib/api-errors";
import { createAdminClient } from "@/shared/api/supabase/admin";
import { logAudit } from "@/shared/lib/audit-log";

export async function handleDeleteAccount() {
  // Auth check
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { user } = auth;

  // Rate limit: 1 request per hour per user
  const rateLimit = await checkRateLimit(`delete-account:${user.id}`, 1, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimited();
  }

  try {
    const admin = createAdminClient();

    // 1. Delete storage files (outside transaction — storage is not in DB)
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

    // 2. Atomically delete payments, analyses, profile via RPC
    const { error: rpcError } = await admin.rpc("delete_user_data", {
      p_user_id: user.id,
    });

    if (rpcError) {
      console.error("Failed to delete user data:", rpcError);
      return apiError("DELETE_FAILED", "사용자 데이터 삭제에 실패했습니다.", 500);
    }

    // 3. Delete auth user (outside transaction — auth.admin API)
    const { error: authError } = await admin.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error("Failed to delete auth user:", authError);
      return apiError("DELETE_FAILED", "계정 삭제에 실패했습니다.", 500);
    }

    await logAudit(admin, {
      userId: user.id,
      action: "account.delete",
      resourceType: "account",
      resourceId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return internalError("계정 삭제 중 오류가 발생했습니다.");
  }
}
