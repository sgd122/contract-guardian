"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@cg/api";
import { getPaymentHistory } from "@/shared/api/actions";
import type { Payment } from "@cg/shared";

export function usePaymentHistory() {
  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: queryKeys.payments.history,
    queryFn: () => getPaymentHistory(),
  });

  return { payments, isLoading, error };
}
