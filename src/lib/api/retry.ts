import { isRetryable } from "./errors";
import { MAX_GET_RETRIES, retryDelay } from "./query-client";

type RetryOptions = {
  retries?: number;
  delay?: (attempt: number) => number;
  shouldRetry?: (error: unknown) => boolean;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Run `fn`, retrying on network errors and 502/503/504 (a sleeping Render instance),
 * up to `retries` extra attempts with backoff. Only for idempotent reads.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = MAX_GET_RETRIES,
    delay = retryDelay,
    shouldRetry = isRetryable,
    sleep = defaultSleep,
  } = options;
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) throw error;
      await sleep(delay(attempt));
      attempt += 1;
    }
  }
}
