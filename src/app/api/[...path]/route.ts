import { revalidateTag } from "next/cache";
import { serverEnv } from "@/lib/env/server";
import { affectsListings, forward } from "@/lib/proxy/forward";

/** Render cold starts take up to ~60 s; give the function room to wait for one. */
export const maxDuration = 60;

const options = () => ({
  upstream: serverEnv.API_INTERNAL_URL,
  timeoutMs: serverEnv.API_TIMEOUT_MS,
  forwardedOrigin: serverEnv.API_FORWARDED_ORIGIN,
});

async function handle(request: Request) {
  const response = await forward(request, options());
  // A successful write can change a listing's details or availability: drop cached listing
  // reads immediately (no stale window) so public pages never show a taken place as free.
  if (response.ok && affectsListings(request.method, new URL(request.url).pathname)) {
    revalidateTag("properties", { expire: 0 });
  }
  return response;
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
