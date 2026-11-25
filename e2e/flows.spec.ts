import { expect, test } from "@playwright/test";
import {
  account,
  apiAs,
  createListing,
  loginUi,
  makeJpeg,
  openRequestForm,
  PASSWORD,
  waitForForm,
} from "./helpers";

test.describe("listing, requesting, answering", () => {
  test("a lister creates a listing and uploads a photo from the phone", async ({ page, baseURL }) => {
    const lister = account("TENANT");
    await apiAs(baseURL!, lister);
    await loginUi(page, lister.email);
    await expect(page).toHaveURL(/\/tenant$/);

    await page.goto("/tenant/properties/new");
    await waitForForm(page, "Save and add photos");
    const title = `Bedsitter near KU gate ${Date.now()}`;
    // Validation first: nothing filled.
    await page.getByRole("button", { name: "Save and add photos" }).click();
    await expect(page.getByText("Use at least 3 characters")).toBeVisible();
    await expect(page.getByText("Enter the monthly rent")).toBeVisible();

    await page.getByLabel("Listing title").fill(title);
    await page.getByLabel("Type of place").selectOption("BEDSITTER");
    await page.getByLabel("County").selectOption("Kiambu");
    await page.getByLabel("Area, estate or campus").fill("Kahawa Wendani");
    await page.getByLabel("Rent per month (KES)").fill("9,500");
    await page.getByLabel("Bedrooms").fill("0");
    await page.getByLabel("Description").fill("Quiet bedsitter with water 24/7, five minutes to the stage.");
    await page.getByRole("button", { name: "Water 24/7" }).click();
    await page.getByRole("button", { name: "Save and add photos" }).click();

    await expect(page).toHaveURL(/\/tenant\/properties\/[0-9a-f-]{36}/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);

    // Upload a large JPEG: it is shrunk in the browser before upload.
    const jpeg = await makeJpeg(page);
    expect(jpeg.length).toBeGreaterThan(1_000_000);
    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: "room.jpg", mimeType: "image/jpeg", buffer: jpeg });
    await expect(page.getByRole("list", { name: "Your photos" }).getByRole("listitem")).toHaveCount(1, {
      timeout: 60_000,
    });
    await expect(page.getByText("Cover photo", { exact: true })).toBeVisible();

    // Public page shows it.
    await page.getByRole("link", { name: "View public page" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText("This is your listing").first()).toBeAttached();
  });

  test("a seeker requests a viewing, the lister confirms, the seeker sees the email", async ({
    browser,
    baseURL,
  }) => {
    const lister = account("TENANT");
    const listerApi = await apiAs(baseURL!, lister);
    const listing = await createListing(listerApi, { title: `Studio for confirm ${Date.now()}` });

    const seeker = account("SEEKER");
    await apiAs(baseURL!, seeker);
    const seekerPage = await (await browser.newContext()).newPage();
    await seekerPage.goto(`/properties/${listing.id}`);

    // Signed out: prompted to sign in, and returned here after.
    const signedOut = await openRequestForm(seekerPage);
    await signedOut.getByRole("link", { name: "Sign in to request a viewing" }).click();
    await waitForForm(seekerPage, "Sign in");
    await seekerPage.getByLabel("Email").fill(seeker.email);
    await seekerPage.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await seekerPage.getByRole("button", { name: "Sign in" }).click();
    await expect(seekerPage).toHaveURL(new RegExp(`/properties/${listing.id}$`));

    const form = await openRequestForm(seekerPage);
    await form.getByLabel("Message").fill("Hi, I'm a student at KU and can view on Saturday.");
    await form.getByRole("button", { name: "Request a viewing" }).click();
    await expect(form.getByText("Request sent")).toBeVisible();

    // Lister confirms.
    const listerPage = await (await browser.newContext()).newPage();
    await loginUi(listerPage, lister.email);
    await expect(listerPage).toHaveURL(/\/tenant$/);
    await listerPage.goto("/tenant/requests?status=PENDING");
    const card = listerPage.locator("article", { hasText: listing.title });
    await expect(card).toContainText(seeker.name);
    await card.getByRole("button", { name: "Confirm" }).click();
    await expect(listerPage.getByRole("dialog")).toContainText("decline every other pending request");
    await listerPage.getByRole("button", { name: "Confirm request" }).click();
    await expect(listerPage.getByText(`Confirmed ${seeker.name}`)).toBeVisible();

    // Seeker sees the lister's email.
    await seekerPage.goto("/seeker/requests?status=CONFIRMED");
    await seekerPage.getByRole("link", { name: listing.title }).click();
    await expect(seekerPage.getByText(lister.email)).toBeVisible();
    await expect(seekerPage.getByRole("button", { name: "Copy email" })).toBeVisible();

    // The listing is now taken.
    await seekerPage.goto(`/properties/${listing.id}`);
    await expect(seekerPage.getByText("Someone else got this one.").first()).toBeAttached();
  });

  test("a lister declines with a reason; a seeker cancels", async ({ browser, baseURL }) => {
    const lister = account("TENANT");
    const listerApi = await apiAs(baseURL!, lister);
    const a = await createListing(listerApi, { title: `Decline me ${Date.now()}` });
    const b = await createListing(listerApi, { title: `Cancel me ${Date.now()}` });

    const seeker = account("SEEKER");
    const seekerApi = await apiAs(baseURL!, seeker);
    for (const id of [a.id, b.id]) {
      const res = await seekerApi.post("/api/bookings", { data: { propertyId: id } });
      expect(res.status(), await res.text()).toBe(201);
    }

    const listerPage = await (await browser.newContext()).newPage();
    await loginUi(listerPage, lister.email);
    await expect(listerPage).toHaveURL(/\/tenant$/);
    await listerPage.goto("/tenant/requests?status=PENDING");
    const card = listerPage.locator("article", { hasText: a.title });
    await card.getByRole("button", { name: "Decline" }).click();
    await listerPage.getByRole("dialog").getByLabel("Reason").fill("Already promised to someone else.");
    await listerPage.getByRole("button", { name: "Decline request" }).click();
    await expect(listerPage.getByText("Request declined")).toBeVisible();

    const seekerPage = await (await browser.newContext()).newPage();
    await loginUi(seekerPage, seeker.email);
    await expect(seekerPage).toHaveURL(/\/seeker$/);
    await seekerPage.goto("/seeker/requests?status=REJECTED");
    await expect(seekerPage.getByText("Already promised to someone else.")).toBeVisible();

    await seekerPage.goto("/seeker/requests?status=PENDING");
    await seekerPage
      .locator("article", { hasText: b.title })
      .getByRole("button", { name: "Cancel request" })
      .click();
    await seekerPage.getByRole("dialog").getByRole("button", { name: "Cancel request" }).click();
    await expect(seekerPage.getByText("Request cancelled")).toBeVisible();
    await seekerPage.goto("/seeker/requests?status=CANCELLED");
    await expect(seekerPage.getByText(b.title)).toBeVisible();
  });

  test("a duplicate request is explained, not just refused", async ({ page, baseURL }) => {
    const listerApi = await apiAs(baseURL!, account("TENANT"));
    const listing = await createListing(listerApi);
    const seeker = account("SEEKER");
    const seekerApi = await apiAs(baseURL!, seeker);
    const first = await seekerApi.post("/api/bookings", { data: { propertyId: listing.id } });
    expect(first.status()).toBe(201);

    await loginUi(page, seeker.email, PASSWORD, `/properties/${listing.id}`);
    await expect(page).toHaveURL(new RegExp(`/properties/${listing.id}$`));
    const form = await openRequestForm(page);
    await form.getByRole("button", { name: "Request a viewing" }).click();
    await expect(form.getByRole("alert")).toContainText("already have a pending request");
  });
});
