"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@cg/api";
import { apiClient } from "@/shared/lib/api-client";
import type { Payment } from "@cg/shared";

export function usePaymentHistory() {
  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: queryKeys.payments.history,
    queryFn: () => apiClient.get<Payment[]>("/api/payment/history"),
  });

  return { payments, isLoading, error };
}
