"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const orderName = searchParams.get("orderName");
  const customerKey = searchParams.get("customerKey");

  useEffect(() => {
    if (hasStarted.current) return;
    if (!orderId || !amount || !orderName) {
      setError("결제 정보가 올바르지 않습니다.");
      return;
    }

    hasStarted.current = true;

    async function startPayment() {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) {
          setError("결제 설정이 올바르지 않습니다.");
          return;
        }

        const tossPayments = await loadTossPayments(clientKey);
        const payment = tossPayments.payment({
          customerKey: customerKey ?? ANONYMOUS,
        });

        const origin = window.location.origin;

        const analysisId = searchParams.get("analysisId");
        const provider = searchParams.get("provider");
        const successUrl = new URL("/api/payment/success", origin);
        if (analysisId) successUrl.searchParams.set("analysisId", analysisId);
        if (provider) successUrl.searchParams.set("provider", provider);

        await payment.requestPayment({
          method: "CARD",
          amount: { currency: "KRW", value: Number(amount) },
          orderId: orderId!,
          orderName: decodeURIComponent(orderName!),
          successUrl: successUrl.toString(),
          failUrl: `${origin}/api/payment/fail`,
        });
      } catch (err) {
        if (err instanceof Error && err.message.includes("USER_CANCEL")) {
          window.close();
          return;
        }
        setError(
          err instanceof Error ? err.message : "결제 처리 중 오류가 발생했습니다."
        );
      }
    }

    startPayment();
  }, [orderId, amount, orderName, customerKey, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="h-10 w-10 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">결제 오류</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900">결제 준비 중...</h2>
        <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
