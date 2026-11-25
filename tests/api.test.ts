import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { apiFetch, buildQuery } from "@/lib/api/client";
import { parseEnvelope } from "@/lib/api/envelope";
import { ApiError, fromAuthError, isRetryable, messageFor } from "@/lib/api/errors";
import { retryDelay, sessionProblem, shouldRetryQuery } from "@/lib/api/query-client";
import { withRetry } from "@/lib/api/retry";
import { propertyListItem } from "@/lib/api/schemas";
import { landingFor, safeNext } from "@/lib/auth/roles";
import { cropTo, sized, withTransform } from "@/lib/cloudinary";

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

const item = {
  id: "8c1f8f3e-5a6b-4c3d-9e2f-1a2b3c4d5e6f",
  tenantId: "t1",
  title: "Bedsitter near KU",
  propertyType: "BEDSITTER",
  priceAmount: 9500,
  priceCurrency: "KES",
  bedrooms: 0,
  bathrooms: 1,
  county: "Kiambu",
  area: "Kahawa Wendani",
  isAvailable: true,
  primaryImageUrl: null,
  createdAt: "2026-11-20T08:00:00.000Z",
};

afterEach(() => vi.unstubAllGlobals());

describe("envelope parsing", () => {
  it("unwraps data and meta and validates with the resource schema", () => {
    const out = parseEnvelope(
      200,
      { success: true, data: [item], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } },
      new Headers(),
      z.array(propertyListItem),
    );
    expect(out.data[0]?.area).toBe("Kahawa Wendani");
    expect(out.meta?.total).toBe(1);
  });

  it("turns an error envelope into a typed ApiError with field details", () => {
    const body = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: [{ field: "priceAmount", message: "Too small" }],
      },
    };
    try {
      parseEnvelope(422, body, new Headers(), z.unknown());
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const e = error as ApiError;
      expect(e.status).toBe(422);
      expect(e.code).toBe("VALIDATION_ERROR");
      expect(e.fieldError("priceAmount")).toBe("Too small");
    }
  });

  it("rejects a success body that fails validation", () => {
    expect(() =>
      parseEnvelope(200, { success: true, data: { nope: 1 } }, new Headers(), propertyListItem),
    ).toThrow(/failed validation/);
  });

  it("maps non-envelope failures by status and reads Retry-After", () => {
    try {
      parseEnvelope(429, null, new Headers({ "retry-after": "17" }), z.unknown());
    } catch (error) {
      const e = error as ApiError;
      expect(e.code).toBe("TOO_MANY_REQUESTS");
      expect(e.retryAfter).toBe(17);
      expect(messageFor(e)).toMatch(/Wait a moment/);
    }
  });
});

describe("apiFetch", () => {
  it("calls the same-origin proxy with credentials and a JSON body", async () => {
    const fetchMock = vi.fn(async () => json(201, { success: true, data: { ok: true } }));
    vi.stubGlobal("fetch", fetchMock);
    const out = await apiFetch("/bookings", {
      method: "POST",
      body: { propertyId: item.id },
      schema: z.object({ ok: z.boolean() }),
    });
    expect(out.data.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/bookings");
    expect(init.credentials).toBe("include");
    expect(init.body).toBe(JSON.stringify({ propertyId: item.id }));
  });

  it("sends no body at all when none is given (reject without a reason)", async () => {
    const fetchMock = vi.fn(async () => json(200, { success: true, data: {} }));
    vi.stubGlobal("fetch", fetchMock);
    await apiFetch("/bookings/x/reject", { method: "PATCH", schema: z.object({}) });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.body).toBeUndefined();
    expect((init.headers as Record<string, string>)["content-type"]).toBeUndefined();
  });

  it("reports a network failure as a retryable NETWORK_ERROR", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))),
    );
    await expect(apiFetch("/properties", { schema: z.unknown() })).rejects.toMatchObject({
      status: 0,
      code: "NETWORK_ERROR",
    });
  });

  it("builds query strings without empty values", () => {
    expect(buildQuery({ q: "ku", county: "", page: 2, available: true, area: undefined })).toBe(
      "?q=ku&page=2&available=true",
    );
    expect(buildQuery({})).toBe("");
  });
});

describe("retry and backoff", () => {
  it("retries cold-start failures (network, 502/503/504) but never 4xx", () => {
    expect(isRetryable(new ApiError({ status: 0, code: "NETWORK_ERROR", message: "" }))).toBe(true);
    expect(isRetryable(new ApiError({ status: 503, code: "SERVICE_UNAVAILABLE", message: "" }))).toBe(true);
    expect(isRetryable(new ApiError({ status: 404, code: "NOT_FOUND", message: "" }))).toBe(false);
    expect(isRetryable(new ApiError({ status: 429, code: "TOO_MANY_REQUESTS", message: "" }))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError({ status: 502, code: "X", message: "" }))).toBe(true);
    expect(shouldRetryQuery(2, new ApiError({ status: 502, code: "X", message: "" }))).toBe(false);
  });

  it("backs off exponentially with a cap", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(retryDelay(0)).toBe(800);
    expect(retryDelay(1)).toBe(2400);
    expect(retryDelay(5)).toBe(8000);
  });

  it("withRetry: succeeds after two cold-start failures, sleeping between them", async () => {
    const sleeps: number[] = [];
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls += 1;
        if (calls < 3) throw new ApiError({ status: 503, code: "SERVICE_UNAVAILABLE", message: "" });
        return "ok";
      },
      { sleep: async (ms) => void sleeps.push(ms), delay: (a) => (a + 1) * 100 },
    );
    expect(result).toBe("ok");
    expect(calls).toBe(3);
    expect(sleeps).toEqual([100, 200]);
  });

  it("withRetry: gives up after the retry budget and does not retry 4xx", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new ApiError({ status: 0, code: "NETWORK_ERROR", message: "" });
        },
        { sleep: async () => {} },
      ),
    ).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    expect(calls).toBe(3);

    calls = 0;
    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new ApiError({ status: 409, code: "DUPLICATE_BOOKING", message: "" });
        },
        { sleep: async () => {} },
      ),
    ).rejects.toMatchObject({ code: "DUPLICATE_BOOKING" });
    expect(calls).toBe(1);
  });
});

describe("error mapping", () => {
  it("gives friendly copy for known codes and hides 5xx details", () => {
    expect(messageFor(new ApiError({ status: 409, code: "DUPLICATE_BOOKING", message: "x" }))).toMatch(
      /already have a pending request/,
    );
    expect(messageFor(new ApiError({ status: 500, code: "WEIRD", message: "stack trace" }))).not.toMatch(
      /stack/,
    );
    expect(messageFor(new Error("boom"))).toMatch(/Something went wrong/);
  });

  it("normalises Better Auth's native errors", () => {
    expect(
      fromAuthError({ status: 401, code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid" }).message,
    ).toMatch(/don't match/);
    expect(fromAuthError({ status: 422, code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" }).message).toMatch(
      /already exists/,
    );
    expect(fromAuthError({ status: 403, message: "This account is suspended or banned" }).code).toBe(
      "ACCOUNT_SUSPENDED",
    );
    expect(fromAuthError({ status: 429 }).code).toBe("TOO_MANY_REQUESTS");
    expect(fromAuthError({ status: 0 }).code).toBe("NETWORK_ERROR");
    expect(fromAuthError({ status: 500, message: "db exploded" }).message).not.toMatch(/db/);
  });

  it("classifies session problems", () => {
    expect(sessionProblem(new ApiError({ status: 401, code: "UNAUTHORIZED", message: "" }))).toBe(
      "signed-out",
    );
    expect(sessionProblem(new ApiError({ status: 403, code: "ACCOUNT_SUSPENDED", message: "" }))).toBe(
      "suspended",
    );
    expect(sessionProblem(new ApiError({ status: 403, code: "FORBIDDEN", message: "" }))).toBeNull();
  });
});

describe("post-login destinations", () => {
  it("only allows same-site relative paths", () => {
    expect(safeNext("/properties?county=Nairobi")).toBe("/properties?county=Nairobi");
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("/\\evil.example")).toBe("/");
    expect(safeNext(null, "/seeker")).toBe("/seeker");
  });

  it("sends each role home instead of into another role's area", () => {
    expect(landingFor("SEEKER", "/tenant/properties")).toBe("/seeker");
    expect(landingFor("TENANT", "/tenant/properties")).toBe("/tenant/properties");
    expect(landingFor("SEEKER", "/properties/abc")).toBe("/properties/abc");
    expect(landingFor("ADMIN", null)).toBe("/admin");
  });
});

describe("cloudinary", () => {
  const src = "https://res.cloudinary.com/demo/image/upload/v1712345/kejalink/abc.jpg";

  it("inserts transforms after /upload/ and chains after existing ones", () => {
    expect(sized(src, 640)).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640,c_limit/v1712345/kejalink/abc.jpg",
    );
    expect(sized(cropTo(src, "4:3"), 640)).toBe(
      "https://res.cloudinary.com/demo/image/upload/ar_4:3,c_fill,g_auto/f_auto,q_auto,w_640,c_limit/v1712345/kejalink/abc.jpg",
    );
  });

  it("leaves other hosts and non-https URLs alone", () => {
    expect(withTransform("https://example.com/a.jpg", "w_10")).toBe("https://example.com/a.jpg");
    expect(withTransform("http://res.cloudinary.com/demo/image/upload/a.jpg", "w_10")).toBe(
      "http://res.cloudinary.com/demo/image/upload/a.jpg",
    );
  });
});
