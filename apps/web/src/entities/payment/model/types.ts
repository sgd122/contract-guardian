export interface TossPaymentResult {
  paymentKey: string;
  orderId: string;
  status: string;
  method: string;
  totalAmount: number;
  approvedAt: string;
  receipt?: { url: string };
}

export interface TossError {
  code: string;
  message: string;
}
