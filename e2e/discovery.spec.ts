import { expect, test } from "@playwright/test";
import { account, apiAs, createListing, loginUi, uid } from "./helpers";

test.describe("discovery: filters, map and saving", () => {
  test("type tiles, steppers and conveniences narrow the results through the URL", async ({
    page,
    baseURL,
    isMobile,
  }) => {
    test.skip(isMobile, "the filter column is the wide-screen layout");
    const area = `Lavington${uid()}`;
    const lister = await apiAs(baseURL!, account("TENANT"));
    await createListing(lister, { area, propertyType: "STUDIO", amenities: ["Parking", "Water 24/7"] });
    await createListing(lister, { area, propertyType: "STUDIO", amenities: ["Water 24/7"] });
    await createListing(lister, { area, propertyType: "HOUSE", amenities: ["Parking"] });

    await page.goto(`/properties?area=${area}`);
    const filters = page.getByRole("complementary");
    await filters.getByRole("button", { name: "Studio" }).click();
    await expect(page).toHaveURL(/type=STUDIO/);
    await expect(filters.getByRole("button", { name: "Studio" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status").filter({ hasText: /^2 listings/ })).toBeVisible();

    await filters.getByText("Parking", { exact: true }).click();
    await expect(page).toHaveURL(/amenities=parking/);
    await expect(page.getByRole("status").filter({ hasText: /^1 listing/ })).toBeVisible();

    await filters.getByRole("button", { name: "More bathrooms" }).click();
    await expect(page).toHaveURL(/baths=1/);

    // R3 grid view keeps the same results.
    await page.getByRole("button", { name: "Grid" }).click();
    await expect(page).toHaveURL(/view=grid/);
    await expect(page.getByRole("article")).toHaveCount(1);
  });

  test("a listing with a pin shows on the map; selecting it opens its card", async ({ page, baseURL, isMobile }) => {
    const area = `Westlands${uid()}`;
    const lister = await apiAs(baseURL!, account("TENANT"));
    const pinned = await createListing(lister, { area, latitude: -1.2676, longitude: 36.8108 });
    await createListing(lister, { area });

    await page.goto(`/properties?area=${area}`);
    if (isMobile) await page.getByRole("button", { name: "Show map" }).click();
    const map = page.getByRole("region", { name: "Map of results" });
    await expect(map).toBeVisible();
    await expect(page.getByText(/1 of these places has no map pin yet/)).toBeVisible();
    await map.locator("path.leaflet-interactive").first().click({ force: true });
    await expect(page.getByRole("link", { name: pinned.title }).last()).toBeVisible();
  });

  test("signed out, the bookmark asks to sign in and comes back; a seeker can save and unsave", async ({
    page,
    baseURL,
  }) => {
    const area = `Kileleshwa${uid()}`;
    const lister = await apiAs(baseURL!, account("TENANT"));
    const listing = await createListing(lister, { area });
    const seeker = account("SEEKER");
    await apiAs(baseURL!, seeker);

    await page.goto(`/properties?area=${area}`);
    await page.getByRole("link", { name: `Sign in to save ${listing.title}` }).click();
    await expect(page).toHaveURL(/\/login\?next=/);

    await loginUi(page, seeker.email, undefined, `/properties?area=${area}`);
    const save = page.getByRole("button", { name: `Save ${listing.title}` });
    await save.click();
    const saved = page.getByRole("button", { name: `Remove ${listing.title} from saved` });
    await expect(saved).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(saved).toHaveAttribute("aria-pressed", "true");
    await saved.click();
    await expect(save).toHaveAttribute("aria-pressed", "false");
  });
});
