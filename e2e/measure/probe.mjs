/**
 * Print computed styles for elements matching a selector (local development only).
 *   node e2e/measure/probe.mjs <route> <css selector> [width]
 */
import { chromium } from "@playwright/test";

const base = process.env.BASE ?? "http://localhost:3100";
const [route, selector, width = "1440"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
  await page.goto(base + route, { waitUntil: "networkidle" });
  const rows = await page.$$eval(selector, (els) =>
    els.slice(0, 8).map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        text: (el.textContent ?? "").trim().slice(0, 30),
        font: `${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight}`,
        box: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`,
        cls: (el.getAttribute("class") ?? "").slice(0, 80),
      };
    }),
  );
  console.table(rows);
} finally {
  await browser.close();
}
