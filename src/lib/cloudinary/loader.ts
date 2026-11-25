"use client";

import { sized } from "./index";

/**
 * Global next/image loader. Cloudinary does resizing and AVIF/WebP itself, so Vercel's image
 * optimiser (and its quota) is never used. Non-Cloudinary sources (local assets) pass through.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src.startsWith("/")) return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  return sized(src, width, quality);
}
