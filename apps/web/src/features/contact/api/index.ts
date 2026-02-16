import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { apiError, rateLimited, internalError } from "@/shared/lib/api-errors";
import { sendContactEmail } from "@/shared/lib/email";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export async function handleContact(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = await checkRateLimit(`contact:${ip}`, 5, 60_000 * 10);
  if (!allowed) return rateLimited();

  const body = await request.json().catch(() => null);
  if (!body) return apiError("INVALID_INPUT", "요청 본문이 올바르지 않습니다.", 400);

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("INVALID_INPUT", "입력값을 확인해주세요.", 400);
  }

  const sent = await sendContactEmail(parsed.data);
  if (!sent) {
    return internalError("문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  return NextResponse.json({ success: true });
}
