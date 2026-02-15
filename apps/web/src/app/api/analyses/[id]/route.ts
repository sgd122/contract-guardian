import { handleGetAnalysis, handleDeleteAnalysis } from "@/entities/analysis/api";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleGetAnalysis(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleDeleteAnalysis(request, { params });
}
