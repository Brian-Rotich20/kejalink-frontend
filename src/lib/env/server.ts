import "server-only";
import { z } from "zod";
import { httpUrl, parseOrThrow, withoutBlanks } from "./parse";

export const DEFAULT_API_INTERNAL_URL = "https://kejalink-api.onrender.com";

export const serverEnvSchema = z.object({
  /** Origin of the Fastify API, reached server-to-server (proxy + RSC reads). No trailing /api. */
  API_INTERNAL_URL: httpUrl.default(DEFAULT_API_INTERNAL_URL),
  /**
   * Optional. Same-origin requests are forwarded with this Origin (e.g. the production URL),
   * so preview deployments need only one FRONTEND_URL entry on the API. Unset: forward as-is.
   */
  API_FORWARDED_ORIGIN: httpUrl.optional(),
  /** Milliseconds the server waits on the API before giving up (Render cold starts take ~60 s). */
  API_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120_000).default(55_000),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

type RawServerEnv = {
  API_INTERNAL_URL?: string | undefined;
  API_FORWARDED_ORIGIN?: string | undefined;
  API_TIMEOUT_MS?: string | undefined;
};

export const parseServerEnv = (raw: RawServerEnv): ServerEnv =>
  parseOrThrow(
    serverEnvSchema,
    withoutBlanks({
      API_INTERNAL_URL: raw.API_INTERNAL_URL,
      API_FORWARDED_ORIGIN: raw.API_FORWARDED_ORIGIN,
      API_TIMEOUT_MS: raw.API_TIMEOUT_MS,
    }),
    "server",
  );

export const serverEnv = parseServerEnv({
  API_INTERNAL_URL: process.env.API_INTERNAL_URL,
  API_FORWARDED_ORIGIN: process.env.API_FORWARDED_ORIGIN,
  API_TIMEOUT_MS: process.env.API_TIMEOUT_MS,
});
