import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code") || "UNKNOWN";
  const message = searchParams.get("message") || "결제에 실패했습니다.";
  const orderId = searchParams.get("orderId");

  const failUrl = new URL("/payment/fail", request.url);
  failUrl.searchParams.set("code", code);
  failUrl.searchParams.set("message", message);
  if (orderId) {
    failUrl.searchParams.set("orderId", orderId);
  }

  return NextResponse.redirect(failUrl);
}
