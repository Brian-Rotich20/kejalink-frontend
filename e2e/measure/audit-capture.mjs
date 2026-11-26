// Visual audit captures: every major route at 360 / 390 / 768 / 1024 / 1440, signed out and as each role.
// Local tooling only. Creates its own accounts and requests through the app's /api proxy (local API only).
// Usage: node e2e/measure/audit-capture.mjs http://localhost:3100 <outDir> <adminEmail> <adminPassword>
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [base, out, adminEmail, adminPassword] = process.argv.slice(2);
if (!/^http:\/\/(localhost|127\.0\.0\.1)/.test(base)) throw new Error("Local app only");
const WIDTHS = [360, 390, 768, 1024, 1440];
const browser = await chromium.launch({ channel: "chrome" });
const stamp = Date.now().toString(36);

async function api(ctx, method, path, body) {
  const res = await ctx.request.fetch(`${base}/api${path}`, {
    method,
    headers: body === undefined ? { origin: base } : { origin: base, "content-type": "application/json" },
    data: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok()) throw new Error(`${method} ${path} → ${res.status()} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function account(role, name) {
  const ctx = await browser.newContext();
  await api(ctx, "POST", "/auth/sign-up/email", {
    name,
    email: `audit-${role.toLowerCase()}-${stamp}@e2e.kejalink.test`,
    password: "audit-password-123",
    role,
  });
  return ctx;
}

// Data: a lister with two listings; a seeker with pending, confirmed and declined requests.
const lister = await account("TENANT", "Wanjiru Kamau");
const mk = (title, area, price, type) =>
  api(lister, "POST", "/properties", {
    title,
    description: `Sample listing for the visual audit. ${title}. Water 24/7, token electricity, secure compound near the stage.`,
    propertyType: type,
    priceAmount: price,
    bedrooms: type === "APARTMENT" ? 1 : 0,
    bathrooms: 1,
    county: "Nairobi",
    area,
    amenities: ["Water 24/7", "Token electricity", "Security guard"],
  }).then((r) => r.data);
const a = await mk("Bedsitter near the Roysambu stage", "Roysambu", 8500, "BEDSITTER");
const b = await mk("One-bedroom off Ngong Road", "Kilimani", 26000, "APARTMENT");
const c = await mk("Studio near Kenyatta Market", "Kilimani", 18000, "STUDIO");

const seeker = await account("SEEKER", "Otieno Wafula");
void (
  await api(seeker, "POST", "/bookings", { propertyId: a.id, message: "Hi, I can view on Saturday morning." })
).data;
const bk2 = (await api(seeker, "POST", "/bookings", { propertyId: b.id, preferredMoveInDate: "2026-12-15" }))
  .data;
const bk3 = (await api(seeker, "POST", "/bookings", { propertyId: c.id })).data;
await api(lister, "PATCH", `/bookings/${bk2.id}/confirm`);
await api(lister, "PATCH", `/bookings/${bk3.id}/reject`, { reason: "Already promised to someone else." });

let admin = null;
if (adminEmail && adminPassword) {
  admin = await browser.newContext();
  await api(admin, "POST", "/auth/sign-in/email", { email: adminEmail, password: adminPassword });
}

const groups = [
  {
    name: "public",
    ctx: null,
    routes: [
      "/",
      "/properties",
      `/properties/${b.id}`,
      "/login",
      "/register",
      "/how-it-works",
      "/privacy",
      "/suspended",
      "/no-such-page",
    ],
  },
  {
    name: "seeker",
    ctx: seeker,
    routes: [
      "/seeker",
      "/seeker/requests",
      `/seeker/requests/${bk2.id}`,
      `/properties/${a.id}`,
      "/seeker/account",
    ],
  },
  {
    name: "tenant",
    ctx: lister,
    routes: [
      "/tenant",
      "/tenant/properties",
      "/tenant/properties/new",
      `/tenant/properties/${a.id}`,
      "/tenant/requests",
    ],
  },
  { name: "admin", ctx: admin, routes: ["/admin", "/admin/users", "/admin/properties", "/admin/bookings"] },
];

for (const g of groups) {
  if (g.name === "admin" && !admin) continue;
  const state = g.ctx ? await g.ctx.storageState() : undefined;
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: w < 768 ? 800 : 900 },
      storageState: state,
    });
    const page = await ctx.newPage();
    for (const r of g.routes) {
      await page.goto(base + r, { waitUntil: "networkidle", timeout: 90_000 }).catch(() => {});
      await page.waitForTimeout(700);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const slug =
        r
          .replace(/^\//, "")
          .replace(/[/?=&]/g, "_")
          .replace(/[0-9a-f]{8}-[0-9a-f-]{27}/, "id") || "home";
      mkdirSync(`${out}/${g.name}`, { recursive: true });
      await page.screenshot({ path: `${out}/${g.name}/${slug}@${w}.png`, fullPage: true });
      if (overflow > 0) console.log(`OVERFLOW ${overflow}px  ${g.name} ${r} @${w}`);
    }
    await ctx.close();
  }
  console.log(`captured ${g.name}`);
}
await browser.close();
