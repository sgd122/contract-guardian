import { handleGetPaymentHistory } from "@/entities/payment/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return handleGetPaymentHistory(request);
}
