/**
 * DEV FIXTURES — local development only. Creates a few listings on the LOCAL e2e API so the UI
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
  ["Bedsitter two minutes from KU main gate", "BEDSITTER", 9500, 0, 1, "Kiambu", "Kahawa Wendani"],
  ["Spacious one-bedroom with balcony", "APARTMENT", 28000, 1, 1, "Nairobi", "Kilimani"],
  ["Single room for a student, shared kitchen", "ROOM", 6500, 0, 1, "Nairobi", "Ngara"],
  ["Studio with fitted kitchen near Yaya", "STUDIO", 22000, 0, 1, "Nairobi", "Kilimani"],
  ["Two-bedroom in a gated compound", "APARTMENT", 42000, 2, 2, "Nairobi", "South B"],
  ["Bedsitter with 24/7 water, near the stage", "BEDSITTER", 8000, 0, 1, "Nairobi", "Roysambu"],
  ["Three-bedroom house with parking", "HOUSE", 65000, 3, 2, "Kiambu", "Ruaka"],
  ["One-bedroom near UoN Chiromo", "APARTMENT", 25000, 1, 1, "Nairobi", "Westlands"],
] as const;

async function main() {
  const cookie = await signUp("Dev Fixture Lister", "dev-lister@e2e.kejalink.test", "TENANT");
  const photo = new Blob(
    [await (await fetch("https://res.cloudinary.com/demo/image/upload/w_600/sample.jpg")).arrayBuffer()],
    {
      type: "image/jpeg",
    },
  );
  for (const [title, propertyType, priceAmount, bedrooms, bathrooms, county, area] of LISTINGS) {
    const { body } = await call("/properties", {
      method: "POST",
      cookie,
      body: {
        title,
        description: `DEV FIXTURE. ${title}. Water and token electricity, secure compound, close to matatu stage and shops.`,
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
    for (let i = 0; i < 2; i += 1) {
      const form = new FormData();
      form.append("file", photo, "photo.jpg");
      await call(`/properties/${id}/uploads`, { method: "POST", cookie, body: form });
    }
    console.log(`seeded ${area}: ${title}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
export {};
