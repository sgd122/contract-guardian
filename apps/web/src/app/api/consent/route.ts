import { handleConsent } from "@/features/consent/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return handleConsent(request);
}
