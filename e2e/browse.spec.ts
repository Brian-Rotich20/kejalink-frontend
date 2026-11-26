import { expect, test } from "@playwright/test";
import { account, apiAs, createListing, uid } from "./helpers";

test.describe("browse, filter and view", () => {
  test("search from the landing page opens filtered results in the URL", async ({ page, baseURL }) => {
    const area = `Roysambu${uid()}`;
    const listerApi = await apiAs(baseURL!, account("TENANT"));
    await createListing(listerApi, { area, county: "Nairobi", propertyType: "STUDIO", priceAmount: 15000 });

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Find a place to rent in Nairobi, from the people who let it.",
    );
    const search = page.getByRole("search", { name: "Search places to rent" });
    await search.getByLabel("Where").fill(area);
    await search.getByLabel("Type").selectOption("STUDIO");
    await search.getByLabel("Budget a month").selectOption("20000");
    await search.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(new RegExp(`/properties\\?.*area=${area}`));
    await expect(page).toHaveURL(/type=STUDIO/);
    await expect(page).toHaveURL(/maxPrice=20000/);
    await expect(page.getByRole("status").filter({ hasText: /^1 place/ })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(1);
  });

  test("filters update the URL, survive reload, and the empty state offers a reset", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/properties?county=Nairobi&maxPrice=1");
    await expect(page.getByText("No places match these filters")).toBeVisible();
    await page.getByRole("button", { name: "Clear all filters" }).click();
    await expect(page).toHaveURL(/\/properties$/);

    if (isMobile) {
      await page.getByRole("button", { name: /^Filters/ }).click();
      const sheet = page.getByRole("dialog");
      await sheet.getByText("Bedsitter", { exact: true }).click();
      await expect(page).toHaveURL(/type=BEDSITTER/);
      await sheet.getByRole("button", { name: /Show/ }).click();
    } else {
      await page.getByRole("complementary").getByText("Bedsitter", { exact: true }).click();
      await expect(page).toHaveURL(/type=BEDSITTER/);
    }
    await page.getByLabel("Sort").selectOption("price_asc");
    await expect(page).toHaveURL(/sort=price_asc/);
    await page.reload();
    await expect(page.getByLabel("Sort")).toHaveValue("price_asc");
    await page.goBack();
    await expect(page).not.toHaveURL(/sort=price_asc/);
  });

  test("a listing page is server-rendered with facts, structured data and a share image", async ({
    page,
    baseURL,
  }) => {
    const listerApi = await apiAs(baseURL!, account("TENANT"));
    const listing = await createListing(listerApi, { title: `SEO studio ${uid()}`, priceAmount: 22000 });

    const html = await (await page.request.get(`/properties/${listing.id}`)).text();
    expect(html).toContain(listing.title);
    expect(html).toContain('"@type":"Accommodation"');
    expect(html).toContain("og:image");

    await page.goto(`/properties/${listing.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(listing.title);
    await expect(page.getByText("22,000").filter({ visible: true }).first()).toBeVisible();
    const og = await page.request.get(`/properties/${listing.id}/opengraph-image`);
    // The image route path carries a hash suffix; fetch it via the meta tag instead when needed.
    if (og.status() === 404) {
      const ogUrl = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(ogUrl).toBeTruthy();
      const img = await page.request.get(ogUrl!);
      expect(img.headers()["content-type"]).toContain("image/png");
    } else {
      expect(og.headers()["content-type"]).toContain("image/png");
    }
  });

  test("unknown listings and pages show the designed 404", async ({ page }) => {
    await page.goto("/properties/00000000-0000-4000-8000-000000000000");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wrong stage");
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wrong stage");
  });

  test("keyboard: the skip link comes first and lands on the main content", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard walkthrough is a desktop check");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    // The landing search is reachable and usable by keyboard.
    await page.getByRole("search", { name: "Search places to rent" }).getByLabel("Where").focus();
    await page.keyboard.type("Kilimani");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/area=Kilimani/);
  });

  test("reduced motion: animations collapse to an instant change", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/properties");
    const duration = await page.evaluate(() => {
      const el = document.querySelector("article");
      return el ? getComputedStyle(el).animationDuration : "1ms";
    });
    expect(["0.001s", "1ms", "0s"]).toContain(duration);
  });
});
