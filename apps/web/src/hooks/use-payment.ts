"use client";

import { useState, useCallback, useMemo } from "react";
import { createApiClient, usePayment as usePaymentHook } from "@cg/api";

interface UsePaymentFlowReturn {
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  handlePayment: (analysisId: string, amount: number) => Promise<void>;
  paymentStatus: string;
  error: unknown;
}

export function usePaymentFlow(): UsePaymentFlowReturn {
  const client = useMemo(
    () => createApiClient({ baseURL: "" }),
    []
  );
  const { initiatePayment, confirmPayment, paymentStatus, error } =
    usePaymentHook(client);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayment = useCallback(
    async (analysisId: string, amount: number) => {
      const result = await initiatePayment(analysisId, amount);

      // TODO: Integrate Toss Payments widget for production
      if (process.env.NODE_ENV !== "development") {
        throw new Error(
          "결제 위젯이 아직 연동되지 않았습니다. 개발 환경에서만 테스트할 수 있습니다."
        );
      }
      await confirmPayment(result.orderId, `pk_dev_${Date.now()}`, amount);
      setShowPaymentModal(false);
    },
    [initiatePayment, confirmPayment]
  );

  return {
    showPaymentModal,
    setShowPaymentModal,
    handlePayment,
    paymentStatus,
    error,
  };
}
