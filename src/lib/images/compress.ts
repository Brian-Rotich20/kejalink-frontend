/**
 * Client-side photo preparation. Phone photos are often 4–12 MB; the API takes ≤ 5 MB and
 * Vercel functions cap request bodies at ~4.5 MB, so every photo is resized (long edge ≤ 1600 px)
 * and re-encoded (WebP, else JPEG) to stay under TARGET_BYTES before upload.
 */

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AcceptedType = (typeof ACCEPTED_TYPES)[number];

export const MAX_EDGE = 1600;
export const TARGET_BYTES = 3.5 * 1024 * 1024;
/** The API's own limit, for files we could not shrink. */
export const SERVER_MAX_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTOS = 10;

export const isAcceptedType = (type: string): type is AcceptedType =>
  (ACCEPTED_TYPES as readonly string[]).includes(type);

/** Scale (w, h) so the longer edge is at most `maxEdge`, keeping the aspect ratio. Never upscales. */
export function fitWithin(
  width: number,
  height: number,
  maxEdge = MAX_EDGE,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Qualities tried in order until the encoded photo fits under the target. */
export const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.5] as const;

export type Encoder = (quality: number) => Promise<Blob | null>;

/** Encode at decreasing quality until under `targetBytes`; returns the smallest result tried. */
export async function encodeUnder(encode: Encoder, targetBytes = TARGET_BYTES): Promise<Blob | null> {
  let smallest: Blob | null = null;
  for (const quality of QUALITY_STEPS) {
    const blob = await encode(quality);
    if (!blob) continue;
    if (!smallest || blob.size < smallest.size) smallest = blob;
    if (blob.size <= targetBytes) return blob;
  }
  return smallest;
}

export type PreparedPhoto = {
  blob: Blob;
  type: AcceptedType;
  width: number;
  height: number;
  originalBytes: number;
};

export class PhotoError extends Error {
  constructor(
    message: string,
    readonly code: "TYPE" | "DECODE" | "TOO_LARGE",
  ) {
    super(message);
    this.name = "PhotoError";
  }
}

/** Resize + re-encode in the browser. Applies EXIF orientation so portrait photos stay upright. */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (!isAcceptedType(file.type)) {
    throw new PhotoError("Use a JPEG, PNG or WebP photo.", "TYPE");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new PhotoError("This photo couldn't be read. Try another one.", "DECODE");
  }
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new PhotoError("This photo couldn't be read. Try another one.", "DECODE");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string) => (quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), type, quality));

  // WebP where the browser can encode it (most Android/Chrome); JPEG otherwise (older Safari).
  let blob = await encodeUnder(toBlob("image/webp"));
  let type: AcceptedType = "image/webp";
  if (!blob || blob.type !== "image/webp") {
    blob = await encodeUnder(toBlob("image/jpeg"));
    type = "image/jpeg";
  }
  if (!blob) throw new PhotoError("This photo couldn't be prepared. Try another one.", "DECODE");
  if (blob.size > SERVER_MAX_BYTES)
    throw new PhotoError("This photo is too big even after shrinking it.", "TOO_LARGE");
  return { blob, type, width, height, originalBytes: file.size };
}

export const formatBytes = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
