// Core Web Vitals under Lighthouse's mobile throttling, measured with Chrome DevTools Protocol.
// Usage: node e2e/measure/vitals.mjs http://localhost:3100 / /properties /properties/<id>
// (Used because Lighthouse 12/13 cannot record traces on Chrome 158: NO_NAVSTART.)
import { chromium, devices } from "@playwright/test";

const [base, ...paths] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });

for (const path of paths) {
  const runs = [];
  for (let run = 0; run < 3; run += 1) {
    const ctx = await browser.newContext({ ...devices["Moto G4"] });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    // Lighthouse "Slow 4G" simulated values, applied as real throttling.
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    let jsBytes = 0;
    cdp.on("Network.loadingFinished", (e) => {
      const r = requests.get(e.requestId);
      if (r === "Script") jsBytes += e.encodedDataLength;
    });
    const requests = new Map();
    cdp.on("Network.requestWillBeSent", (e) => requests.set(e.requestId, e.type));

    await page.addInitScript(() => {
      window.__v = { lcp: 0, cls: 0, longTasks: 0 };
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__v.lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__v.longTasks += Math.max(0, e.duration - 50);
      }).observe({ type: "longtask", buffered: true });
    });
    await page.goto(base + path, { waitUntil: "networkidle", timeout: 120_000 });
    await page.waitForTimeout(1500);
    const v = await page.evaluate(() => window.__v);
    runs.push({ ...v, jsKB: jsBytes / 1024 });
    await ctx.close();
  }
  const median = (k) => runs.map((r) => r[k]).sort((a, b) => a - b)[1];
  console.log(
    `${path.padEnd(48)} LCP ${(median("lcp") / 1000).toFixed(2)} s · CLS ${median("cls").toFixed(3)} · TBT~ ${Math.round(
      median("longTasks"),
    )} ms · JS ${Math.round(median("jsKB"))} KB (transferred, compressed)`,
  );
}
await browser.close();
