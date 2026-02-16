import { handleContact } from "@/features/contact/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return handleContact(request);
}
