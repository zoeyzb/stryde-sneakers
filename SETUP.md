# Connecting STRYDE to Shopify

Everything below happens outside this repository: in your Shopify admin, a
Resend account and your hosting provider. Set the resulting values as
environment variables. Use `.env.local` locally and your host's encrypted
environment settings in production; see `.env.example` for the full list.
None of the server-side values may be exposed to the browser.

## 1. Store and catalogue

1. Use a Shopify store on a plan that includes the Storefront API. For testing,
   use a separate development store, not your live one.
2. Add products with real titles, prices, images, sizes and colours. Use
   **Product type** (Tee, Hoodie, Jacket, Pants, …) for the category filter on
   `/shop`.
3. Turn on **Track quantity** for every variant. Availability, SOLD OUT labels
   and back-in-stock emails all come from Shopify inventory.
4. Create these collections:
   - `current-collection`: the pieces presented as the current collection on
     the home page and in sold-out messaging. You can change the handle with
     `SHOPIFY_CURRENT_COLLECTION_HANDLE`.
   - `next-drop` (optional): pieces previewed on `/next-drop`. Leave it
     unpublished or empty until you're ready to show them. You can change the
     handle with `SHOPIFY_UPCOMING_COLLECTION_HANDLE`.
   - Seasonal collections: any other collection appears on `/collections`.
5. Optional 3D on product pages: tag a product `scene:white`, `scene:gray` or
   `scene:sport` to add a "View in 3D" toggle using that garment model. Only tag
   products that the model actually represents.
6. Optional product details: run `npm run shopify:metafields` once (Admin token
   required, see section 3). It creates the `stryde.fabric`, `stryde.care`,
   `stryde.fit`, `stryde.size_guide` and `stryde.details` product metafields,
   which you can then fill in on each product. Empty fields are hidden.
7. Optional editorial copy: create Online Store pages with the handles `about`,
   `faq` and `next-drop`. When they exist, their content replaces the built-in
   copy on those pages.
8. Policies: under **Settings → Policies**, write the refund, shipping, privacy
   and terms policies. `/returns`, `/shipping`, `/privacy` and `/terms` show
   them verbatim. Have them reviewed for your jurisdiction.

## 2. Storefront API (required)

In **Settings → Apps → Sales channels**, install the **Headless** channel, create
a storefront, and copy its credentials.

| Variable | Value |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Private access token (preferred; server-only) |
| `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | Public token, only if you don't use the private one |

Grant the storefront the product, collection, cart, inventory, page/policy and
metaobject read scopes it offers by default. Publish your products and
collections to the Headless channel, or they won't appear.

## 3. Admin API (waitlist, back-in-stock, scripts)

Create a custom app (Shopify **Dev Dashboard** or **Settings → Apps → Develop
apps**), install it on the store, and generate an Admin API access token with:

`read_products, write_products, read_inventory, write_inventory, read_customers, write_customers, read_locations`

Set `SHOPIFY_ADMIN_ACCESS_TOKEN`.

How sign-ups are stored:

- **Shopify customer records.** Each waitlist sign-up becomes, or updates, a
  Shopify customer with tags:
  - `waitlist` for every sign-up;
  - `waitlist:next-drop` for next-drop sign-ups;
  - `notify:<product-handle>` for back-in-stock requests.
- **Finding sign-ups.** Filter **Customers** by tag to see or export them.
- **Marketing consent.** Email marketing consent is only set when the shopper
  ticks the opt-in box. Next-drop sign-ups require it.
- **When storage isn't configured.** Without this token, sign-up forms say that
  sign-ups aren't connected and save nothing.

## 4. Webhooks (cache refresh and back-in-stock emails)

In **Settings → Notifications → Webhooks**, or as app webhooks, point these
topics at `https://<your-site>/api/webhooks/shopify` (JSON):

- `products/update`, `products/create`, `products/delete`
- `inventory_levels/update`
- `collections/update`, `collections/create`, `collections/delete`

Set `SHOPIFY_WEBHOOK_SECRET` to the signing secret:

- For webhooks created in Settings, use the key shown on that page.
- For app webhooks, use the app's client secret.

Unsigned or mis-signed requests are rejected.

Without webhooks, catalogue changes still appear within about 60 seconds, but
restock emails are not sent.

## 5. Email (Resend, optional)

1. Verify a sending domain in [Resend](https://resend.com).
2. Set these variables:
   - `RESEND_API_KEY`;
   - `EMAIL_FROM`, e.g. `STRYDE <studio@yourdomain.com>`;
   - `STORE_CONTACT_EMAIL`, the inbox that receives contact-form messages.

What happens:

- **Restock emails.** When a variant becomes purchasable again, each
  `notify:<handle>` subscriber is emailed once. Their tag is then replaced by
  `notified:<handle>`.
- **Without Resend.** Subscribers keep their tag and nobody is emailed. The
  contact page shows `STORE_CONTACT_EMAIL` as a mailto link instead of the
  form, or says the inbox isn't connected.

## 6. Customer accounts (sign-in and order history, optional)

1. In the Headless channel's storefront, open **Customer Account API** settings.
2. Set:
   - **Callback URI:** `https://<your-site>/account/callback`
   - **JavaScript origin:** `https://<your-site>`
   - **Logout URI:** `https://<your-site>/`
3. Set these environment variables:
   - `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`;
   - `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET`, only for a confidential client;
   - `SHOPIFY_SHOP_ID`, the number in `shopify.com/<id>/account`;
   - `SESSION_SECRET`, 32 or more random characters (`openssl rand -base64 48`).
4. Set `NEXT_PUBLIC_SITE_URL` to the public URL.

Without these settings, `/account` links to Shopify's hosted customer account
page, which still provides order history.

## 7. Checkout, payments, shipping and taxes

Checkout is Shopify's hosted checkout. This app never sees card data.

- **Payments.** In **Settings → Payments**, activate a payment provider.
  Shopify Payments availability depends on your country and business; if it
  isn't offered, use a supported third-party provider.
- **Shipping and taxes.** Configure them in **Settings → Shipping and delivery**
  and **Settings → Taxes and duties**. The cart shows "calculated at checkout",
  and Shopify calculates the real amounts.
- **Discount codes.** Create them in **Discounts**. The cart validates them
  against Shopify.
- **Testing payments.** Do this on the development store:
  - Use the provider's test mode, e.g. Shopify Payments test mode or the
    *Bogus Gateway* on dev stores.
  - Place a successful test order and a declined one, e.g. card
    `4000 0000 0000 0002` in Shopify Payments test mode.
  - Confirm that both appear correctly in **Orders** and in the account page.
- **Going live.** **Turn test mode off before launch**, and never leave test
  mode enabled on the live store.

## 8. Normal retail availability

STRYDE is a normal online clothing store. Do not force the current collection to zero inventory. Make each product and variant purchasable only when it has genuine available stock. If an individual size or product is unavailable, the site shows a sold-out state for that specific item. Keep the rest of the store open for shopping. The homepage and main navigation should always lead to the shop, not a sold-out campaign. Restock notifications are optional.

## 9. Before launch

- [ ] Products, inventory, collections and policies are real and reviewed
- [ ] Payment provider is activated and **test mode is off**
- [ ] Test orders (successful and declined) were placed on the dev store
- [ ] Webhooks are delivering, with no failures in Shopify's webhook log
- [ ] Waitlist sign-ups appear as tagged customers
- [ ] A restock email was received by a test subscriber
- [ ] Rights to the 3D models, environment textures and soundtrack are confirmed
      (see "Assets and licensing" in the README)
- [ ] `vercel.json` permits normal Git deployments
