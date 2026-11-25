import "server-only";
import { z } from "zod";
import { httpUrl, parseOrThrow, withoutBlanks } from "./parse";

export const DEFAULT_API_INTERNAL_URL = "https://kejalink-api.onrender.com";

export const serverEnvSchema = z.object({
  /** Origin of the Fastify API, reached server-to-server (proxy + RSC reads). No trailing /api. */
  API_INTERNAL_URL: httpUrl.default(DEFAULT_API_INTERNAL_URL),
  /** Milliseconds the server waits on the API before giving up (Render cold starts take ~60 s). */
  API_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120_000).default(55_000),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const parseServerEnv = (raw: {
  API_INTERNAL_URL?: string | undefined;
  API_TIMEOUT_MS?: string | undefined;
}): ServerEnv =>
  parseOrThrow(
    serverEnvSchema,
    withoutBlanks({ API_INTERNAL_URL: raw.API_INTERNAL_URL, API_TIMEOUT_MS: raw.API_TIMEOUT_MS }),
    "server",
  );

export const serverEnv = parseServerEnv({
  API_INTERNAL_URL: process.env.API_INTERNAL_URL,
  API_TIMEOUT_MS: process.env.API_TIMEOUT_MS,
});
