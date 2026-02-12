import type { ApiClient } from '../client';
import type {
  PaymentCreateRequest,
  PaymentCreateResponse,
  PaymentConfirmRequest,
  PaymentConfirmResponse,
} from '@cg/shared';
import { API_ROUTES } from '@cg/shared';

export function createPaymentService(client: ApiClient) {
  return {
    async createPayment(
      analysisId: string,
      amount: number,
    ): Promise<PaymentCreateResponse> {
      return client.post<PaymentCreateResponse>(API_ROUTES.paymentCreate, {
        analysisId,
        amount,
      } satisfies PaymentCreateRequest);
    },

    async confirmPayment(
      orderId: string,
      paymentKey: string,
      amount: number,
    ): Promise<PaymentConfirmResponse> {
      return client.post<PaymentConfirmResponse>(API_ROUTES.paymentConfirm, {
        orderId,
        paymentKey,
        amount,
      } satisfies PaymentConfirmRequest);
    },
  };
}
