import { apiBase } from "./client";
import { parseEnvelope } from "./envelope";
import { ApiError, FRIENDLY, NETWORK_ERROR } from "./errors";
import { type PropertyImage, propertyImage } from "./schemas/property";

/**
 * Upload one photo with progress (fetch has no upload progress), through the same-origin proxy.
 * Multipart field `file`, one file per request, as the API requires.
 */
export function uploadPhoto(
  propertyId: string,
  blob: Blob,
  filename: string,
  { onProgress, signal }: { onProgress?: (fraction: number) => void; signal?: AbortSignal } = {},
): Promise<PropertyImage> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiBase()}/api/properties/${encodeURIComponent(propertyId)}/uploads`);
    xhr.withCredentials = true;
    xhr.setRequestHeader("accept", "application/json");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        body = null;
      }
      const headers = new Headers();
      const retryAfter = xhr.getResponseHeader("retry-after");
      if (retryAfter) headers.set("retry-after", retryAfter);
      try {
        resolve(parseEnvelope(xhr.status, body, headers, propertyImage).data);
      } catch (error) {
        reject(error);
      }
    };
    xhr.onerror = () =>
      reject(
        new ApiError({ status: 0, code: NETWORK_ERROR, message: FRIENDLY[NETWORK_ERROR] ?? "Network error" }),
      );
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    if (signal) {
      if (signal.aborted) {
        reject(new DOMException("Upload cancelled", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    const form = new FormData();
    form.append("file", blob, filename);
    xhr.send(form);
  });
}
