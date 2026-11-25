/** Validate configuration once at server start, so a bad env fails loudly and early. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/env/server");
    await import("./lib/env/public");
  }
}
