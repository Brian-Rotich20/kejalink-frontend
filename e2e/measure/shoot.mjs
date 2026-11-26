/**
 * Full-page screenshots of one or more routes at the five review widths, plus a horizontal
 * overflow check. Local development only (reads the app on BASE, default http://localhost:3100).
 *
 *   node e2e/measure/shoot.mjs <out-dir> / /properties ...
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const base = process.env.BASE ?? "http://localhost:3100";
const [outDir, ...routes] = process.argv.slice(2);
if (!outDir || routes.length === 0) {
  console.error("usage: node e2e/measure/shoot.mjs <out-dir> <route> [route...]");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
const widths = (process.env.WIDTHS ?? "360,390,768,1024,1440").split(",").map(Number);

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      // Scroll through once so lazy images load before the full-page capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-");
      const file = path.join(outDir, `${slug}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`${width}\t${route}\toverflow=${overflow}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
