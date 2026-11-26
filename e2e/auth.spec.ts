import { expect, test } from "@playwright/test";
import { account, apiAs, loginUi, PASSWORD, waitForForm } from "./helpers";

test.describe("registration, sign-in and role areas", () => {
  test("a seeker registers through the role cards and lands in their area", async ({ page }) => {
    const who = account("SEEKER");
    await page.goto("/register");
    await waitForForm(page, "Create account");
    await page.getByText("I'm looking for a place").click();
    await page.getByLabel("Your name").fill(who.name);
    await page.getByLabel("Email").fill(who.email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/seeker$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Habari, Otieno");
  });

  test("a lister registers from a deep link (?as=tenant) and lands in the lister area", async ({ page }) => {
    const who = account("TENANT");
    await page.goto("/register?as=tenant");
    await waitForForm(page, "Create account");
    await expect(page.getByRole("radio", { name: /I want to list a place/ })).toBeChecked();
    await page.getByLabel("Your name").fill(who.name);
    await page.getByLabel("Email").fill(who.email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/tenant$/);
  });

  test("register shows inline errors and a duplicate-email message", async ({ page, baseURL }) => {
    const who = account("SEEKER");
    await apiAs(baseURL!, who);
    await page.goto("/register?as=seeker");
    await waitForForm(page, "Create account");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Enter your name")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters")).toBeVisible();
    await page.getByLabel("Your name").fill(who.name);
    await page.getByLabel("Email").fill(who.email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("already exists");
  });

  test("sign in, wrong password, sign out", async ({ page, baseURL }) => {
    const who = account("TENANT");
    await apiAs(baseURL!, who);
    await loginUi(page, who.email, "not-the-password");
    await expect(page.locator("form").getByRole("alert")).toContainText("don't match");
    await loginUi(page, who.email);
    await expect(page).toHaveURL(/\/tenant$/);
    await page.goto("/tenant/account");
    await page.getByRole("button", { name: "Sign out" }).last().click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/tenant");
    await expect(page).toHaveURL(/\/login\?next=%2Ftenant/);
  });

  test("protected areas redirect anonymous visitors to login with ?next and back again", async ({
    page,
    baseURL,
  }) => {
    await page.goto("/seeker/requests");
    await expect(page).toHaveURL(/\/login\?next=%2Fseeker%2Frequests/);
    const who = account("SEEKER");
    await apiAs(baseURL!, who);
    await page.getByLabel("Email").fill(who.email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/seeker\/requests$/);
  });

  test("a signed-in user visiting another role's area is sent to their own", async ({ page, baseURL }) => {
    const who = account("SEEKER");
    await apiAs(baseURL!, who);
    await loginUi(page, who.email);
    await expect(page).toHaveURL(/\/seeker$/);
    await page.goto("/tenant/properties");
    await expect(page).toHaveURL(/\/seeker$/);
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/seeker$/);
  });

  test("the login page refuses off-site ?next targets", async ({ page, baseURL }) => {
    const who = account("SEEKER");
    await apiAs(baseURL!, who);
    await loginUi(page, who.email, PASSWORD, "https://evil.example/");
    await expect(page).toHaveURL(new RegExp(`^${baseURL}/seeker$`));
  });
});
