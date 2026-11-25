import {
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server";
import { PROPERTY_TYPES } from "@/lib/kenya";

export const SORTS = ["newest", "price_asc", "price_desc"] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABEL: Record<Sort, string> = {
  newest: "Newest first",
  price_asc: "Cheapest first",
  price_desc: "Priciest first",
};

export const PAGE_SIZE = 12;

/**
 * Discovery filters, as they appear in the URL (shareable, back-button safe).
 * Shared by the server page (initial render) and the client (nuqs).
 */
export const filterParsers = {
  q: parseAsString.withDefault(""),
  county: parseAsString.withDefault(""),
  area: parseAsString.withDefault(""),
  type: parseAsStringLiteral(PROPERTY_TYPES),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  bedrooms: parseAsInteger,
  available: parseAsBoolean,
  sort: parseAsStringLiteral(SORTS).withDefault("newest"),
  page: parseAsInteger.withDefault(1),
};

export type Filters = inferParserType<typeof filterParsers>;

export const serializeFilters = createSerializer(filterParsers, { clearOnDefault: true });

const clampInt = (value: number | null, min: number, max: number): number | null =>
  value === null || !Number.isFinite(value) ? null : Math.min(Math.max(Math.trunc(value), min), max);

/** Clean the raw URL values into something the API accepts (never a 422 from a hand-edited URL). */
export function normaliseFilters(raw: Filters): Filters {
  let minPrice = clampInt(raw.minPrice, 0, 100_000_000);
  let maxPrice = clampInt(raw.maxPrice, 0, 100_000_000);
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice)
    [minPrice, maxPrice] = [maxPrice, minPrice];
  return {
    q: raw.q.trim().slice(0, 100),
    county: raw.county.trim().slice(0, 100),
    area: raw.area.trim().slice(0, 150),
    type: raw.type,
    minPrice,
    maxPrice,
    bedrooms: clampInt(raw.bedrooms, 0, 50),
    available: raw.available,
    sort: raw.sort,
    page: Math.max(1, clampInt(raw.page, 1, 10_000) ?? 1),
  };
}

/** The API query for a set of filters (`/api/properties?...`). */
export function toApiQuery(
  filters: Filters,
  limit = PAGE_SIZE,
): Record<string, string | number | boolean | undefined> {
  return {
    q: filters.q || undefined,
    county: filters.county || undefined,
    area: filters.area || undefined,
    propertyType: filters.type ?? undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    bedrooms: filters.bedrooms ?? undefined,
    available: filters.available ?? undefined,
    sort: filters.sort === "newest" ? undefined : filters.sort,
    page: filters.page > 1 ? filters.page : undefined,
    limit,
  };
}

/** How many narrowing filters are on (sort and page are not filters). */
export function activeFilterCount(filters: Filters): number {
  return [
    filters.q,
    filters.county,
    filters.area,
    filters.type,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.available,
  ].filter((v) => v !== null && v !== "" && v !== undefined).length;
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  county: "",
  area: "",
  type: null,
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  available: null,
  sort: "newest",
  page: 1,
};
