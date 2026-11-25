import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import type { z } from "zod";
import { serverEnv } from "@/lib/env/server";
import { buildQuery } from "./client";
import { type Envelope, parseEnvelope, readJson } from "./envelope";
import { ApiError, FRIENDLY, NETWORK_ERROR, TIMEOUT } from "./errors";
import { withRetry } from "./retry";
import { sessionResponse, type SessionResponse } from "./schemas/user";

type Query = Record<string, string | number | boolean | null | undefined>;

async function rawGet(path: string, init: { cookie?: string | null; query?: Query }): Promise<Response> {
  const url = `${serverEnv.API_INTERNAL_URL}/api${path}${buildQuery(init.query)}`;
  const timeout = AbortSignal.timeout(serverEnv.API_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "GET",
      headers: { accept: "application/json", ...(init.cookie ? { cookie: init.cookie } : {}) },
      cache: "no-store",
      signal: timeout,
    });
  } catch {
    if (timeout.aborted)
      throw new ApiError({ status: 0, code: TIMEOUT, message: FRIENDLY[TIMEOUT] ?? "Timed out" });
    throw new ApiError({
      status: 0,
      code: NETWORK_ERROR,
      message: FRIENDLY[NETWORK_ERROR] ?? "Network error",
    });
  }
}

async function getEnvelope<S extends z.ZodType>(
  path: string,
  schema: S,
  init: { cookie?: string | null; query?: Query },
): Promise<Envelope<z.infer<S>>> {
  return withRetry(async () => {
    const response = await rawGet(path, init);
    return parseEnvelope(response.status, await readJson(response), response.headers, schema);
  });
}

/**
 * Anonymous read straight to the API (no cookie). Safe inside `"use cache"` scopes:
 * it touches no request data. Retries cold starts (network errors, 502/503/504).
 */
export function publicGet<S extends z.ZodType>(path: string, schema: S, query?: Query) {
  return getEnvelope(path, schema, query ? { query } : {});
}

/** The incoming request's cookie header, forwarded as-is. */
async function incomingCookie(): Promise<string | null> {
  return (await headers()).get("cookie");
}

/** Read as the signed-in user (forwards the incoming cookie). Request-time only. */
export async function authedGet<S extends z.ZodType>(path: string, schema: S, query?: Query) {
  const cookie = await incomingCookie();
  return getEnvelope(path, schema, query ? { cookie, query } : { cookie });
}

/** Cheap check: is any Better Auth session cookie present? (Not proof of a valid session.) */
export const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"] as const;

export const hasSessionCookie = (cookieHeader: string | null): boolean =>
  !!cookieHeader &&
  cookieHeader.split(";").some((part) => {
    const name = part.split("=", 1)[0]?.trim();
    return name !== undefined && (SESSION_COOKIES as readonly string[]).includes(name);
  });

/**
 * The current session, or null. Deduplicated per request (layout + page share one call).
 * Throws ApiError only when the API cannot be reached (callers show the waking state).
 */
export const getServerSession = cache(async (): Promise<SessionResponse> => {
  const cookie = await incomingCookie();
  if (!hasSessionCookie(cookie)) return null;
  return withRetry(async () => {
    const response = await rawGet("/auth/get-session", { cookie });
    if (response.status >= 500 || response.status === 429) {
      throw new ApiError({
        status: response.status,
        code: "SERVICE_UNAVAILABLE",
        message: "Session check failed",
      });
    }
    if (!response.ok) return null;
    const parsed = sessionResponse.safeParse(await readJson(response));
    return parsed.success ? parsed.data : null;
  });
});
