import {
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server";
import { AMENITY_FILTERS, PROPERTY_TYPES } from "@/lib/kenya";

export const SORTS = ["newest", "price_asc", "price_desc"] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABEL: Record<Sort, string> = {
  newest: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

/** List beside a map (reference R1) or a three-column grid (reference R3). */
export const VIEWS = ["map", "grid"] as const;
export type View = (typeof VIEWS)[number];

export const PAGE_SIZE = 12;

/**
 * Discovery filters, as they appear in the URL (shareable, back-button safe).
 * Shared by the server page (initial render) and the client (nuqs).
 * `bedrooms` and `baths` are minimums ("2+"), matching the steppers.
 */
export const filterParsers = {
  q: parseAsString.withDefault(""),
  county: parseAsString.withDefault(""),
  area: parseAsString.withDefault(""),
  type: parseAsStringLiteral(PROPERTY_TYPES),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  bedrooms: parseAsInteger,
  baths: parseAsInteger,
  amenities: parseAsArrayOf(parseAsString).withDefault([]),
  available: parseAsBoolean,
  north: parseAsFloat,
  south: parseAsFloat,
  east: parseAsFloat,
  west: parseAsFloat,
  sort: parseAsStringLiteral(SORTS).withDefault("newest"),
  view: parseAsStringLiteral(VIEWS).withDefault("map"),
  page: parseAsInteger.withDefault(1),
};

export type Filters = inferParserType<typeof filterParsers>;

export const serializeFilters = createSerializer(filterParsers, { clearOnDefault: true });

const clampInt = (value: number | null, min: number, max: number): number | null =>
  value === null || !Number.isFinite(value) ? null : Math.min(Math.max(Math.trunc(value), min), max);

const clampFloat = (value: number | null, min: number, max: number): number | null =>
  value === null || !Number.isFinite(value) ? null : Math.min(Math.max(value, min), max);

/** Map bounds are kept only as a complete, ordered box. */
function normaliseBounds(raw: Filters): Pick<Filters, "north" | "south" | "east" | "west"> {
  const north = clampFloat(raw.north, -90, 90);
  const south = clampFloat(raw.south, -90, 90);
  const east = clampFloat(raw.east, -180, 180);
  const west = clampFloat(raw.west, -180, 180);
  if (north === null || south === null || east === null || west === null || south > north) {
    return { north: null, south: null, east: null, west: null };
  }
  return { north, south, east, west };
}

const KNOWN_AMENITIES = new Set<string>(AMENITY_FILTERS.map((a) => a.toLowerCase()));

/** Clean the raw URL values into something the API accepts (never a 422 from a hand-edited URL). */
export function normaliseFilters(raw: Filters): Filters {
  let minPrice = clampInt(raw.minPrice, 0, 100_000_000);
  let maxPrice = clampInt(raw.maxPrice, 0, 100_000_000);
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
  return {
    q: raw.q.trim().slice(0, 100),
    county: raw.county.trim().slice(0, 100),
    area: raw.area.trim().slice(0, 150),
    type: raw.type,
    minPrice,
    maxPrice,
    bedrooms: clampInt(raw.bedrooms, 1, 50),
    baths: clampInt(raw.baths, 1, 50),
    amenities: [...new Set(raw.amenities.map((a) => a.trim().toLowerCase()))]
      .filter((a) => KNOWN_AMENITIES.has(a))
      .slice(0, 10),
    available: raw.available,
    ...normaliseBounds(raw),
    sort: raw.sort,
    view: raw.view,
    page: Math.max(1, clampInt(raw.page, 1, 10_000) ?? 1),
  };
}

/** The API query for a set of filters (`/api/properties?...`). */
export function toApiQuery(
  filters: Filters,
  limit = PAGE_SIZE,
): Record<string, string | number | boolean | undefined> {
  const bounds =
    filters.north !== null && filters.south !== null && filters.east !== null && filters.west !== null
      ? { north: filters.north, south: filters.south, east: filters.east, west: filters.west }
      : {};
  return {
    q: filters.q || undefined,
    county: filters.county || undefined,
    area: filters.area || undefined,
    propertyType: filters.type ?? undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    minBedrooms: filters.bedrooms ?? undefined,
    minBathrooms: filters.baths ?? undefined,
    amenities: filters.amenities.length > 0 ? filters.amenities.join(",") : undefined,
    available: filters.available ?? undefined,
    ...bounds,
    sort: filters.sort === "newest" ? undefined : filters.sort,
    page: filters.page > 1 ? filters.page : undefined,
    limit,
  };
}

/** How many narrowing filters are on (sort, view and page are not filters). */
export function activeFilterCount(filters: Filters): number {
  return (
    [
      filters.q,
      filters.county,
      filters.area,
      filters.type,
      filters.minPrice ?? filters.maxPrice,
      filters.bedrooms,
      filters.baths,
      filters.available,
      filters.north,
    ].filter((v) => v !== null && v !== "" && v !== undefined).length + filters.amenities.length
  );
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  county: "",
  area: "",
  type: null,
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  baths: null,
  amenities: [],
  available: null,
  north: null,
  south: null,
  east: null,
  west: null,
  sort: "newest",
  view: "map",
  page: 1,
};
