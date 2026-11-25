"use client";

import { useCallback, useEffect, useRef } from "react";

/** A stable callback that runs `delayMs` after the last call (latest arguments win). */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delayMs = 400) {
  const fnRef = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs],
  );
}
