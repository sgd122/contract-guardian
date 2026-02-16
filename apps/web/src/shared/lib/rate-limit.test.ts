import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should allow first request within limit", () => {
    const result = checkRateLimit("user:123", 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should allow requests up to limit", () => {
    const key = "user:456";
    const limit = 3;
    const windowMs = 60000;

    // First request
    const result1 = checkRateLimit(key, limit, windowMs);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    // Second request
    const result2 = checkRateLimit(key, limit, windowMs);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    // Third request
    const result3 = checkRateLimit(key, limit, windowMs);
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it("should block requests over limit", () => {
    const key = "user:789";
    const limit = 2;
    const windowMs = 60000;

    // Consume all allowed requests
    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);

    // This should be blocked
    const result = checkRateLimit(key, limit, windowMs);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset window after time expires", () => {
    const key = "user:reset";
    const limit = 2;
    const windowMs = 60000;

    // Consume all requests
    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);

    // Next request should be blocked
    const blocked = checkRateLimit(key, limit, windowMs);
    expect(blocked.allowed).toBe(false);

    // Advance time past window
    vi.advanceTimersByTime(windowMs + 1000);

    // Should be allowed again
    const result = checkRateLimit(key, limit, windowMs);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("should handle different keys independently", () => {
    const limit = 2;
    const windowMs = 60000;

    // User 1 consumes limit
    checkRateLimit("user:1", limit, windowMs);
    checkRateLimit("user:1", limit, windowMs);
    const blocked1 = checkRateLimit("user:1", limit, windowMs);
    expect(blocked1.allowed).toBe(false);

    // User 2 should have fresh limit
    const allowed2 = checkRateLimit("user:2", limit, windowMs);
    expect(allowed2.allowed).toBe(true);
    expect(allowed2.remaining).toBe(1);
  });

  it("should maintain separate counters for different operations", () => {
    const limit = 3;
    const windowMs = 60000;

    // Upload operation
    checkRateLimit("user:100:upload", limit, windowMs);
    checkRateLimit("user:100:upload", limit, windowMs);

    // Analysis operation should have independent count
    const result = checkRateLimit("user:100:analysis", limit, windowMs);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("should handle limit of 1 correctly", () => {
    const key = "user:single";
    const limit = 1;
    const windowMs = 60000;

    // First request allowed
    const result1 = checkRateLimit(key, limit, windowMs);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(0);

    // Second request blocked
    const result2 = checkRateLimit(key, limit, windowMs);
    expect(result2.allowed).toBe(false);
    expect(result2.remaining).toBe(0);
  });

  it("should handle high limits correctly", () => {
    const key = "user:high";
    const limit = 1000;
    const windowMs = 60000;

    // Make 999 requests
    for (let i = 0; i < 999; i++) {
      checkRateLimit(key, limit, windowMs);
    }

    // 1000th request should still be allowed
    const result = checkRateLimit(key, limit, windowMs);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);

    // 1001st request should be blocked
    const blocked = checkRateLimit(key, limit, windowMs);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("should handle different window sizes", () => {
    const key1 = "user:short";
    const key2 = "user:long";
    const limit = 2;

    // Short window (1 second)
    checkRateLimit(key1, limit, 1000);
    checkRateLimit(key1, limit, 1000);

    // Long window (1 hour)
    checkRateLimit(key2, limit, 3600000);
    checkRateLimit(key2, limit, 3600000);

    // Advance 2 seconds
    vi.advanceTimersByTime(2000);

    // Short window should be reset
    const result1 = checkRateLimit(key1, limit, 1000);
    expect(result1.allowed).toBe(true);

    // Long window should still be active
    const result2 = checkRateLimit(key2, limit, 3600000);
    expect(result2.allowed).toBe(false);
  });

  it("should calculate remaining correctly throughout window", () => {
    const key = "user:remaining";
    const limit = 5;
    const windowMs = 60000;

    expect(checkRateLimit(key, limit, windowMs).remaining).toBe(4);
    expect(checkRateLimit(key, limit, windowMs).remaining).toBe(3);
    expect(checkRateLimit(key, limit, windowMs).remaining).toBe(2);
    expect(checkRateLimit(key, limit, windowMs).remaining).toBe(1);
    expect(checkRateLimit(key, limit, windowMs).remaining).toBe(0);
    expect(checkRateLimit(key, limit, windowMs).remaining).toBe(0); // Over limit
  });
});
