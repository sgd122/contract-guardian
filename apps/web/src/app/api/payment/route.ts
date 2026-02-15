import { handleCreatePayment } from "@/features/payment/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return handleCreatePayment(request);
}
