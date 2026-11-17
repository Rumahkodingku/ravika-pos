const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

type Entry = {
  count: number;
  resetAt: number;
};

// shortcut: in-memory rate limit resets on restart; replace with shared storage if multi-process.
const attempts = new Map<string, Entry>();

function prune(now: number) {
  if (attempts.size < 1000) {
    return;
  }

  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

export function allowLoginAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt <= now) {
    return true;
  }

  return entry.count < MAX_FAILURES;
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    prune(now);
    return;
  }

  entry.count += 1;
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
