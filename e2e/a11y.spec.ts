import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { account, ADMIN, apiAs, createListing, loginUi } from "./helpers";

/** WCAG 2.2 AA rules (axe tags), on every main screen. */
async function expectAccessible(page: Page, label: string) {
  // Let streamed content and fonts settle so axe sees the real page, not skeletons.
  await page.waitForLoadState("networkidle");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("nextjs-portal")
    .analyze();
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(" ")}`,
  );
  expect(summary, `${label} has accessibility violations`).toEqual([]);
}

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  test("public screens", async ({ page, baseURL }) => {
    const listerApi = await apiAs(baseURL!, account("TENANT"));
    const listing = await createListing(listerApi, { title: "Accessible bedsitter near the stage" });
    for (const path of [
      "/",
      "/properties",
      `/properties/${listing.id}`,
      "/login",
      "/register",
      "/how-it-works",
      "/privacy",
      "/terms",
      "/suspended",
      "/no-such-page",
    ]) {
      await page.goto(path);
      await expectAccessible(page, path);
    }
  });

  test("seeker screens", async ({ page, baseURL }) => {
    const seeker = account("SEEKER");
    await apiAs(baseURL!, seeker);
    await loginUi(page, seeker.email);
    await expect(page).toHaveURL(/\/seeker$/);
    for (const path of ["/seeker", "/seeker/requests", "/seeker/account"]) {
      await page.goto(path);
      await expectAccessible(page, path);
    }
  });

  test("lister screens", async ({ page, baseURL }) => {
    const lister = account("TENANT");
    const listerApi = await apiAs(baseURL!, lister);
    const listing = await createListing(listerApi);
    await loginUi(page, lister.email);
    await expect(page).toHaveURL(/\/tenant$/);
    for (const path of [
      "/tenant",
      "/tenant/properties",
      "/tenant/properties/new",
      `/tenant/properties/${listing.id}`,
      "/tenant/requests",
      "/tenant/account",
    ]) {
      await page.goto(path);
      await expectAccessible(page, path);
    }
  });

  test("admin screens", async ({ page }) => {
    test.skip(!ADMIN.password, "E2E_ADMIN_PASSWORD not set");
    // Four pages, each scanned by axe: more than one default timeout on a loaded machine.
    test.slow();
    await loginUi(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL(/\/admin$/);
    for (const path of ["/admin", "/admin/users", "/admin/properties", "/admin/bookings"]) {
      await page.goto(path);
      await expectAccessible(page, path);
    }
  });

  test("dialogs trap focus and give it back", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the filter sheet is the phone layout");
    await page.goto("/properties");
    const trigger = page.getByRole("button", { name: /^Filters/ });
    await trigger.click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expectAccessible(page, "filter sheet");
    for (let i = 0; i < 40; i += 1) await page.keyboard.press("Tab");
    expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
});
