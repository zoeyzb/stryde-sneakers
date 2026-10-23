import "server-only";

import { CURRENT_COLLECTION_HANDLE } from "./config";
import { storefrontFetch } from "./client";
import {
  COLLECTION_QUERY,
  COLLECTIONS_QUERY,
  PAGE_QUERY,
  POLICIES_QUERY,
  PRODUCT_QUERY,
  PRODUCT_TYPES_QUERY,
  PRODUCTS_QUERY,
  RECOMMENDATIONS_QUERY,
  SHOP_QUERY,
} from "./queries";
import type {
  Collection,
  CollectionSummary,
  PageInfo,
  Policies,
  Product,
  ProductCard,
  Shop,
  ShopPage,
} from "./types";
import { SORT_OPTIONS, type SortValue } from "./sort";

export { isStorefrontConfigured, ShopifyError, StorefrontNotConfiguredError } from "./client";

export const TAGS = {
  products: "shopify:products",
  collections: "shopify:collections",
  content: "shopify:content",
} as const;

export const PAGE_SIZE = 24;

export async function getShop() {
  const data = await storefrontFetch<{ shop: Shop }>({
    query: SHOP_QUERY,
    tags: [TAGS.content],
  });
  return data.shop;
}

export async function getPolicies() {
  const data = await storefrontFetch<{ shop: Policies }>({
    query: POLICIES_QUERY,
    tags: [TAGS.content],
  });
  return data.shop;
}

export async function getPage(handle: string) {
  const data = await storefrontFetch<{ page: ShopPage | null }>({
    query: PAGE_QUERY,
    variables: { handle },
    tags: [TAGS.content],
  });
  return data.page;
}

function quote(value: string) {
  return `"${value.replace(/["\\]/g, "\\$&")}"`;
}

export type ProductListParams = {
  term?: string;
  productType?: string;
  availability?: "in-stock" | "sold-out";
  tag?: string;
  sort?: SortValue;
  after?: string;
};

/** Builds a Storefront `products(query:)` search string from shop filters. */
export function buildProductQuery(params: ProductListParams) {
  const parts: string[] = [];
  if (params.term?.trim()) parts.push(params.term.trim());
  if (params.productType) parts.push(`product_type:${quote(params.productType)}`);
  if (params.tag) parts.push(`tag:${quote(params.tag)}`);
  if (params.availability === "in-stock") parts.push("available_for_sale:true");
  if (params.availability === "sold-out") parts.push("available_for_sale:false");
  return parts.join(" AND ") || undefined;
}

export async function listProducts(params: ProductListParams) {
  const sort = SORT_OPTIONS.find((o) => o.value === params.sort) ?? SORT_OPTIONS[0];
  const data = await storefrontFetch<{
    products: { pageInfo: PageInfo; nodes: ProductCard[] };
  }>({
    query: PRODUCTS_QUERY,
    variables: {
      first: PAGE_SIZE,
      after: params.after ?? null,
      query: buildProductQuery(params) ?? null,
      sortKey: params.term && sort.value === "featured" ? "RELEVANCE" : sort.productKey,
      reverse: sort.reverse,
    },
    tags: [TAGS.products],
  });
  return data.products;
}

export async function getProductTypes() {
  const data = await storefrontFetch<{ productTypes: { nodes: string[] } }>({
    query: PRODUCT_TYPES_QUERY,
    tags: [TAGS.products],
  });
  return data.productTypes.nodes.filter(Boolean);
}

export async function getCollections() {
  const data = await storefrontFetch<{ collections: { nodes: CollectionSummary[] } }>({
    query: COLLECTIONS_QUERY,
    tags: [TAGS.collections],
  });
  return data.collections.nodes;
}

export type CollectionParams = {
  sort?: SortValue;
  after?: string;
  /** Raw Storefront `ProductFilter` inputs, as returned by facet values. */
  filters?: Record<string, unknown>[];
  first?: number;
};

export async function getCollection(handle: string, params: CollectionParams = {}) {
  const sort = SORT_OPTIONS.find((o) => o.value === params.sort) ?? SORT_OPTIONS[0];
  const data = await storefrontFetch<{ collection: Collection | null }>({
    query: COLLECTION_QUERY,
    variables: {
      handle,
      first: params.first ?? PAGE_SIZE,
      after: params.after ?? null,
      filters: params.filters?.length ? params.filters : null,
      sortKey: sort.collectionKey,
      reverse: sort.reverse,
    },
    tags: [TAGS.collections, TAGS.products],
  });
  return data.collection;
}

export function getCurrentCollection(params: CollectionParams = {}) {
  return getCollection(CURRENT_COLLECTION_HANDLE, params);
}

export type CollectionAvailability = "missing" | "empty" | "available" | "sold-out";

/**
 * Whether anything in a collection can currently be bought, using Shopify's
 * own `available` filter so the answer covers every page of products.
 */
export async function getCollectionAvailability(handle: string): Promise<CollectionAvailability> {
  const [any, available] = await Promise.all([
    getCollection(handle, { first: 1 }),
    getCollection(handle, { first: 1, filters: [{ available: true }] }),
  ]);
  if (!any) return "missing";
  if (!any.products.nodes.length) return "empty";
  const filtered = available?.products.nodes ?? [];
  if (filtered.some((p) => p.availableForSale)) return "available";
  if (!filtered.length) return "sold-out";

  // The filter was not applied (filtering can be disabled per store), so check every product.
  let after: string | undefined;
  do {
    const page = await getCollection(handle, { first: 100, after });
    if (!page) return "missing";
    if (page.products.nodes.some((p) => p.availableForSale)) return "available";
    after = page.products.pageInfo.hasNextPage ? page.products.pageInfo.endCursor ?? undefined : undefined;
  } while (after);
  return "sold-out";
}

export async function getProduct(handle: string) {
  const data = await storefrontFetch<{ product: Product | null }>({
    query: PRODUCT_QUERY,
    variables: { handle },
    tags: [TAGS.products],
  });
  return data.product;
}

export async function getRecommendations(productId: string) {
  const data = await storefrontFetch<{ productRecommendations: ProductCard[] | null }>({
    query: RECOMMENDATIONS_QUERY,
    variables: { productId },
    tags: [TAGS.products],
  });
  return data.productRecommendations ?? [];
}
