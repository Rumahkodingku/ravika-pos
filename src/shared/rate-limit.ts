type Entry = {
  count: number;
  resetAt: number;
};

// shortcut: in-memory rate limit resets on restart; replace with shared storage if multi-process.
const buckets = new Map<string, Entry>();

function prune(now: number) {
  if (buckets.size < 1000) {
    return;
  }

  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    prune(now);
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}
