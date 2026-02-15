"use client";

import { useState, useCallback } from "react";
import { usePayment as usePaymentHook } from "@cg/api";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { apiClient } from "@/shared/lib/api-client";

interface UsePaymentFlowReturn {
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  handlePayment: (
    analysisId: string,
    amount: number,
    options?: { userId?: string; provider?: string; customerEmail?: string }
  ) => Promise<void>;
  paymentStatus: string;
  error: unknown;
}

export function usePaymentFlow(): UsePaymentFlowReturn {
  const { initiatePayment, paymentStatus, error } =
    usePaymentHook(apiClient);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayment = useCallback(
    async (
      analysisId: string,
      amount: number,
      options?: { userId?: string; provider?: string; customerEmail?: string }
    ) => {
      const result = await initiatePayment(analysisId, amount);

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        throw new Error("결제 설정이 올바르지 않습니다.");
      }

      const tossPayments = await loadTossPayments(clientKey);
      const customerKey = options?.userId ?? ANONYMOUS;
      const payment = tossPayments.payment({ customerKey });

      const origin = window.location.origin;
      const successUrl = new URL("/api/payment/success", origin);
      successUrl.searchParams.set("analysisId", analysisId);
      if (options?.provider) {
        successUrl.searchParams.set("provider", options.provider);
      }

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: amount },
        orderId: result.orderId,
        orderName: result.orderName,
        successUrl: successUrl.toString(),
        failUrl: `${origin}/api/payment/fail`,
        customerEmail: options?.customerEmail,
      });
      // Browser redirects after requestPayment — no code runs after this
    },
    [initiatePayment]
  );

  return {
    showPaymentModal,
    setShowPaymentModal,
    handlePayment,
    paymentStatus,
    error,
  };
}
