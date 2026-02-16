import { describe, it, expect } from "vitest";
import {
  apiError,
  unauthorized,
  notFound,
  rateLimited,
  internalError,
  dbError,
  withErrorHandler,
} from "./api-errors";
import { NextResponse } from "next/server";

describe("api-errors", () => {
  describe("apiError", () => {
    it("should return NextResponse with correct status and JSON", async () => {
      const response = apiError("INVALID_INPUT", "Invalid data", 400);
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json).toEqual({
        code: "INVALID_INPUT",
        message: "Invalid data",
      });
    });

    it("should handle different error codes", async () => {
      const response = apiError("PAYMENT_FAILED", "Payment declined", 402);
      expect(response.status).toBe(402);

      const json = await response.json();
      expect(json.code).toBe("PAYMENT_FAILED");
      expect(json.message).toBe("Payment declined");
    });
  });

  describe("unauthorized", () => {
    it("should return 401 status", () => {
      const response = unauthorized();
      expect(response.status).toBe(401);
    });

    it("should return UNAUTHORIZED code", async () => {
      const response = unauthorized();
      const json = await response.json();
      expect(json.code).toBe("UNAUTHORIZED");
      expect(json.message).toBe("로그인이 필요합니다.");
    });
  });

  describe("notFound", () => {
    it("should return 404 status", () => {
      const response = notFound();
      expect(response.status).toBe(404);
    });

    it("should return NOT_FOUND code with default message", async () => {
      const response = notFound();
      const json = await response.json();
      expect(json.code).toBe("NOT_FOUND");
      expect(json.message).toBe("분석 결과를 찾을 수 없습니다.");
    });

    it("should accept custom message", async () => {
      const response = notFound("사용자를 찾을 수 없습니다.");
      const json = await response.json();
      expect(json.code).toBe("NOT_FOUND");
      expect(json.message).toBe("사용자를 찾을 수 없습니다.");
    });
  });

  describe("rateLimited", () => {
    it("should return 429 status", () => {
      const response = rateLimited();
      expect(response.status).toBe(429);
    });

    it("should return RATE_LIMITED code", async () => {
      const response = rateLimited();
      const json = await response.json();
      expect(json.code).toBe("RATE_LIMITED");
      expect(json.message).toBe("너무 많은 요청입니다. 잠시 후 다시 시도해주세요.");
    });
  });

  describe("internalError", () => {
    it("should return 500 status", () => {
      const response = internalError();
      expect(response.status).toBe(500);
    });

    it("should return INTERNAL_ERROR code with default message", async () => {
      const response = internalError();
      const json = await response.json();
      expect(json.code).toBe("INTERNAL_ERROR");
      expect(json.message).toBe("서버 오류가 발생했습니다.");
    });

    it("should accept custom message", async () => {
      const response = internalError("Claude API 오류");
      const json = await response.json();
      expect(json.code).toBe("INTERNAL_ERROR");
      expect(json.message).toBe("Claude API 오류");
    });
  });

  describe("dbError", () => {
    it("should return 500 status", () => {
      const response = dbError("데이터베이스 연결 실패");
      expect(response.status).toBe(500);
    });

    it("should return DB_ERROR code with custom message", async () => {
      const response = dbError("데이터 저장 실패");
      const json = await response.json();
      expect(json.code).toBe("DB_ERROR");
      expect(json.message).toBe("데이터 저장 실패");
    });
  });

  describe("withErrorHandler", () => {
    it("should pass through successful responses", async () => {
      const successHandler = async () => {
        return NextResponse.json({ success: true }, { status: 200 });
      };

      const wrapped = withErrorHandler(successHandler);
      const response = await wrapped();

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ success: true });
    });

    it("should catch errors and return internal error", async () => {
      const errorHandler = async () => {
        throw new Error("Something went wrong");
      };

      const wrapped = withErrorHandler(errorHandler);
      const response = await wrapped();

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      });
    });

    it("should catch and wrap any thrown error", async () => {
      const errorHandler = async () => {
        throw new TypeError("Type error");
      };

      const wrapped = withErrorHandler(errorHandler);
      const response = await wrapped();

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.code).toBe("INTERNAL_ERROR");
    });

    it("should preserve handler arguments", async () => {
      const handler = async (arg1: string, arg2: number) => {
        return NextResponse.json({ arg1, arg2 }, { status: 200 });
      };

      const wrapped = withErrorHandler(handler);
      const response = await wrapped("test", 42);

      const json = await response.json();
      expect(json).toEqual({ arg1: "test", arg2: 42 });
    });

    it("should handle async errors", async () => {
      const asyncErrorHandler = async () => {
        await Promise.resolve();
        throw new Error("Async error");
      };

      const wrapped = withErrorHandler(asyncErrorHandler);
      const response = await wrapped();

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.code).toBe("INTERNAL_ERROR");
    });

    it("should allow returning NextResponse errors from handler", async () => {
      const handler = async () => {
        return notFound("Custom not found");
      };

      const wrapped = withErrorHandler(handler);
      const response = await wrapped();

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({
        code: "NOT_FOUND",
        message: "Custom not found",
      });
    });
  });
});
