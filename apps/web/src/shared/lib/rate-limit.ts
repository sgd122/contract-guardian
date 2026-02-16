import { Redis } from "@upstash/redis";

// --- Redis client (lazy singleton) ---
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

// --- In-memory fallback (single-instance only) ---
const rateMap = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}, 60_000);

function checkRateLimitMemory(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

// --- Redis implementation (fixed-window counter) ---
async function checkRateLimitRedis(
  client: Redis,
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const windowKey = `ratelimit:${key}:${Math.floor(Date.now() / windowMs)}`;

  const count = await client.incr(windowKey);

  if (count === 1) {
    // Set expiry only on first increment (new window)
    await client.pexpire(windowKey, windowMs);
  }

  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  return { allowed, remaining };
}

// --- Public API (async, Redis with in-memory fallback) ---
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const client = getRedis();

  if (client) {
    try {
      return await checkRateLimitRedis(client, key, limit, windowMs);
    } catch (error) {
      console.warn("Redis rate limit failed, falling back to in-memory:", error);
      return checkRateLimitMemory(key, limit, windowMs);
    }
  }

  return checkRateLimitMemory(key, limit, windowMs);
}
