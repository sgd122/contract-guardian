import { useState, useCallback, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import type { PaymentCreateResponse } from '@cg/shared';
import { PRICE_STANDARD } from '@cg/shared';
import { supabase } from '../lib/supabase';
import { API_CONFIG } from '../constants/config';

type PaymentState = 'idle' | 'creating' | 'processing' | 'success' | 'error';

interface UsePaymentReturn {
  paymentStatus: PaymentState;
  error: Error | null;
  initiatePayment: (analysisId: string, amount?: number) => Promise<void>;
  checkPaymentStatus: (analysisId: string) => Promise<boolean>;
  reset: () => void;
}

const POLL_INTERVAL = 2000; // 2 seconds
const POLL_TIMEOUT = 300000; // 5 minutes

export function usePayment(): UsePaymentReturn {
  const [paymentStatus, setPaymentStatus] = useState<PaymentState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkPaymentStatusInternal = useCallback(
    async (analysisId: string): Promise<boolean> => {
      const { data, error: queryError } = await supabase
        .from('analyses')
        .select('status')
        .eq('id', analysisId)
        .single();

      if (queryError) return false;
      return data?.status !== 'pending_payment';
    },
    [],
  );

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  const initiatePayment = useCallback(
    async (analysisId: string, amount: number = PRICE_STANDARD) => {
      try {
        setPaymentStatus('creating');
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;

        if (!accessToken) {
          throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(
          `${API_CONFIG.baseUrl}/api/payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ analysisId, amount }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message ?? `결제 생성 실패 (${response.status})`,
          );
        }

        const paymentData: PaymentCreateResponse = await response.json();

        setPaymentStatus('processing');

        // Open Toss payment page in browser (web checkout page loads Toss SDK)
        const checkoutUrl = new URL('/payment/checkout', API_CONFIG.baseUrl);
        checkoutUrl.searchParams.set('orderId', paymentData.orderId);
        checkoutUrl.searchParams.set('amount', String(paymentData.amount));
        checkoutUrl.searchParams.set('orderName', paymentData.orderName);
        checkoutUrl.searchParams.set('analysisId', analysisId);
        const paymentUrl = checkoutUrl.toString();

        await WebBrowser.openBrowserAsync(paymentUrl);

        // Start polling for payment status after browser opens
        let hasCompleted = false;

        const pollPaymentStatus = async () => {
          if (hasCompleted) return;

          const paid = await checkPaymentStatusInternal(analysisId);
          if (paid) {
            hasCompleted = true;
            stopPolling();
            setPaymentStatus('success');
          }
        };

        // Poll every 2 seconds
        pollingIntervalRef.current = setInterval(
          pollPaymentStatus,
          POLL_INTERVAL,
        );

        // Timeout after 5 minutes
        pollingTimeoutRef.current = setTimeout(() => {
          if (!hasCompleted) {
            stopPolling();
            setPaymentStatus('idle');
          }
        }, POLL_TIMEOUT);

        // Check immediately once
        await pollPaymentStatus();
      } catch (err) {
        const paymentError =
          err instanceof Error ? err : new Error(String(err));
        setPaymentStatus('error');
        setError(paymentError);
        stopPolling();
        throw paymentError;
      }
    },
    [checkPaymentStatusInternal, stopPolling],
  );

  const checkPaymentStatus = useCallback(
    async (analysisId: string): Promise<boolean> => {
      return checkPaymentStatusInternal(analysisId);
    },
    [checkPaymentStatusInternal],
  );

  const reset = useCallback(() => {
    setPaymentStatus('idle');
    setError(null);
    stopPolling();
  }, [stopPolling]);

  return { paymentStatus, error, initiatePayment, checkPaymentStatus, reset };
}
