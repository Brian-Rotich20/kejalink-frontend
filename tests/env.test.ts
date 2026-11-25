import { describe, expect, it } from "vitest";
import { DEFAULT_API_INTERNAL_URL, parseServerEnv } from "@/lib/env/server";

describe("server env", () => {
  it("defaults API_INTERNAL_URL to the Render API", () => {
    expect(parseServerEnv({}).API_INTERNAL_URL).toBe(DEFAULT_API_INTERNAL_URL);
  });

  it("treats blanks as unset and strips trailing slashes", () => {
    expect(parseServerEnv({ API_INTERNAL_URL: "  " }).API_INTERNAL_URL).toBe(DEFAULT_API_INTERNAL_URL);
    expect(parseServerEnv({ API_INTERNAL_URL: "http://127.0.0.1:5000/" }).API_INTERNAL_URL).toBe(
      "http://127.0.0.1:5000",
    );
  });

  it("rejects a non-http URL without echoing it", () => {
    const bad = "ftp://secret-host.example";
    expect(() => parseServerEnv({ API_INTERNAL_URL: bad })).toThrow(/API_INTERNAL_URL/);
    try {
      parseServerEnv({ API_INTERNAL_URL: bad });
    } catch (error) {
      expect(String(error)).not.toContain("secret-host");
    }
  });
});
