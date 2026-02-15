import { handleUpload } from "@/features/upload/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return handleUpload(request);
}
