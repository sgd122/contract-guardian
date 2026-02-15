import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "DB_ERROR"
  | "INTERNAL_ERROR"
  | "CONFLICT"
  | "ALREADY_PROCESSING"
  | "PAYMENT_REQUIRED"
  | "PAYMENT_FAILED"
  | "AMOUNT_MISMATCH"
  | "ALREADY_PROCESSED"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FORMAT"
  | "INVALID_FILE"
  | "UPLOAD_FAILED"
  | "INVALID_AMOUNT"
  | "INVALID_STATUS"
  | "DELETE_FAILED"
  | "FILE_ERROR"
  | "NOT_READY";

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}

// Pre-defined common errors
export const unauthorized = () =>
  apiError("UNAUTHORIZED", "로그인이 필요합니다.", 401);

export const notFound = (message = "분석 결과를 찾을 수 없습니다.") =>
  apiError("NOT_FOUND", message, 404);

export const rateLimited = () =>
  apiError("RATE_LIMITED", "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.", 429);

export const internalError = (message = "서버 오류가 발생했습니다.") =>
  apiError("INTERNAL_ERROR", message, 500);

export const dbError = (message: string) =>
  apiError("DB_ERROR", message, 500);

export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API error:", error);
      return internalError();
    }
  };
}
