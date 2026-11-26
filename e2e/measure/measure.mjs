// Measures the real rendered components for the dimensional-drawing spec sheets.
// Usage: node e2e/measure/measure.mjs http://localhost:3100 <listingId> <adminEmail> <adminPassword>
// Writes docs/design/specs/measurements.json. Local tooling only.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const [base, listingId, adminEmail, adminPassword] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });

/** Box model of the first element matching `sel`, relative to `rootSel`. */
const boxes = (page, items, rootSel) =>
  page.evaluate(
    ({ items, rootSel }) => {
      const root = rootSel ? document.querySelector(rootSel) : null;
      const r0 = root ? root.getBoundingClientRect() : { x: 0, y: 0 };
      const out = {};
      for (const [name, sel] of Object.entries(items)) {
        const el = typeof sel === "string" ? document.querySelector(sel) : null;
        if (!el) {
          out[name] = null;
          continue;
        }
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        out[name] = {
          x: +(r.x - r0.x).toFixed(1),
          y: +(r.y - r0.y).toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
          pad: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].map(parseFloat),
          gap: parseFloat(s.rowGap) || 0,
          colGap: parseFloat(s.columnGap) || 0,
          radius: parseFloat(s.borderTopLeftRadius),
          border: parseFloat(s.borderTopWidth),
          minH: s.minHeight,
          font: `${s.fontSize}/${s.lineHeight}`,
        };
      }
      return out;
    },
    { items, rootSel },
  );

const result = {};

// Property plate (desktop discovery, 3 columns) and the filter rail.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/properties`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  result.plate = await boxes(
    page,
    {
      card: "main article",
      photo: "main article > div:first-child",
      availability: "main article > div:first-child > span",
      board: "main article > div:nth-child(2)",
      body: "main article > div:nth-child(3)",
      price: "main article > div:nth-child(3) > p:first-child",
      title: "main article h3",
      facts: "main article ul",
      grid: "main ul.grid",
    },
    "main article",
  );
  result.rail = await boxes(
    page,
    {
      rail: "aside .sticky",
      heading: "aside h2",
      firstField: "aside .grid.gap-5 > div:first-child",
      input: "aside input[type=search]",
      chip: "aside fieldset label",
      panel: "aside .grid.gap-5",
      results: "main [class*='scroll-mt']",
    },
    "aside .sticky",
  );
  await page.close();
}

// Mobile filter sheet and the request bar.
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(`${base}/properties`, { waitUntil: "networkidle" });
  result.mobileBar = await boxes(page, {
    bar: "main .sticky.bottom-0",
    button: "main .sticky.bottom-0 button",
  });
  await page.getByRole("button", { name: /^Filters/ }).click();
  await page.waitForTimeout(500);
  result.sheet = await boxes(
    page,
    {
      sheet: "[role=dialog]",
      header: "[role=dialog] > div:first-child",
      handle: "[role=dialog] > div:first-child > span",
      close: "[role=dialog] > div:first-child button",
      body: "[role=dialog] > div:nth-child(2)",
      footer: "[role=dialog] .sticky.bottom-0",
      showButton: "[role=dialog] .sticky.bottom-0 button:last-child",
    },
    "[role=dialog]",
  );
  result.viewport = { w: 390, h: 844 };
  await page.close();
}

// Booking panel (desktop, signed out) and the phone bar on a listing.
if (listingId) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/properties/${listingId}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  result.panel = await boxes(
    page,
    {
      panel: "aside section",
      plate: "aside section > div:first-child > span",
      price: "aside section > div:first-child > p",
      heading: "aside section h2",
      cta: "aside section a",
      safety: "aside > div > section, aside section + div section",
      column: "aside",
    },
    "aside section",
  );
  const phone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await phone.goto(`${base}/properties/${listingId}`, { waitUntil: "networkidle" });
  result.panelBar = await boxes(phone, {
    bar: "div.fixed.inset-x-0.bottom-0",
    inner: "div.fixed.inset-x-0.bottom-0 > div",
    button: "div.fixed.inset-x-0.bottom-0 button",
  });
  await page.close();
  await phone.close();
}

// One admin table row.
if (adminEmail && adminPassword) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`);
  await page.getByRole("button", { name: "Sign in", exact: true }).isEnabled();
  await page.waitForFunction(
    () => !document.querySelector("form button[type=submit]")?.hasAttribute("disabled"),
  );
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/admin$/);
  await page.goto(`${base}/admin/properties`, { waitUntil: "networkidle" });
  result.row = await boxes(
    page,
    {
      region: "[role=region][aria-label=Listings]",
      head: "thead",
      th: "thead th",
      row: "tbody tr",
      td: "tbody td",
      firstCell: "tbody td:first-child",
      actions: "tbody td:last-child > div",
      button: "tbody td:last-child button",
      plate: "tbody td:nth-child(5) span",
    },
    "tbody tr",
  );
  result.rowCells = await page.evaluate(() =>
    Array.from(document.querySelectorAll("tbody tr:first-child td")).map(
      (td) => +td.getBoundingClientRect().width.toFixed(1),
    ),
  );
  await ctx.close();
}

await browser.close();
writeFileSync("docs/design/specs/measurements.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 1).slice(0, 4000));
