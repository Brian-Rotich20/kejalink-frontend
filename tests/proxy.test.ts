import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildUpstreamHeaders, clientIp, forward } from "@/lib/proxy/forward";

type Seen = { method: string; url: string; headers: IncomingMessage["headers"]; body: Buffer };

let server: Server;
let upstream: string;
let last: Seen | null = null;

beforeAll(async () => {
  server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      last = {
        method: req.method ?? "",
        url: req.url ?? "",
        headers: req.headers,
        body: Buffer.concat(chunks),
      };
      if (req.url?.startsWith("/api/auth/sign-in")) {
        res.setHeader("set-cookie", [
          "better-auth.session_token=abc; Path=/; HttpOnly; SameSite=Lax",
          "better-auth.session_data=xyz; Path=/; HttpOnly; Expires=Wed, 02 Dec 2026 10:00:00 GMT",
        ]);
        res.setHeader("content-type", "application/json");
        res.setHeader("access-control-allow-origin", "https://site.example");
        res.end(JSON.stringify({ token: "t", user: { id: "u1" } }));
        return;
      }
      if (req.url?.startsWith("/api/redirect")) {
        res.statusCode = 302;
        res.setHeader("location", `${upstream}/api/elsewhere?x=1`);
        res.end();
        return;
      }
      if (req.url?.startsWith("/api/slow")) {
        setTimeout(() => res.end("late"), 500);
        return;
      }
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ success: true, data: { echo: req.url } }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  upstream = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const SITE = "https://site.example";
const opts = (extra: Partial<Parameters<typeof forward>[1]> = {}) => ({
  upstream,
  timeoutMs: 5000,
  ...extra,
});

describe("API proxy", () => {
  it("forwards path and query, and returns status and body", async () => {
    const res = await forward(new Request(`${SITE}/api/properties?county=Nairobi&page=2`), opts());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: { echo: "/api/properties?county=Nairobi&page=2" },
    });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("passes back every Set-Cookie separately (no comma-joining)", async () => {
    const res = await forward(
      new Request(`${SITE}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: SITE },
        body: JSON.stringify({ email: "a@b.test", password: "x" }),
      }),
      opts(),
    );
    const cookies = res.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toMatch(/^better-auth\.session_token=abc/);
    expect(cookies[1]).toContain("Expires=Wed, 02 Dec 2026 10:00:00 GMT");
    // CORS headers from the API are meaningless same-origin and are stripped.
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("streams request bodies through untouched, multipart included", async () => {
    const form = new FormData();
    const bytes = new Uint8Array(256 * 1024).map((_, i) => i % 251);
    form.append("file", new Blob([bytes], { type: "image/webp" }), "photo.webp");
    const req = new Request(`${SITE}/api/properties/p1/uploads`, { method: "POST", body: form });
    const res = await forward(req, opts());
    expect(res.status).toBe(200);
    expect(last?.method).toBe("POST");
    expect(last?.headers["content-type"]).toMatch(/^multipart\/form-data; boundary=/);
    expect(last?.body.includes(Buffer.from(bytes.subarray(0, 4096)))).toBe(true);
    expect(last?.body.length).toBeGreaterThan(bytes.length);
  });

  it("forwards only the allow-listed headers and drops host/content-length", async () => {
    await forward(
      new Request(`${SITE}/api/users/me`, {
        headers: {
          cookie: "better-auth.session_token=abc",
          origin: SITE,
          "user-agent": "UA/1",
          "accept-language": "en-KE",
          authorization: "Bearer leak",
          "x-kejalink-client-ip": "6.6.6.6",
          "x-real-ip": "102.0.2.7",
          "x-forwarded-for": "102.0.2.7, 10.0.0.1",
        },
      }),
      opts(),
    );
    const h = last?.headers ?? {};
    expect(h.cookie).toBe("better-auth.session_token=abc");
    expect(h.origin).toBe(SITE);
    expect(h["user-agent"]).toBe("UA/1");
    expect(h["accept-language"]).toBe("en-KE");
    expect(h.authorization).toBeUndefined();
    expect(h["x-kejalink-client-ip"]).toBeUndefined();
    expect(h["x-forwarded-for"]).toBe("102.0.2.7");
    expect(h.host).toBe(new URL(upstream).host);
  });

  it("rewrites the Origin of same-origin requests only when configured", () => {
    const sameSite = new Request("https://preview-abc.vercel.app/api/bookings", {
      method: "POST",
      headers: { origin: "https://preview-abc.vercel.app", host: "preview-abc.vercel.app" },
    });
    expect(buildUpstreamHeaders(sameSite, opts()).get("origin")).toBe("https://preview-abc.vercel.app");
    expect(
      buildUpstreamHeaders(sameSite, opts({ forwardedOrigin: "https://kejalink.app" })).get("origin"),
    ).toBe("https://kejalink.app");
    const crossSite = new Request("https://preview-abc.vercel.app/api/bookings", {
      method: "POST",
      headers: { origin: "https://evil.example", host: "preview-abc.vercel.app" },
    });
    expect(
      buildUpstreamHeaders(crossSite, opts({ forwardedOrigin: "https://kejalink.app" })).get("origin"),
    ).toBe("https://evil.example");
  });

  it("does not follow redirects and keeps the browser on this site", async () => {
    const res = await forward(new Request(`${SITE}/api/redirect`), opts());
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/api/elsewhere?x=1");
  });

  it("answers 502 when the API is unreachable and 504 on timeout, in the app envelope", async () => {
    const down = await forward(new Request(`${SITE}/api/health`), opts({ upstream: "http://127.0.0.1:1" }));
    expect(down.status).toBe(502);
    expect((await down.json()).error.code).toBe("NETWORK_ERROR");

    const slow = await forward(new Request(`${SITE}/api/slow`), opts({ timeoutMs: 100 }));
    expect(slow.status).toBe(504);
    expect((await slow.json()).error.code).toBe("TIMEOUT");
  });

  it("refuses anything outside /api/", async () => {
    const res = await forward(new Request(`${SITE}/etc/passwd`), opts());
    expect(res.status).toBe(404);
  });

  it("reads the client IP from the edge headers", () => {
    expect(clientIp(new Headers({ "x-real-ip": "1.2.3.4" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-forwarded-for": "5.6.7.8, 9.9.9.9" }))).toBe("5.6.7.8");
    expect(clientIp(new Headers())).toBeNull();
  });
});
