import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaymentCreateResponse, PaymentConfirmResponse } from '@cg/shared';
import type { ApiClient } from '../client';
import { createPaymentService } from '../services/payment';
import { queryKeys } from '../query-keys';

interface UsePaymentReturn {
  initiatePayment: (
    params: { analysisId: string; amount: number },
  ) => Promise<PaymentCreateResponse>;
  confirmPayment: (
    params: { orderId: string; paymentKey: string; amount: number },
  ) => Promise<PaymentConfirmResponse>;
  paymentStatus: 'idle' | 'creating' | 'confirming' | 'success' | 'error';
  error: Error | null;
  reset: () => void;
}

export function usePayment(client: ApiClient): UsePaymentReturn {
  const queryClient = useQueryClient();
  const service = useMemo(() => createPaymentService(client), [client]);

  const createMutation = useMutation({
    mutationFn: ({ analysisId, amount }: { analysisId: string; amount: number }) =>
      service.createPayment(analysisId, amount),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ orderId, paymentKey, amount }: { orderId: string; paymentKey: string; amount: number }) =>
      service.confirmPayment(orderId, paymentKey, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.history });
    },
  });

  const paymentStatus: UsePaymentReturn['paymentStatus'] =
    confirmMutation.isSuccess ? 'success' :
    confirmMutation.isError || createMutation.isError ? 'error' :
    confirmMutation.isPending ? 'confirming' :
    createMutation.isPending ? 'creating' :
    'idle';

  const error = confirmMutation.error ?? createMutation.error ?? null;

  const reset = () => {
    createMutation.reset();
    confirmMutation.reset();
  };

  return {
    initiatePayment: (params) => createMutation.mutateAsync(params),
    confirmPayment: (params) => confirmMutation.mutateAsync(params),
    paymentStatus,
    error,
    reset,
  };
}
