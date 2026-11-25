import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { isApiError, isRetryable } from "./errors";

/** Backoff for GETs: ~0.8 s then ~2.4 s (with jitter), enough to ride out a Render cold start. */
export const retryDelay = (attempt: number): number =>
  Math.min(800 * 3 ** attempt, 8000) + Math.random() * 250;

export const MAX_GET_RETRIES = 2;

export const shouldRetryQuery = (failureCount: number, error: unknown): boolean =>
  failureCount < MAX_GET_RETRIES && isRetryable(error);

export type SessionProblem = "signed-out" | "suspended";

/** 401 anywhere means the session is gone; ACCOUNT_SUSPENDED means it was cut off. */
export function sessionProblem(error: unknown): SessionProblem | null {
  if (!isApiError(error)) return null;
  if (error.code === "ACCOUNT_SUSPENDED") return "suspended";
  if (error.status === 401) return "signed-out";
  return null;
}

export function makeQueryClient(onSessionProblem?: (problem: SessionProblem) => void) {
  const report = (error: unknown) => {
    const problem = sessionProblem(error);
    if (problem && onSessionProblem) onSessionProblem(problem);
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError: report }),
    mutationCache: new MutationCache({ onError: report }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: shouldRetryQuery,
        retryDelay,
      },
      mutations: {
        // Mutations never retry on their own: a repeated POST could double-book.
        retry: false,
      },
    },
  });
}
