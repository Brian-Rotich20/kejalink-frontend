/**
 * Same-origin proxy: the browser only ever talks to this site, and this forwards /api/* to the
 * Fastify API. Better Auth's cookies come back through here, so they become first-party,
 * host-only cookies on this site's domain (Vercel and onrender.com are different sites).
 */

/** Request headers the API needs. Everything else (host, content-length, hop-by-hop) is dropped. */
const FORWARD_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "cookie",
  "origin",
  "user-agent",
  "if-none-match",
] as const;

/** Response headers never passed back. fetch() already decoded the body, so its encoding/length are stale. */
const DROP_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
  "content-length",
  "set-cookie",
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "access-control-expose-headers",
  "vary",
  "x-render-origin-server",
  "rndr-id",
]);

export type ForwardOptions = {
  /** API origin, e.g. https://kejalink-api.onrender.com (no /api). */
  upstream: string;
  timeoutMs: number;
  /**
   * When set, a request whose Origin is this site's own origin is forwarded with this Origin
   * instead, so preview deployments only need one entry in the API's FRONTEND_URL. Cross-site
   * Origins are always forwarded unchanged, so the API's CSRF check still refuses them.
   */
  forwardedOrigin?: string | undefined;
  fetchImpl?: typeof fetch;
};

/** The visitor's IP as the hosting edge saw it (Vercel overwrites x-forwarded-for; x-real-ip is its copy). */
export function clientIp(headers: Headers): string | null {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || null;
}

/** This deployment's own origin, from the request URL and the edge's forwarded host/proto. */
export function selfOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function buildUpstreamHeaders(request: Request, options: ForwardOptions): Headers {
  const out = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) out.set(name, value);
  }
  const origin = request.headers.get("origin");
  if (origin && options.forwardedOrigin && origin === selfOrigin(request)) {
    out.set("origin", options.forwardedOrigin);
  }
  const ip = clientIp(request.headers);
  if (ip) out.set("x-forwarded-for", ip);
  return out;
}

/** Rewrite an absolute redirect back onto this site, so the browser never leaves it. */
function rewriteLocation(location: string, upstream: string): string {
  if (location.startsWith(upstream)) return location.slice(upstream.length) || "/";
  return location;
}

const errorResponse = (status: number, code: string, message: string) =>
  Response.json(
    { success: false, error: { code, message, details: null }, code, message },
    { status, headers: { "cache-control": "no-store" } },
  );

export async function forward(request: Request, options: ForwardOptions): Promise<Response> {
  const { pathname, search } = new URL(request.url);
  if (!pathname.startsWith("/api/")) return errorResponse(404, "NOT_FOUND", "Not found");
  const target = `${options.upstream}${pathname}${search}`;
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD" && request.body !== null;
  const timeout = AbortSignal.timeout(options.timeoutMs);

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers: buildUpstreamHeaders(request, options),
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.any([request.signal, timeout]),
  };
  if (hasBody) {
    // Stream the body through untouched (multipart uploads included).
    init.body = request.body;
    init.duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await (options.fetchImpl ?? fetch)(target, init);
  } catch {
    if (timeout.aborted) {
      return errorResponse(504, "TIMEOUT", "The server took too long to answer. It may be waking up.");
    }
    return errorResponse(502, "NETWORK_ERROR", "We couldn't reach the KejaLink server.");
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (DROP_RESPONSE_HEADERS.has(key)) return;
    responseHeaders.set(key, key === "location" ? rewriteLocation(value, options.upstream) : value);
  });
  // Every cookie, one header each (joining them breaks Expires dates that contain commas).
  for (const cookie of upstream.headers.getSetCookie()) responseHeaders.append("set-cookie", cookie);
  responseHeaders.set("cache-control", "no-store");

  const noBody = method === "HEAD" || upstream.status === 204 || upstream.status === 304;
  return new Response(noBody ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

/** Writes that can change what public listing pages show (details, photos, availability, moderation). */
export function affectsListings(method: string, pathname: string): boolean {
  if (method === "GET" || method === "HEAD") return false;
  return /^\/api\/(properties|bookings|admin\/(properties|users))(\/|$)/.test(pathname);
}
