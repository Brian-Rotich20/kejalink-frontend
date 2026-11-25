import { z } from "zod";
import { httpUrl, parseOrThrow, withoutBlanks } from "./parse";

/**
 * Browser-safe configuration. Every NEXT_PUBLIC_* value is inlined at build time,
 * so each one is referenced literally here. Never put a secret in NEXT_PUBLIC_*.
 */
const schema = z.object({
  /** Canonical site origin (used for metadata, sitemap, OG). */
  NEXT_PUBLIC_SITE_URL: httpUrl.default("http://localhost:3000"),
  /**
   * Base for browser API calls. Empty (default) = same origin, through the /api proxy.
   * Set to the API origin only once app and API share a registrable domain.
   */
  NEXT_PUBLIC_API_BASE: httpUrl.optional(),
  /** Shown wherever V1 has no self-service path (password reset, appeals). */
  NEXT_PUBLIC_SUPPORT_EMAIL: z.email().optional(),
});

const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

export const publicEnv = parseOrThrow(
  schema,
  withoutBlanks({
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : undefined),
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  }),
  "public",
);

export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;
export const supportEmail = publicEnv.NEXT_PUBLIC_SUPPORT_EMAIL ?? null;
