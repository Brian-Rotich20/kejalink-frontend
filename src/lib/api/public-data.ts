import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { type Filters, PAGE_SIZE, toApiQuery } from "@/lib/filters";
import { propertyDetail, propertyListItem } from "./schemas/property";
import { publicGet } from "./server";

/**
 * Anonymous, cached reads. Called at request time only (from dynamic segments or after
 * `connection()`), never during `next build`, so a sleeping API can't fail a build.
 * Errors are thrown (and so never cached); callers render a calm fallback.
 */

/** Short lifetime: availability must stay close to the truth. */
const LISTING_LIFE = { stale: 30, revalidate: 30, expire: 300 } as const;

export async function getNewestListings(limit = 6) {
  "use cache";
  cacheLife(LISTING_LIFE);
  cacheTag("properties");
  return publicGet("/properties", z.array(propertyListItem), { limit, sort: "newest" });
}

export async function searchListings(filters: Filters) {
  "use cache";
  cacheLife(LISTING_LIFE);
  cacheTag("properties");
  return publicGet("/properties", z.array(propertyListItem), toApiQuery(filters, PAGE_SIZE));
}

export async function getPublicProperty(id: string) {
  "use cache";
  cacheLife(LISTING_LIFE);
  cacheTag(`property:${id}`);
  return publicGet(`/properties/${encodeURIComponent(id)}`, propertyDetail);
}

/** Every public listing id + updatedAt for the sitemap (bounded). */
export async function getSitemapListings(maxPages = 20) {
  "use cache";
  cacheLife("hours");
  cacheTag("properties");
  const items: { id: string; createdAt: string }[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const { data, meta } = await publicGet("/properties", z.array(propertyListItem), { page, limit: 50 });
    items.push(...data.map(({ id, createdAt }) => ({ id, createdAt })));
    if (!meta || page >= meta.totalPages) break;
  }
  return items;
}

export const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
