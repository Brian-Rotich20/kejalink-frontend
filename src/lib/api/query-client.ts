import { QueryClient } from "@tanstack/react-query";
import { isApiError, isRetryable } from "./errors";

/** Backoff for GETs: ~0.8 s then ~2.4 s (with jitter), enough to ride out a Render cold start. */
export const retryDelay = (attempt: number): number =>
  Math.min(800 * 3 ** attempt, 8000) + Math.random() * 250;

export const MAX_GET_RETRIES = 2;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => failureCount < MAX_GET_RETRIES && isRetryable(error),
        retryDelay,
      },
      mutations: {
        // Mutations never retry on their own: a repeated POST could double-book.
        retry: false,
      },
    },
  });
}

/** 401 anywhere means the session is gone. */
export const isUnauthorized = (error: unknown): boolean => isApiError(error) && error.status === 401;
