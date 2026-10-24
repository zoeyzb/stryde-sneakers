import "server-only";

import { headers } from "next/headers";

const buckets = new Map<string, number[]>();

/**
 * Best-effort, per-instance sliding window. Serverless platforms run several
 * instances, so this only blunts bursts; it is not an abuse-prevention system.
 */
export async function rateLimit(scope: string, limit: number, windowMs: number) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return true;
}
