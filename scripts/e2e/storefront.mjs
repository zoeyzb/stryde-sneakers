#!/usr/bin/env node
// End-to-end smoke test against a running STRYDE server.
//
//   npm run build:mock && npm run start:mock -- -p 3100
//   node scripts/e2e/storefront.mjs http://localhost:3100 ./e2e-output
//
// Requires Chrome/Chromium (CHROME_PATH, default /usr/local/bin/google-chrome).
// Against mock.shop it uses real Shopify carts with mocked checkout.
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.argv[3] ?? "e2e-output";
const IN_STOCK = process.env.E2E_IN_STOCK_HANDLE ?? "men-t-shirt";
const SOLD_OUT = process.env.E2E_SOLD_OUT_HANDLE ?? "soft-cotton-hoodie-in-clay";
const SOLD_OUT_COLLECTION = process.env.E2E_COLLECTION_WITH_SOLD_OUT ?? "women";

await mkdir(OUT, { recursive: true });
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
let step = "start";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

async function newPage(viewport = { width: 1440, height: 900 }) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  return page;
}
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });
const text = (page) => page.evaluate(() => document.body.innerText);

try {
  step = "home";
  // 1. 3D homepage
  {
    const page = await newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 90_000 });
    await page.waitForSelector("canvas", { timeout: 30_000 });
    await sleep(9000);
    await shot(page, "01-home");
    const body = (await text(page)).toUpperCase();
    check("home renders canvas + garment links", body.includes("GRAPHITE") && body.includes("OXBLOOD"));
    check("home has no page errors", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
    await page.close();
  }

  step = "garments";
  // 2. Garment scroll experience
  for (const slug of ["gray", "white", "sport"]) {
    const page = await newPage();
    await page.goto(`${BASE}/shirts/${slug}`, { waitUntil: "networkidle2", timeout: 90_000 });
    await sleep(7000);
    await shot(page, `02-${slug}-first`);
    const h = await page.evaluate(() => window.innerHeight);
    for (const [i, y] of [1.2, 3.5, 5.6].entries()) {
      await page.evaluate((top) => window.scrollTo({ top }), Math.round(h * y));
      await sleep(3500);
      await shot(page, `02-${slug}-scroll-${i + 1}`);
    }
    check(`/shirts/${slug} has no page errors`, page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
    await page.close();
  }

  step = "shop";
  // 3. Shop + collection
  {
    const page = await newPage();
    await page.goto(`${BASE}/shop`, { waitUntil: "networkidle2" });
    await shot(page, "03-shop");
    const cards = await page.$$eval('a[href^="/products/"]', (a) => a.length);
    check("shop lists Shopify products", cards > 0, `${cards} cards`);
    await page.select("select", "sold-out");
    await page.waitForFunction(() => location.search.includes("availability=sold-out"));
    check("availability filter updates URL", true);
    await page.goto(`${BASE}/collections/${SOLD_OUT_COLLECTION}`, { waitUntil: "networkidle2" });
    await shot(page, "03-collection");
    check("collection shows SOLD OUT label on unavailable piece", (await text(page)).toUpperCase().includes("SOLD OUT"));
    await page.close();
  }

  step = "cart";
  // 4. Cart: add, update quantity, invalid discount, remove
  {
    const page = await newPage();
    await page.goto(`${BASE}/products/${IN_STOCK}`, { waitUntil: "networkidle2" });
    await shot(page, "04-pdp");
    const addBtn = await page.waitForSelector("xpath/.//button[normalize-space()='Add to bag']");
    await addBtn.click();
    await page.waitForSelector('[role="dialog"][aria-label="Shopping bag"] li', { timeout: 20_000 });
    await sleep(800);
    await shot(page, "04-cart-drawer");
    check("add to bag opens drawer with line", true);

    const inc = await page.$('[role="dialog"] button[aria-label^="Increase quantity"]');
    await inc.click();
    await page.waitForFunction(
      () => document.querySelector('[role="dialog"] [aria-live="polite"]')?.textContent?.trim() === "2",
      { timeout: 20_000 }
    );
    check("quantity update persists in Shopify cart", true);

    await page.type('[role="dialog"] #discount-code', "NOT-A-REAL-CODE");
    await page.click('[role="dialog"] form button[type="submit"]');
    await page.waitForSelector('[role="dialog"] [role="alert"]', { timeout: 20_000 });
    const alert = await page.$eval('[role="dialog"] [role="alert"]', (e) => e.textContent);
    check("invalid discount code is rejected", /can't be applied|not valid|invalid/i.test(alert), alert.trim());

    await page.reload({ waitUntil: "networkidle2" });
    await page.goto(`${BASE}/cart`, { waitUntil: "networkidle2" });
    await page.waitForSelector("main li", { timeout: 20_000 });
    check("cart persists across reloads (cookie)", true);
    await shot(page, "04-cart-page");

    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => null),
      page.click('a[href="/checkout"]'),
    ]);
    const url = page.url();
    check("checkout hands off to Shopify-hosted checkout", !url.startsWith(BASE), url);

    const cartPage = await newPage();
    page.close().catch(() => {});
    await cartPage.goto(`${BASE}/cart`, { waitUntil: "domcontentloaded" });
    await cartPage.waitForSelector("main li", { timeout: 30_000 });
    await cartPage.click("xpath/.//main//button[normalize-space()='Remove']");
    await cartPage.waitForFunction(() => document.body.innerText.toLowerCase().includes("your bag is empty"), {
      timeout: 20_000,
    });
    check("remove line empties bag", true);
    await cartPage.close();
  }

  step = "sold-out";
  // 5. Sold-out PDP and honest waitlist failure
  {
    const page = await newPage();
    await page.goto(`${BASE}/products/${SOLD_OUT}`, { waitUntil: "networkidle2" });
    await shot(page, "05-sold-out-pdp");
    const disabled = await page.$eval("xpath/.//button[normalize-space()='Sold out']", (b) => b.disabled);
    check("sold-out PDP disables purchase", disabled);
    const noAdd = (await page.$("xpath/.//button[normalize-space()='Add to bag']")) === null;
    check("sold-out PDP has no add-to-bag", noAdd);
    await page.type('main input[type="email"]', "shopper@example.com");
    await page.click("xpath/.//main//button[normalize-space()='Notify me']");
    await page.waitForSelector('main [role="alert"], main [role="status"]', { timeout: 20_000 });
    const message = await page.$eval('main [role="alert"], main [role="status"]', (e) => e.textContent.trim());
    const adminConfigured = process.env.E2E_EXPECT_WAITLIST === "saved";
    check(
      adminConfigured ? "restock signup saved" : "restock signup reports failure when storage is not configured",
      adminConfigured ? /saved|already/i.test(message) : /couldn't save|aren't connected/i.test(message),
      message
    );
    await shot(page, "05-sold-out-waitlist");
    await page.close();
  }

  step = "mobile";
  // 6. Mobile + reduced motion
  {
    const page = await newPage({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 90_000 });
    await sleep(6000);
    await shot(page, "06-mobile-home-reduced-motion");
    await page.goto(`${BASE}/products/${IN_STOCK}`, { waitUntil: "networkidle2" });
    await shot(page, "06-mobile-pdp");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    check("mobile PDP has no horizontal overflow", !overflow);
    await page.close();
  }
} catch (err) {
  check("script completed", false, `${step}: ${err}`);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
