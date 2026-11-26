/**
 * Browser-safe configuration. Every NEXT_PUBLIC_* value is inlined at build time, so each one is
 * referenced literally here. Never put a secret in NEXT_PUBLIC_*.
 *
 * Deliberately dependency-free: this module ships to every page, and pulling Zod in here added
 * ~39 KB gzipped to the landing page. Invalid values throw at server start (instrumentation.ts
 * imports this module), so a bad deploy fails loudly before any page is served.
 */

const blankToUndefined = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

/** http(s) URL without a trailing slash, or throw naming the variable (never echoing the value). */
export function parseHttpUrl(name: string, value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid public environment:\n  - ${name}: must be a valid URL`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Invalid public environment:\n  - ${name}: must use http or https`);
  }
  return value.replace(/\/+$/, "");
}

export function parseEmail(name: string, value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`Invalid public environment:\n  - ${name}: must be an email address`);
  }
  return value;
}

const vercelUrl = blankToUndefined(process.env.NEXT_PUBLIC_VERCEL_URL);

export const publicEnv = {
  /** Canonical site origin (used for metadata, sitemap, OG). */
  NEXT_PUBLIC_SITE_URL:
    parseHttpUrl(
      "NEXT_PUBLIC_SITE_URL",
      blankToUndefined(process.env.NEXT_PUBLIC_SITE_URL) ?? (vercelUrl ? `https://${vercelUrl}` : undefined),
    ) ?? "http://localhost:3000",
  /**
   * Base for browser API calls. Unset (default) = same origin, through the /api proxy.
   * Set to the API origin only once app and API share a registrable domain.
   */
  NEXT_PUBLIC_API_BASE: parseHttpUrl(
    "NEXT_PUBLIC_API_BASE",
    blankToUndefined(process.env.NEXT_PUBLIC_API_BASE),
  ),
  /** Shown wherever V1 has no self-service path (password reset, appeals). */
  NEXT_PUBLIC_SUPPORT_EMAIL: parseEmail(
    "NEXT_PUBLIC_SUPPORT_EMAIL",
    blankToUndefined(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
  ),
  /**
   * Map basemap tiles ({s}/{z}/{x}/{y}/{r} template, https only). The default is OpenStreetMap's
   * own tile server, which allows only light use: set a keyed provider (MapTiler, Stadia, Thunderforest)
   * here before production traffic, with its attribution below.
   */
  NEXT_PUBLIC_MAP_TILES_URL:
    blankToUndefined(process.env.NEXT_PUBLIC_MAP_TILES_URL) ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  NEXT_PUBLIC_MAP_ATTRIBUTION:
    blankToUndefined(process.env.NEXT_PUBLIC_MAP_ATTRIBUTION) ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;
export const supportEmail = publicEnv.NEXT_PUBLIC_SUPPORT_EMAIL ?? null;
export const mapTiles = {
  url: publicEnv.NEXT_PUBLIC_MAP_TILES_URL,
  attribution: publicEnv.NEXT_PUBLIC_MAP_ATTRIBUTION,
};
