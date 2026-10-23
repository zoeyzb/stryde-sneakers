import "server-only";

export const STOREFRONT_API_VERSION =
  process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2026-10";
export const ADMIN_API_VERSION =
  process.env.SHOPIFY_ADMIN_API_VERSION ?? "2026-10";

function normaliseDomain(value: string | undefined) {
  if (!value) return null;
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export type StorefrontConfig = {
  domain: string;
  endpoint: string;
  headers: Record<string, string>;
  isMockShop: boolean;
};

/**
 * Storefront API configuration. A private (server-side) token is preferred;
 * a public token also works. `mock.shop` domains are Shopify's credential-free
 * test backend and are only meant for the test configuration.
 */
export function getStorefrontConfig(): StorefrontConfig | null {
  const domain = normaliseDomain(process.env.SHOPIFY_STORE_DOMAIN);
  if (!domain) return null;

  const isMockShop = domain === "mock.shop" || domain.endsWith(".mock.shop");
  if (isMockShop) {
    return {
      domain,
      endpoint: `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
      headers: {},
      isMockShop,
    };
  }

  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  const publicToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
  if (!privateToken && !publicToken) return null;

  return {
    domain,
    endpoint: `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    headers: privateToken
      ? { "Shopify-Storefront-Private-Token": privateToken }
      : { "X-Shopify-Storefront-Access-Token": publicToken! },
    isMockShop,
  };
}

export type AdminConfig = { endpoint: string; token: string; domain: string };

export function getAdminConfig(): AdminConfig | null {
  const domain = normaliseDomain(
    process.env.SHOPIFY_ADMIN_STORE_DOMAIN ?? process.env.SHOPIFY_STORE_DOMAIN
  );
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!domain || !token || domain.endsWith("mock.shop")) return null;
  return {
    domain,
    token,
    endpoint: `https://${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
  };
}

export type CustomerAccountConfig = {
  clientId: string;
  shopId: string;
  storeDomain: string;
  sessionSecret: string;
};

export function getCustomerAccountConfig(): CustomerAccountConfig | null {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const shopId = process.env.SHOPIFY_SHOP_ID;
  const storeDomain = normaliseDomain(process.env.SHOPIFY_STORE_DOMAIN);
  const sessionSecret = process.env.SESSION_SECRET;
  if (!clientId || !shopId || !storeDomain || !sessionSecret) return null;
  if (sessionSecret.length < 32) return null;
  return { clientId, shopId, storeDomain, sessionSecret };
}

/** Shopify-hosted customer accounts, used when the headless OAuth client is not configured. */
export function getHostedAccountUrl(): string | null {
  const shopId = process.env.SHOPIFY_SHOP_ID;
  if (shopId) return `https://shopify.com/${shopId}/account`;
  const domain = normaliseDomain(process.env.SHOPIFY_STORE_DOMAIN);
  if (domain && !domain.endsWith("mock.shop")) return `https://${domain}/account`;
  return null;
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  );
}

/** Collection handle presented as the current public collection. */
export const CURRENT_COLLECTION_HANDLE =
  process.env.SHOPIFY_CURRENT_COLLECTION_HANDLE ?? "current-collection";

/** Optional collection previewed on the Next Drop page. */
export const UPCOMING_COLLECTION_HANDLE =
  process.env.SHOPIFY_UPCOMING_COLLECTION_HANDLE ?? "next-drop";
