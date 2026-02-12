import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amount = searchParams.get("amount");

  if (!orderId || !paymentKey || !amount) {
    return NextResponse.redirect(
      new URL("/dashboard?error=invalid_payment", request.url)
    );
  }

  // Redirect to client-side confirmation page with payment details
  const confirmUrl = new URL("/payment/confirm", request.url);
  confirmUrl.searchParams.set("orderId", orderId);
  confirmUrl.searchParams.set("paymentKey", paymentKey);
  confirmUrl.searchParams.set("amount", amount);

  return NextResponse.redirect(confirmUrl);
}
