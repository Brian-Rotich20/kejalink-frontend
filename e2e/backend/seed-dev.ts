/**
 * SAMPLE LISTINGS — local development only. Creates a few authored listings on the LOCAL e2e API so the UI
 * can be reviewed with content. Refuses any API that is not on localhost. Never bundled; never
 * run against production.
 *
 *   npm run e2e:seed            (expects `npm run e2e:backend` to be running)
 */
const api = process.env.E2E_API_URL ?? "http://127.0.0.1:5100";
const appOrigin = process.env.E2E_ORIGIN ?? "http://localhost:3000";

const host = new URL(api).hostname;
if (host !== "127.0.0.1" && host !== "localhost") {
  console.error(`Refusing to seed a non-local API (${host}).`);
  process.exit(1);
}

type Json = Record<string, unknown>;

async function call(path: string, init: { method?: string; body?: Json | FormData; cookie?: string } = {}) {
  const headers: Record<string, string> = { origin: appOrigin };
  if (init.cookie) headers.cookie = init.cookie;
  if (init.body && !(init.body instanceof FormData)) headers["content-type"] = "application/json";
  const res = await fetch(`${api}/api${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body instanceof FormData ? init.body : init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return { res, body: text ? (JSON.parse(text) as Json) : {} };
}

async function signUp(name: string, email: string, role: "TENANT" | "SEEKER") {
  const { res } = await call("/auth/sign-up/email", {
    method: "POST",
    body: { name, email, password: "devpassword123", role },
  }).catch(async () =>
    call("/auth/sign-in/email", { method: "POST", body: { email, password: "devpassword123" } }),
  );
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";", 1)[0])
    .join("; ");
  return cookie;
}

const LISTINGS = [
  ["Bedsitter two minutes from the KU main gate", "BEDSITTER", 9500, 0, 1, "Kiambu", "Kahawa Wendani", true],
  ["One-bedroom with a balcony off Argwings Kodhek", "APARTMENT", 28000, 1, 1, "Nairobi", "Kilimani", true],
  ["Single room for a student, shared kitchen", "ROOM", 6500, 0, 1, "Nairobi", "Ngara", false],
  ["Studio with a fitted kitchen near Yaya Centre", "STUDIO", 22000, 0, 1, "Nairobi", "Kilimani", true],
  ["Two-bedroom in a gated compound", "APARTMENT", 42000, 2, 2, "Nairobi", "South B", true],
  ["Bedsitter with water 24/7, near the stage", "BEDSITTER", 8000, 0, 1, "Nairobi", "Roysambu", true],
] as const;

/**
 * Authored sample listings for local review only, labelled as samples in their descriptions.
 * No photos: stand-in pictures of other places would misrepresent a listing; the designed
 * "No photo yet" state shows instead. One sample is marked taken to show that state.
 */
async function main() {
  const cookie = await signUp("Sample Lister", "sample-lister@e2e.kejalink.test", "TENANT");
  for (const [title, propertyType, priceAmount, bedrooms, bathrooms, county, area, available] of LISTINGS) {
    const { body } = await call("/properties", {
      method: "POST",
      cookie,
      body: {
        title,
        description: `Sample listing for local development. ${title}. Water and token electricity, secure compound, close to the matatu stage and shops.`,
        propertyType,
        priceAmount,
        bedrooms,
        bathrooms,
        county,
        area,
        amenities: ["Water 24/7", "Token electricity", "Security guard"],
      },
    });
    const id = (body.data as { id: string }).id;
    if (!available)
      await call(`/properties/${id}`, { method: "PATCH", cookie, body: { isAvailable: false } });
    console.log(`seeded ${area}: ${title}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
export {};
