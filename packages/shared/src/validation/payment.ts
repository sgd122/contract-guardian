import { z } from 'zod';

export const PaymentConfirmSchema = z.object({
  orderId: z.string().min(1, '주문 ID는 필수입니다'),
  paymentKey: z.string().min(1, '결제 키는 필수입니다'),
  amount: z.number().positive('결제 금액은 0보다 커야 합니다'),
});

export type PaymentConfirmInput = z.infer<typeof PaymentConfirmSchema>;
