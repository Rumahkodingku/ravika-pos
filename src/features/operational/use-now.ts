"use client";

import { useEffect, useState } from "react";

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}
