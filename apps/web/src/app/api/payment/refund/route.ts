import { NextRequest } from "next/server";
import { handleRefund } from "@/features/payment/api";

export async function POST(req: NextRequest) {
  return handleRefund(req);
}
