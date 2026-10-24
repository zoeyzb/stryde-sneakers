import "server-only";

import {
  adminFetch,
  assertNoUserErrors,
  CUSTOMER_BY_EMAIL_QUERY,
  CUSTOMER_CREATE_MUTATION,
  EMAIL_CONSENT_MUTATION,
  TAGS_ADD_MUTATION,
  type AdminUserError,
} from "./shopify/admin";

export type WaitlistSource = "next-drop" | "restock";

export type WaitlistRequest = {
  email: string;
  source: WaitlistSource;
  productHandle?: string;
  marketingConsent: boolean;
};

export type WaitlistOutcome = "created" | "updated" | "duplicate";

export const WAITLIST_TAG = "waitlist";
export const NEXT_DROP_TAG = "waitlist:next-drop";
export const restockTag = (handle: string) => `notify:${handle}`;
export const notifiedTag = (handle: string) => `notified:${handle}`;

type ExistingCustomer = {
  id: string;
  tags: string[];
  defaultEmailAddress: { emailAddress: string; marketingState: string } | null;
} | null;

function tagsFor(request: WaitlistRequest) {
  const tags = [WAITLIST_TAG];
  if (request.source === "next-drop") tags.push(NEXT_DROP_TAG);
  if (request.source === "restock" && request.productHandle) {
    tags.push(restockTag(request.productHandle));
  }
  return tags;
}

/**
 * Stores a waitlist sign-up as a Shopify customer record so merchants can see
 * and export it from the admin (Customers → filter by tag). Marketing consent
 * is only ever granted, never revoked, and only when the shopper opted in.
 */
export async function joinWaitlist(request: WaitlistRequest): Promise<WaitlistOutcome> {
  const tags = tagsFor(request);
  const { customerByIdentifier: existing } = await adminFetch<{
    customerByIdentifier: ExistingCustomer;
  }>(CUSTOMER_BY_EMAIL_QUERY, { email: request.email });

  if (!existing) {
    const { customerCreate } = await adminFetch<{
      customerCreate: { customer: { id: string } | null; userErrors: AdminUserError[] };
    }>(CUSTOMER_CREATE_MUTATION, {
      input: {
        email: request.email,
        tags,
        ...(request.marketingConsent
          ? {
              emailMarketingConsent: {
                marketingState: "SUBSCRIBED",
                marketingOptInLevel: "SINGLE_OPT_IN",
              },
            }
          : {}),
      },
    });
    assertNoUserErrors(customerCreate.userErrors, "customerCreate");
    if (!customerCreate.customer) throw new Error("customerCreate returned no customer");
    return "created";
  }

  const missingTags = tags.filter((t) => !existing.tags.includes(t));
  const needsConsent =
    request.marketingConsent && existing.defaultEmailAddress?.marketingState !== "SUBSCRIBED";

  if (missingTags.length) {
    const { tagsAdd } = await adminFetch<{ tagsAdd: { userErrors: AdminUserError[] } }>(
      TAGS_ADD_MUTATION,
      { id: existing.id, tags: missingTags }
    );
    assertNoUserErrors(tagsAdd.userErrors, "tagsAdd");
  }
  if (needsConsent) {
    const { customerEmailMarketingConsentUpdate } = await adminFetch<{
      customerEmailMarketingConsentUpdate: { userErrors: AdminUserError[] };
    }>(EMAIL_CONSENT_MUTATION, {
      input: {
        customerId: existing.id,
        emailMarketingConsent: {
          marketingState: "SUBSCRIBED",
          marketingOptInLevel: "SINGLE_OPT_IN",
          consentUpdatedAt: new Date().toISOString(),
        },
      },
    });
    assertNoUserErrors(customerEmailMarketingConsentUpdate.userErrors, "consentUpdate");
  }

  return missingTags.length || needsConsent ? "updated" : "duplicate";
}
