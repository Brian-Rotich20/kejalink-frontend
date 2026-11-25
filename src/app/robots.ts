import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env/public";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/seeker", "/tenant", "/admin", "/login", "/suspended", "/_design", "/healthz"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
