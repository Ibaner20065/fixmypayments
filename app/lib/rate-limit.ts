/**
 * In-memory rate limiter using lru-cache.
 * Keys are `IP:endpoint` strings. Values are { count, resetAt }.
 *
 * NOTE: This is per-instance (per Vercel serverless function cold start).
 * Sufficient for MVP. Upgrade to Upstash Redis for distributed limiting.
 */
import { LRUCache } from 'lru-cache';

interface RateLimitEntry {
  count: number;
  resetAt: number; // epoch ms
}

// Max 1 000 distinct keys; each entry TTL = window + 1 min buffer
const store = new LRUCache<string, RateLimitEntry>({ max: 1000, ttl: 16 * 60 * 1000 });

export interface RateLimitConfig {
  windowMs: number; // sliding window in ms
  maxRequests: number;
}

/**
 * Returns true if the request is ALLOWED, false if rate-limited.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // Fresh window
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (entry.count >= config.maxRequests) {
    return false; // rate limited
  }

  entry.count += 1;
  store.set(key, entry);
  return true;
}

/** Helper to extract a request's IP from standard headers. */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
