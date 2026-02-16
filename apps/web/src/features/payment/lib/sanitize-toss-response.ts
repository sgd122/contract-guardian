/**
 * Filter Toss Payments API response to retain only non-PII fields.
 * Raw responses may contain card numbers, buyer name, phone, etc.
 */

const ALLOWED_FIELDS = [
  "paymentKey",
  "orderId",
  "orderName",
  "status",
  "method",
  "type",
  "approvedAt",
  "requestedAt",
  "totalAmount",
  "suppliedAmount",
  "vat",
  "currency",
  "receiptUrl",
] as const;

export function sanitizeTossResponse(
  response: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const key of ALLOWED_FIELDS) {
    if (key in response) {
      sanitized[key] = response[key];
    }
  }

  return sanitized;
}
