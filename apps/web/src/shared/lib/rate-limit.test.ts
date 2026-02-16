import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should allow first request within limit", async () => {
    const result = await checkRateLimit("user:123", 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should allow requests up to limit", async () => {
    const key = "user:456";
    const limit = 3;
    const windowMs = 60000;

    const result1 = await checkRateLimit(key, limit, windowMs);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = await checkRateLimit(key, limit, windowMs);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = await checkRateLimit(key, limit, windowMs);
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it("should block requests over limit", async () => {
    const key = "user:789";
    const limit = 2;
    const windowMs = 60000;

    await checkRateLimit(key, limit, windowMs);
    await checkRateLimit(key, limit, windowMs);

    const result = await checkRateLimit(key, limit, windowMs);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset window after time expires", async () => {
    const key = "user:reset";
    const limit = 2;
    const windowMs = 60000;

    await checkRateLimit(key, limit, windowMs);
    await checkRateLimit(key, limit, windowMs);

    const blocked = await checkRateLimit(key, limit, windowMs);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(windowMs + 1000);

    const result = await checkRateLimit(key, limit, windowMs);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("should handle different keys independently", async () => {
    const limit = 2;
    const windowMs = 60000;

    await checkRateLimit("user:1", limit, windowMs);
    await checkRateLimit("user:1", limit, windowMs);
    const blocked1 = await checkRateLimit("user:1", limit, windowMs);
    expect(blocked1.allowed).toBe(false);

    const allowed2 = await checkRateLimit("user:2", limit, windowMs);
    expect(allowed2.allowed).toBe(true);
    expect(allowed2.remaining).toBe(1);
  });

  it("should maintain separate counters for different operations", async () => {
    const limit = 3;
    const windowMs = 60000;

    await checkRateLimit("user:100:upload", limit, windowMs);
    await checkRateLimit("user:100:upload", limit, windowMs);

    const result = await checkRateLimit("user:100:analysis", limit, windowMs);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("should handle limit of 1 correctly", async () => {
    const key = "user:single";
    const limit = 1;
    const windowMs = 60000;

    const result1 = await checkRateLimit(key, limit, windowMs);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(0);

    const result2 = await checkRateLimit(key, limit, windowMs);
    expect(result2.allowed).toBe(false);
    expect(result2.remaining).toBe(0);
  });

  it("should handle high limits correctly", async () => {
    const key = "user:high";
    const limit = 1000;
    const windowMs = 60000;

    for (let i = 0; i < 999; i++) {
      await checkRateLimit(key, limit, windowMs);
    }

    const result = await checkRateLimit(key, limit, windowMs);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);

    const blocked = await checkRateLimit(key, limit, windowMs);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("should handle different window sizes", async () => {
    const key1 = "user:short";
    const key2 = "user:long";
    const limit = 2;

    await checkRateLimit(key1, limit, 1000);
    await checkRateLimit(key1, limit, 1000);

    await checkRateLimit(key2, limit, 3600000);
    await checkRateLimit(key2, limit, 3600000);

    vi.advanceTimersByTime(2000);

    const result1 = await checkRateLimit(key1, limit, 1000);
    expect(result1.allowed).toBe(true);

    const result2 = await checkRateLimit(key2, limit, 3600000);
    expect(result2.allowed).toBe(false);
  });

  it("should calculate remaining correctly throughout window", async () => {
    const key = "user:remaining";
    const limit = 5;
    const windowMs = 60000;

    expect((await checkRateLimit(key, limit, windowMs)).remaining).toBe(4);
    expect((await checkRateLimit(key, limit, windowMs)).remaining).toBe(3);
    expect((await checkRateLimit(key, limit, windowMs)).remaining).toBe(2);
    expect((await checkRateLimit(key, limit, windowMs)).remaining).toBe(1);
    expect((await checkRateLimit(key, limit, windowMs)).remaining).toBe(0);
    expect((await checkRateLimit(key, limit, windowMs)).remaining).toBe(0);
  });
});
