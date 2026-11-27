/**
 * Log failed responses and console errors while a route loads (local development only).
 *   node e2e/measure/netlog.mjs <route> [width]
 */
import { chromium } from "@playwright/test";

const base = process.env.BASE ?? "http://localhost:3100";
const [route, width = "1440"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
  page.on("response", async (res) => {
    if (res.status() >= 400 || res.url().includes("/api/")) {
      let body = "";
      try {
        body = (await res.text()).slice(0, 200);
      } catch {}
      console.log(res.status(), res.request().method(), res.url().replace(base, ""), body);
    }
  });
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") console.log(`[${msg.type()}]`, msg.text().slice(0, 300));
  });
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
} finally {
  await browser.close();
}
