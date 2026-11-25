import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";
import {
  formatAmount,
  formatDate,
  formatDateOnly,
  formatKes,
  formatRelative,
  plural,
  todayInNairobi,
} from "@/lib/format";
import { COUNTIES, isCounty, isPropertyType } from "@/lib/kenya";

describe("money", () => {
  it("formats KES with the code, no decimals, plain spaces", () => {
    expect(formatKes(12500)).toBe("KES 12,500");
    expect(formatKes(12500.6)).toBe("KES 12,501");
    expect(formatKes(1_250_000)).toBe("KES 1,250,000");
    expect(formatAmount(45000)).toBe("45,000");
  });
});

describe("dates", () => {
  it("shows date-only strings exactly as written, whatever the time zone", () => {
    expect(formatDateOnly("2026-12-01")).toBe("Tue, 1 Dec 2026");
    expect(formatDateOnly("not-a-date")).toBe("not-a-date");
  });

  it("puts timestamps on the Nairobi calendar", () => {
    // 22:30 UTC on 30 Nov is already 1 Dec in Nairobi (UTC+3).
    expect(formatDate("2026-11-30T22:30:00.000Z")).toBe("1 Dec 2026");
  });

  it("computes today in Nairobi, not in UTC", () => {
    expect(todayInNairobi(new Date("2026-11-30T22:30:00.000Z"))).toBe("2026-12-01");
    expect(todayInNairobi(new Date("2026-11-30T20:59:00.000Z"))).toBe("2026-11-30");
  });

  it("formats relative times", () => {
    const now = new Date("2026-11-25T12:00:00Z");
    expect(formatRelative("2026-11-25T11:59:40Z", now)).toBe("just now");
    expect(formatRelative("2026-11-22T12:00:00Z", now)).toBe("3 days ago");
  });

  it("pluralises", () => {
    expect(plural(1, "place")).toBe("1 place");
    expect(plural(1200, "place")).toBe("1,200 places");
  });
});

describe("kenya constants", () => {
  it("lists all 47 counties, Nairobi first, no duplicates", () => {
    expect(COUNTIES).toHaveLength(47);
    expect(COUNTIES[0]).toBe("Nairobi");
    expect(new Set(COUNTIES).size).toBe(47);
    expect(isCounty("Kiambu")).toBe(true);
    expect(isCounty("Narnia")).toBe(false);
    expect(isPropertyType("BEDSITTER")).toBe(true);
    expect(isPropertyType("CASTLE")).toBe(false);
  });
});

describe("cn", () => {
  it("keeps a colour class next to a fluid type step", () => {
    expect(cn("text-on-board", "text-step-0")).toBe("text-on-board text-step-0");
    expect(cn("text-step-0", "text-step-2")).toBe("text-step-2");
  });
});
