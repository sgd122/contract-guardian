import { handleWebhook } from "@/features/payment/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return handleWebhook(request);
}
