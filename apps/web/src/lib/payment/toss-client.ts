import { env } from "@/lib/env";

const TOSS_API_URL = "https://api.tosspayments.com/v1/payments";

function getAuthHeader(): string {
  const encoded = Buffer.from(`${env.TOSS_SECRET_KEY}:`).toString("base64");
  return `Basic ${encoded}`;
}

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

export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<TossPaymentResult> {
  const response = await fetch(`${TOSS_API_URL}/confirm`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!response.ok) {
    const error: TossError = await response.json();
    throw new Error(`Toss payment error [${error.code}]: ${error.message}`);
  }

  return response.json();
}

export async function getPayment(
  paymentKey: string
): Promise<TossPaymentResult> {
  const response = await fetch(`${TOSS_API_URL}/${paymentKey}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error: TossError = await response.json();
    throw new Error(`Toss payment error [${error.code}]: ${error.message}`);
  }

  return response.json();
}
