# STRYDE

A luxury streetwear store with a scroll-driven 3D homepage, powered by a headless
Shopify backend. Catalogue, inventory, cart, checkout, payments, taxes, shipping,
orders and customer accounts all live in Shopify; this app presents them.

- **Home (`/`, `/shirts/[slug]`)** — the three-garment 3D experience (React Three
  Fiber, drei, GSAP ScrollTrigger). Every scene ends in a link into the store.
- **Store (`/shop`, `/collections`, `/products/[handle]`, `/cart`, `/account`, …)** —
  plain HTML pages without three.js, so shopping never waits on an animation.

See **[SETUP.md](./SETUP.md)** for connecting a Shopify store and what has to be
configured outside this repository.

## Running locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # fill in your Shopify credentials
npm run dev
```

Without credentials, the store pages explain that the store isn't connected
yet; nothing is invented.

### Test configuration (no credentials)

`mock.shop` is Shopify's public demo backend. It serves a real Storefront and
Cart API over test data, and its checkout is a mock — no payment is taken.

```bash
npm run dev:mock                     # or: npm run build:mock && npm run start:mock
npm run test:e2e -- http://localhost:3000 /tmp/stryde-e2e
```

The end-to-end script (`scripts/e2e/storefront.mjs`, puppeteer-core + Chrome)
checks the 3D scenes, listing, filters, sold-out labels, add/update/remove,
discount rejection, cart persistence, the checkout hand-off, sold-out product
pages, the waitlist error path and mobile layout. Override products with
`E2E_IN_STOCK_HANDLE`, `E2E_SOLD_OUT_HANDLE`, `E2E_COLLECTION_WITH_SOLD_OUT`, and
set `E2E_EXPECT_WAITLIST=saved` when Admin storage is configured.

Never point `SHOPIFY_STORE_DOMAIN` at `mock.shop` in production.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js app |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run test:e2e -- <url> <out-dir>` | Browser smoke test |
| `npm run shopify:metafields` | Creates the `stryde.*` product metafield definitions |
| `npm run shopify:inventory -- <collection> [--quantity N] [--confirm]` | Sets a collection's available inventory (dry run unless `--confirm`) |

## Structure

```
app/(experience)/        3D homepage + garment scenes (global WebGL canvas)
app/(store)/             shop, collections, product, cart, account, content pages
app/actions/cart.ts      server actions for the Shopify cart
app/api/waitlist         waitlist / back-in-stock sign-up (Admin API)
app/api/contact          contact form (Resend)
app/api/webhooks/shopify cache revalidation + restock emails
lib/shopify/             Storefront, Cart and Admin API clients and queries
lib/customer/            Customer Account API OAuth + session
components/              3D scenes, store UI, cart, product page
scripts/assets/          how the STRYDE textures and film were produced
scripts/shopify/         admin setup scripts
scripts/e2e/             browser smoke test
```

## Assets and licensing

The 3D scenes started from a third-party open-source template. Retailer branding
has been removed from the textures, models and films and replaced with original
STRYDE artwork (see `scripts/assets/`), but the underlying garment models,
environment textures and soundtrack (`public/main-optimized.mp3`) came with that
template and **no licence was published for them**. Confirm rights or replace
them before commercial use. Earlier commits in this repository's history still
contain the original branded files.

- Syncopate (display typeface) — Apache License 2.0, see `public/fonts/LICENSE-Syncopate.txt`.
- Mulish (body typeface) — SIL Open Font License 1.1, served via `next/font/google`.
