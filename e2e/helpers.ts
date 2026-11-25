import { type APIRequestContext, type Page, expect, request } from "@playwright/test";

/** Every e2e account and listing is unique per run, on the throwaway test database. */
export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const PASSWORD = "e2e-password-123";

export type Role = "SEEKER" | "TENANT";
export type Account = { name: string; email: string; role: Role };

export const account = (
  role: Role,
  name = role === "TENANT" ? "Wanjiru Lister" : "Otieno Seeker",
): Account => ({
  name,
  email: `${role.toLowerCase()}-${uid()}@e2e.kejalink.test`,
  role,
});

/** A request context that goes through the app's /api proxy (same origin, so cookies stick). */
export async function apiAs(baseURL: string, who?: Account): Promise<APIRequestContext> {
  const ctx = await request.newContext({ baseURL, extraHTTPHeaders: { origin: new URL(baseURL).origin } });
  if (who) {
    const res = await ctx.post("/api/auth/sign-up/email", {
      data: { name: who.name, email: who.email, password: PASSWORD, role: who.role },
    });
    expect(res.status(), await res.text()).toBe(200);
  }
  return ctx;
}

export async function signInAs(ctx: APIRequestContext, email: string, password: string) {
  const res = await ctx.post("/api/auth/sign-in/email", { data: { email, password } });
  expect(res.status(), await res.text()).toBe(200);
}

export async function createListing(
  ctx: APIRequestContext,
  overrides: Partial<{
    title: string;
    area: string;
    county: string;
    priceAmount: number;
    propertyType: string;
  }> = {},
) {
  const res = await ctx.post("/api/properties", {
    data: {
      title: overrides.title ?? `E2E bedsitter ${uid()}`,
      description: "E2E fixture. Quiet bedsitter with water 24/7 near the stage.",
      propertyType: overrides.propertyType ?? "BEDSITTER",
      priceAmount: overrides.priceAmount ?? 9500,
      bedrooms: 0,
      bathrooms: 1,
      county: overrides.county ?? "Kiambu",
      area: overrides.area ?? `Kahawa ${uid()}`,
      amenities: ["Water 24/7"],
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  return ((await res.json()) as { data: { id: string; title: string; area: string } }).data;
}

/** Sign in through the real form (cookies land in the page's context). */
export async function loginUi(page: Page, email: string, password = PASSWORD, next?: string) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await waitForForm(page, "Sign in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function logoutUi(page: Page) {
  await page.context().clearCookies();
}

/** A real JPEG for upload tests (bigger than the compressor's target, so shrinking is exercised). */
export function makeJpeg(page: Page, width = 3000, height = 2000): Promise<Buffer> {
  return page
    .evaluate(
      async ({ width, height }) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        // Noise so the JPEG doesn't compress to nothing.
        const img = ctx.createImageData(width, height);
        for (let i = 0; i < img.data.length; i += 4) {
          img.data[i] = (i * 7) % 255;
          img.data[i + 1] = (i * 13) % 255;
          img.data[i + 2] = Math.random() * 255;
          img.data[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.95));
        return Array.from(new Uint8Array(await blob.arrayBuffer()));
      },
      { width, height },
    )
    .then((bytes) => Buffer.from(bytes));
}

export const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? "admin@e2e.kejalink.test",
  password: process.env.E2E_ADMIN_PASSWORD ?? "",
};

/** The request form on a listing: the side panel on desktop, the bottom sheet on phones. */
export async function openRequestForm(page: Page) {
  // The listing streams in; wait for it before deciding which layout is showing.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 60_000 });
  const panel = page.locator("section", { has: page.getByRole("heading", { name: "Request a viewing" }) });
  if (await panel.isVisible()) return panel;
  await page.getByRole("button", { name: "Request a viewing" }).last().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Forms keep their submit button disabled until React hydrates; wait for it before typing. */
export async function waitForForm(page: Page, submitName: string) {
  await expect(page.getByRole("button", { name: submitName, exact: true })).toBeEnabled({ timeout: 60_000 });
}
