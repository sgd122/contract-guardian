import { handleReportGeneration } from "@/features/report/api";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleReportGeneration(request, { params });
}
