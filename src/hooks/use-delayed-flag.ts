"use client";

import { useEffect, useState } from "react";

/**
 * True once `delayMs` has passed since the calling component mounted. Mount the caller only while
 * the thing you are waiting on is pending, and the timer resets itself.
 */
export function useElapsed(delayMs = 4000): boolean {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);
  return elapsed;
}
