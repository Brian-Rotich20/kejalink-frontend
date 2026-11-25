/**
 * Cloudinary delivery URLs. Stored listing URLs look like
 *   https://res.cloudinary.com/<cloud>/image/upload/v1712345/kejalink/abc.jpg
 * Transformations go right after `/upload/`; chained steps are separated by `/`.
 */
const HOST = "res.cloudinary.com";

export const isCloudinary = (src: string): boolean => {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === HOST && url.pathname.includes("/upload/");
  } catch {
    return false;
  }
};

const isTransformSegment = (segment: string) => /^[a-z]{1,3}_[^/]+$/.test(segment) && !/^v\d+$/.test(segment);

/** Insert a transformation step after any steps already present, before the version/public id. */
export function withTransform(src: string, transform: string): string {
  if (!isCloudinary(src)) return src;
  const [head, tail = ""] = src.split("/upload/", 2) as [string, string?];
  const segments = tail.split("/");
  let index = 0;
  while (index < segments.length - 1 && isTransformSegment(segments[index] ?? "")) index += 1;
  segments.splice(index, 0, transform);
  return `${head}/upload/${segments.join("/")}`;
}

export type CropAspect = "4:3" | "3:2" | "1:1" | "16:9";

/** Crop to an aspect ratio, keeping the interesting part of the photo (`g_auto`). */
export const cropTo = (src: string, aspect: CropAspect): string =>
  withTransform(src, `ar_${aspect},c_fill,g_auto`);

/** Width-limited, auto format (AVIF/WebP), auto quality. Used by the next/image loader. */
export const sized = (src: string, width: number, quality?: number): string =>
  withTransform(src, `f_auto,q_${quality ?? "auto"},w_${width},c_limit`);
