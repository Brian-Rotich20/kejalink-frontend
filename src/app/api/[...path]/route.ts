import { serverEnv } from "@/lib/env/server";
import { forward } from "@/lib/proxy/forward";

/** Render cold starts take up to ~60 s; give the function room to wait for one. */
export const maxDuration = 60;

const options = () => ({
  upstream: serverEnv.API_INTERNAL_URL,
  timeoutMs: serverEnv.API_TIMEOUT_MS,
  forwardedOrigin: serverEnv.API_FORWARDED_ORIGIN,
});

const handle = (request: Request) => forward(request, options());

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
