import { handleListAnalyses } from "@/entities/analysis/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return handleListAnalyses(request);
}
