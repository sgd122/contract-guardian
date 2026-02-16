import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { internalError } from "@/shared/lib/api-errors";

export async function handleGetPaymentHistory(_request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user, supabase } = auth;

    // Fetch user's payment history (RLS enforces user_id filter)
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get payment history error:", error);
      return internalError();
    }

    return NextResponse.json(payments || []);
  } catch (error) {
    console.error("Get payment history error:", error);
    return internalError();
  }
}
