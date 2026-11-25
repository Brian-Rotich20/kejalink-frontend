import type { z } from "zod";
import { publicEnv } from "@/lib/env/public";
import { type Envelope, parseEnvelope, readJson } from "./envelope";
import { ApiError, FRIENDLY, NETWORK_ERROR, TIMEOUT } from "./errors";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

export type ApiFetchOptions<S extends z.ZodType> = {
  schema: S;
  method?: Method;
  /** JSON body. `undefined` sends no body at all (the reject endpoint accepts that). */
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
};

/** Browser base: same origin (through the /api proxy) unless app and API share a domain. */
export const apiBase = (): string => publicEnv.NEXT_PUBLIC_API_BASE ?? "";

export function buildQuery(query: ApiFetchOptions<z.ZodType>["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Browser-side call to the app API (`/api/...`). Unwraps the envelope, validates with Zod and
 * throws a typed ApiError. Retries are left to TanStack Query (GETs only).
 */
export async function apiFetch<S extends z.ZodType>(
  path: string,
  options: ApiFetchOptions<S>,
): Promise<Envelope<z.infer<S>>> {
  const { schema, method = "GET", body, query, signal, timeoutMs = 60_000 } = options;
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api${path}${buildQuery(query)}`, {
      method,
      credentials: "include",
      headers: {
        accept: "application/json",
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: combined,
      cache: "no-store",
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new ApiError({ status: 0, code: TIMEOUT, message: FRIENDLY[TIMEOUT] ?? "Timed out" });
    }
    throw new ApiError({
      status: 0,
      code: NETWORK_ERROR,
      message: FRIENDLY[NETWORK_ERROR] ?? "Network error",
    });
  }

  return parseEnvelope(response.status, await readJson(response), response.headers, schema);
}
