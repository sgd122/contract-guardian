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

      // For now, auto-confirm the payment (in production, integrate Toss widget)
      await confirmPayment(result.orderId, `pk_${Date.now()}`, amount);
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
