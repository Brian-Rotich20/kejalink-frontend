import { connection } from "next/server";
import { serverEnv } from "@/lib/env/server";

/**
 * Proxy health. `GET /healthz` answers without touching the API; `GET /healthz?upstream=1`
 * also checks the API's liveness endpoint (and so wakes a sleeping Render instance).
 */
export async function GET(request: Request) {
  await connection();
  const checkUpstream = new URL(request.url).searchParams.get("upstream") === "1";
  const body: { status: "ok"; upstream?: "ok" | "unreachable"; upstreamMs?: number } = { status: "ok" };
  if (checkUpstream) {
    const started = Date.now();
    try {
      const res = await fetch(`${serverEnv.API_INTERNAL_URL}/api/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(serverEnv.API_TIMEOUT_MS),
      });
      body.upstream = res.ok ? "ok" : "unreachable";
    } catch {
      body.upstream = "unreachable";
    }
    body.upstreamMs = Date.now() - started;
  }
  return Response.json(body, {
    status: body.upstream === "unreachable" ? 503 : 200,
    headers: { "cache-control": "no-store" },
  });
}
