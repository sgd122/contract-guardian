import { handleAnalyze } from "@/features/analysis/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return handleAnalyze(request);
}
