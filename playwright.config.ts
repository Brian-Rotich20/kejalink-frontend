import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against a LOCAL backend only (never the production API):
 *   1. `npm run e2e:backend`  — real API on a throwaway test database (fake image host), port 5100
 *   2. `npm run test:e2e`     — builds and starts the app on port 3100 pointed at it, then runs
 * Set E2E_BASE_URL to reuse an already-running app (e.g. `next dev` wired to the local API).
 */
// Local, gitignored: the throwaway DB URL and the seeded admin used by the admin spec.
try {
  process.loadEnvFile(".env.e2e");
} catch {
  // Not present: the admin spec skips itself.
}

const external = process.env.E2E_BASE_URL;
const baseURL = external ?? "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts$/,
  timeout: 90_000,
  // Generous: a dev server compiles each route on first visit.
  expect: { timeout: 45_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    channel: process.env.E2E_CHANNEL ?? "chrome",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.E2E_CHANNEL ?? "chrome" } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.E2E_CHANNEL ?? "chrome" } },
  ],
  webServer: external
    ? undefined
    : {
        command: "npx next build && npx next start -p 3100",
        url: "http://localhost:3100/healthz",
        timeout: 600_000,
        reuseExistingServer: true,
        env: {
          API_INTERNAL_URL: process.env.E2E_API_URL ?? "http://127.0.0.1:5100",
          NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
          NEXT_PUBLIC_SUPPORT_EMAIL: "support@kejalink.example",
        },
      },
});
