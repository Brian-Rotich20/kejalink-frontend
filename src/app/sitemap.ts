import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getSitemapListings } from "@/lib/api/public-data";
import { siteUrl } from "@/lib/env/public";

/** Built at request time (never during `next build`), and still valid when the API is down. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const now = new Date();
  const fixed: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/properties`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/register`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.1 },
  ];
  try {
    const listings = await getSitemapListings();
    return [
      ...fixed,
      ...listings.map(({ id, createdAt }) => ({
        url: `${siteUrl}/properties/${id}`,
        lastModified: new Date(createdAt),
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return fixed;
  }
}
