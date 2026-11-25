import { createLoader } from "nuqs/server";
import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  EMPTY_FILTERS,
  filterParsers,
  normaliseFilters,
  serializeFilters,
  toApiQuery,
} from "@/lib/filters";

const load = createLoader(filterParsers);

describe("discovery filters in the URL", () => {
  it("parses a shared link into typed filters", () => {
    const f = load(
      "?county=Nairobi&area=Kilimani&type=BEDSITTER&maxPrice=15000&available=true&sort=price_asc&page=2",
    );
    expect(f).toMatchObject({
      county: "Nairobi",
      area: "Kilimani",
      type: "BEDSITTER",
      maxPrice: 15000,
      available: true,
      sort: "price_asc",
      page: 2,
    });
  });

  it("ignores junk instead of producing an API 422", () => {
    const f = normaliseFilters(load("?type=CASTLE&maxPrice=abc&sort=random&page=-4&bedrooms=999"));
    expect(f.type).toBeNull();
    expect(f.maxPrice).toBeNull();
    expect(f.sort).toBe("newest");
    expect(f.page).toBe(1);
    expect(f.bedrooms).toBe(50);
  });

  it("swaps an inverted price range rather than failing", () => {
    const f = normaliseFilters({ ...EMPTY_FILTERS, minPrice: 30000, maxPrice: 10000 });
    expect([f.minPrice, f.maxPrice]).toEqual([10000, 30000]);
  });

  it("serialises only what differs from the defaults (clean, shareable URLs)", () => {
    expect(
      serializeFilters("/properties", { ...EMPTY_FILTERS, county: "Kiambu", page: 1, sort: "newest" }),
    ).toBe("/properties?county=Kiambu");
    expect(serializeFilters("/properties", EMPTY_FILTERS)).toBe("/properties");
  });

  it("maps URL names to the API's query names and drops empties", () => {
    const q = toApiQuery({ ...EMPTY_FILTERS, type: "STUDIO", maxPrice: 20000, page: 3 }, 12);
    expect(q).toEqual({
      q: undefined,
      county: undefined,
      area: undefined,
      propertyType: "STUDIO",
      minPrice: undefined,
      maxPrice: 20000,
      bedrooms: undefined,
      available: undefined,
      sort: undefined,
      page: 3,
      limit: 12,
    });
  });

  it("counts narrowing filters but not sort or page", () => {
    expect(activeFilterCount({ ...EMPTY_FILTERS, sort: "price_desc", page: 4 })).toBe(0);
    expect(activeFilterCount({ ...EMPTY_FILTERS, county: "Nairobi", available: true, bedrooms: 0 })).toBe(3);
  });
});
