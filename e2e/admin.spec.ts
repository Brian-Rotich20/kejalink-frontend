import { expect, test } from "@playwright/test";
import { account, ADMIN, apiAs, createListing, loginUi, PASSWORD, waitForForm } from "./helpers";

test.describe("admin moderation", () => {
  test.skip(!ADMIN.password, "E2E_ADMIN_PASSWORD not set (see .env.e2e)");

  test("an admin suspends a seeker, who is then blocked; then reactivates", async ({ browser, baseURL }) => {
    const seeker = account("SEEKER", "Suspend Me");
    await apiAs(baseURL!, seeker);

    const adminPage = await (await browser.newContext()).newPage();
    await loginUi(adminPage, ADMIN.email, ADMIN.password);
    await expect(adminPage).toHaveURL(/\/admin$/);
    await adminPage.goto(`/admin/users?q=${encodeURIComponent(seeker.email)}`);
    const row = adminPage.getByRole("row", { name: new RegExp(seeker.email) });
    await row.getByRole("button", { name: `Suspend ${seeker.name}` }).click();
    await expect(adminPage.getByRole("dialog")).toContainText("signed out everywhere");
    await adminPage.getByRole("button", { name: "Suspend account" }).click();
    await expect(row).toContainText("Suspended");

    // The suspended seeker can't sign in and lands on the explanation.
    const seekerPage = await (await browser.newContext()).newPage();
    await seekerPage.goto("/login");
    await waitForForm(seekerPage, "Sign in");
    await seekerPage.getByLabel("Email").fill(seeker.email);
    await seekerPage.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await seekerPage.getByRole("button", { name: "Sign in" }).click();
    await expect(seekerPage).toHaveURL(/\/suspended$/);
    await expect(seekerPage.getByRole("heading", { level: 1 })).toContainText("on hold");

    // Admin rows are protected.
    await adminPage.goto("/admin/users?role=ADMIN");
    await expect(adminPage.getByText("Protected").first()).toBeVisible();

    await adminPage.goto(`/admin/users?q=${encodeURIComponent(seeker.email)}`);
    await row.getByRole("button", { name: `Reactivate ${seeker.name}` }).click();
    await adminPage.getByRole("button", { name: "Reactivate account" }).click();
    await expect(row).toContainText("Active");
  });

  test("an admin takes a listing down with a reason, the lister sees it, then it is restored", async ({
    browser,
    baseURL,
  }) => {
    const lister = account("TENANT");
    const listerApi = await apiAs(baseURL!, lister);
    const listing = await createListing(listerApi, { title: `Moderate me ${Date.now()}` });

    const adminPage = await (await browser.newContext()).newPage();
    await loginUi(adminPage, ADMIN.email, ADMIN.password);
    await expect(adminPage).toHaveURL(/\/admin$/);
    await adminPage.goto("/admin/properties?status=PUBLISHED");
    const row = adminPage.getByRole("row", { name: new RegExp(listing.title) });
    await row.getByRole("button", { name: `Take down ${listing.title}` }).click();
    // A reason is required.
    await adminPage.getByRole("button", { name: "Take down", exact: true }).click();
    await expect(adminPage.getByText("Give a reason of at least 3 characters")).toBeVisible();
    await adminPage.getByRole("dialog").getByLabel("Reason").fill("Photos show a different property.");
    await adminPage.getByRole("button", { name: "Take down", exact: true }).click();
    await expect(adminPage.getByText(/Taken down\./)).toBeVisible();

    // Public page is gone; the lister sees the reason.
    const anon = await (await browser.newContext()).newPage();
    // The page streams (Cache Components), so a missing listing renders the 404 UI (with noindex)
    // after a 200 status line; assert what the visitor sees.
    await anon.goto(`/properties/${listing.id}`);
    await expect(anon.getByRole("heading", { level: 1 })).toHaveText("Wrong stage");

    const listerPage = await (await browser.newContext()).newPage();
    await loginUi(listerPage, lister.email);
    await expect(listerPage).toHaveURL(/\/tenant$/);
    await listerPage.goto("/tenant/properties");
    await expect(listerPage.getByText("Photos show a different property.")).toBeVisible();

    await adminPage.goto("/admin/properties?status=REJECTED");
    await adminPage.getByRole("button", { name: `Restore ${listing.title}` }).click();
    await adminPage.getByRole("button", { name: "Restore", exact: true }).click();
    await expect(adminPage.getByText("Listing restored to search.")).toBeVisible();
  });

  test("admin request list is read-only", async ({ page }) => {
    await loginUi(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/bookings");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Requests");
    await expect(page.getByRole("button", { name: "Confirm" })).toHaveCount(0);
  });
});
