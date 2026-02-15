import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/shared/lib/auth";
import { notFound, internalError } from "@/shared/lib/api-errors";

export async function handleGetAnalysis(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { user, supabase } = auth;

    const { id } = await params;

    // Use server client (RLS enforces user_id filter automatically)
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !analysis) {
      return notFound();
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Get analysis error:", error);
    return internalError();
  }
}
