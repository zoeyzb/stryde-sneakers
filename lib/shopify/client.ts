import "server-only";

import { getStorefrontConfig } from "./config";

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

export class StorefrontNotConfiguredError extends ShopifyError {
  constructor() {
    super("Shopify Storefront API is not configured");
    this.name = "StorefrontNotConfiguredError";
  }
}

type FetchOptions = {
  query: string;
  variables?: Record<string, unknown>;
  /** Cache tags for catalog data; omitted for per-user data such as carts. */
  tags?: string[];
  revalidate?: number;
  buyerIp?: string | null;
};

export const CATALOG_REVALIDATE_SECONDS = 60;

export function isStorefrontConfigured() {
  return getStorefrontConfig() !== null;
}

export async function storefrontFetch<T>({
  query,
  variables,
  tags,
  revalidate = CATALOG_REVALIDATE_SECONDS,
  buyerIp,
}: FetchOptions): Promise<T> {
  const config = getStorefrontConfig();
  if (!config) throw new StorefrontNotConfiguredError();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...config.headers,
  };
  if (buyerIp && config.headers["Shopify-Storefront-Private-Token"]) {
    headers["Shopify-Storefront-Buyer-IP"] = buyerIp;
  }

  const res = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    ...(tags
      ? { next: { tags, revalidate } }
      : { cache: "no-store" as const }),
  });

  if (!res.ok) {
    throw new ShopifyError(
      `Shopify Storefront API responded with ${res.status}`,
      res.status
    );
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new ShopifyError("Shopify returned no data");
  return json.data;
}
