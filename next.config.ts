import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Only set when app and API share a domain (direct browser calls); otherwise everything is same-origin. */
const apiBase = process.env.NEXT_PUBLIC_API_BASE?.trim().replace(/\/+$/, "") || "";

/** Map basemap tiles (see src/lib/env/public.ts); `{s}` subdomains become a wildcard host. */
const DEFAULT_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const tilesUrl = process.env.NEXT_PUBLIC_MAP_TILES_URL?.trim() || DEFAULT_TILES;
const tilesHost = tilesUrl.replace("{s}", "*").match(/^https:\/\/[^/]+/)?.[0] ?? "";

/**
 * Strict CSP without nonces: nonces would force every page to render per request and defeat the
 * static shells Cache Components produces. Inline scripts are Next's own bootstrap/RSC payload.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://res.cloudinary.com${tilesHost ? ` ${tilesHost}` : ""}`,
  "font-src 'self'",
  `connect-src 'self'${apiBase ? ` ${apiBase}` : ""}${isDev ? " ws: wss:" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Cloudinary resizes and picks AVIF/WebP itself; Vercel's optimiser is never used.
    loader: "custom",
    loaderFile: "./src/lib/cloudinary/loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [96, 160, 240, 320],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
