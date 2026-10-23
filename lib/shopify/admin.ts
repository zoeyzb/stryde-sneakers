import "server-only";

import { getAdminConfig } from "./config";
import { ShopifyError } from "./client";

export class AdminNotConfiguredError extends ShopifyError {
  constructor() {
    super("Shopify Admin API is not configured");
    this.name = "AdminNotConfiguredError";
  }
}

export type AdminUserError = { field: string[] | null; message: string };

export function isAdminConfigured() {
  return getAdminConfig() !== null;
}

export async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const config = getAdminConfig();
  if (!config) throw new AdminNotConfiguredError();

  const res = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": config.token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new ShopifyError(`Shopify Admin API responded with ${res.status}`, res.status);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new ShopifyError("Shopify Admin API returned no data");
  return json.data;
}

export function assertNoUserErrors(errors: AdminUserError[] | undefined, context: string) {
  if (errors?.length) {
    throw new ShopifyError(`${context}: ${errors.map((e) => e.message).join("; ")}`);
  }
}

export const CUSTOMER_BY_EMAIL_QUERY = /* GraphQL */ `
  query WaitlistCustomer($email: String!) {
    customerByIdentifier(identifier: { emailAddress: $email }) {
      id
      tags
      defaultEmailAddress {
        emailAddress
        marketingState
      }
    }
  }
`;

export const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation WaitlistCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const TAGS_ADD_MUTATION = /* GraphQL */ `
  mutation WaitlistTag($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      userErrors {
        field
        message
      }
    }
  }
`;

export const TAGS_REMOVE_MUTATION = /* GraphQL */ `
  mutation WaitlistUntag($id: ID!, $tags: [String!]!) {
    tagsRemove(id: $id, tags: $tags) {
      userErrors {
        field
        message
      }
    }
  }
`;

export const EMAIL_CONSENT_MUTATION = /* GraphQL */ `
  mutation WaitlistConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const RESTOCK_SUBSCRIBERS_QUERY = /* GraphQL */ `
  query RestockSubscribers($query: String!, $after: String) {
    customers(first: 100, after: $after, query: $query) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        firstName
        defaultEmailAddress {
          emailAddress
        }
      }
    }
  }
`;

export const INVENTORY_ITEM_PRODUCT_QUERY = /* GraphQL */ `
  query InventoryItemProduct($id: ID!) {
    inventoryItem(id: $id) {
      variants(first: 1) {
        nodes {
          product {
            id
          }
        }
      }
    }
  }
`;

export const PRODUCT_AVAILABILITY_QUERY = /* GraphQL */ `
  query ProductAvailability($id: ID!) {
    product(id: $id) {
      handle
      title
      status
      featuredMedia {
        preview {
          image {
            url
          }
        }
      }
      variants(first: 100) {
        nodes {
          availableForSale
        }
      }
    }
  }
`;
