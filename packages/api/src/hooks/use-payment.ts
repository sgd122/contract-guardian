import { useState, useCallback } from 'react';
import type { PaymentCreateResponse, PaymentConfirmResponse } from '@cg/shared';
import type { ApiClient } from '../client';
import { createPaymentService } from '../services/payment';

type PaymentState = 'idle' | 'creating' | 'confirming' | 'success' | 'error';

interface UsePaymentReturn {
  paymentStatus: PaymentState;
  error: unknown;
  initiatePayment: (
    analysisId: string,
    amount: number,
  ) => Promise<PaymentCreateResponse>;
  confirmPayment: (
    orderId: string,
    paymentKey: string,
    amount: number,
  ) => Promise<PaymentConfirmResponse>;
  reset: () => void;
}

export function usePayment(client: ApiClient): UsePaymentReturn {
  const [paymentStatus, setPaymentStatus] = useState<PaymentState>('idle');
  const [error, setError] = useState<unknown>(null);
  const service = createPaymentService(client);

  const initiatePayment = useCallback(
    async (analysisId: string, amount: number) => {
      try {
        setPaymentStatus('creating');
        setError(null);
        const result = await service.createPayment(analysisId, amount);
        return result;
      } catch (err) {
        setPaymentStatus('error');
        setError(err);
        throw err;
      }
    },
    [client],
  );

  const confirmPayment = useCallback(
    async (orderId: string, paymentKey: string, amount: number) => {
      try {
        setPaymentStatus('confirming');
        setError(null);
        const result = await service.confirmPayment(
          orderId,
          paymentKey,
          amount,
        );
        setPaymentStatus('success');
        return result;
      } catch (err) {
        setPaymentStatus('error');
        setError(err);
        throw err;
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    setPaymentStatus('idle');
    setError(null);
  }, []);

  return { paymentStatus, error, initiatePayment, confirmPayment, reset };
}
