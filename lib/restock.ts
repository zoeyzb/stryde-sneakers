import "server-only";

import {
  adminFetch,
  assertNoUserErrors,
  INVENTORY_ITEM_PRODUCT_QUERY,
  PRODUCT_AVAILABILITY_QUERY,
  RESTOCK_SUBSCRIBERS_QUERY,
  TAGS_ADD_MUTATION,
  TAGS_REMOVE_MUTATION,
  type AdminUserError,
} from "./shopify/admin";
import { getSiteUrl } from "./shopify/config";
import { escapeHtml, isEmailConfigured, sendEmail } from "./email";
import { notifiedTag, restockTag } from "./waitlist";

const MAX_EMAILS_PER_RUN = 200;

export async function productIdForInventoryItem(inventoryItemId: number | string) {
  const { inventoryItem } = await adminFetch<{
    inventoryItem: { variants: { nodes: { product: { id: string } }[] } } | null;
  }>(INVENTORY_ITEM_PRODUCT_QUERY, { id: `gid://shopify/InventoryItem/${inventoryItemId}` });
  return inventoryItem?.variants.nodes[0]?.product.id ?? null;
}

type SubscriberPage = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: Subscriber[];
};

type Subscriber = {
  id: string;
  firstName: string | null;
  defaultEmailAddress: { emailAddress: string } | null;
};

/**
 * Emails shoppers who asked to hear when `productId` is back, once it is
 * active and purchasable again. Each subscriber's `notify:<handle>` tag is
 * swapped for `notified:<handle>` only after their email was accepted.
 */
export async function notifyRestock(productId: string) {
  if (!isEmailConfigured()) {
    console.info("[restock] email provider not configured; subscribers keep their notify tag");
    return { sent: 0, skipped: "email-not-configured" as const };
  }

  const { product } = await adminFetch<{
    product: {
      handle: string;
      title: string;
      status: string;
      featuredMedia: { preview: { image: { url: string } | null } | null } | null;
      variants: { nodes: { availableForSale: boolean }[] };
    } | null;
  }>(PRODUCT_AVAILABILITY_QUERY, { id: productId });

  if (!product || product.status !== "ACTIVE") return { sent: 0 };
  if (!product.variants.nodes.some((v) => v.availableForSale)) return { sent: 0 };

  const tag = restockTag(product.handle);
  const url = `${getSiteUrl()}/products/${product.handle}`;
  const image = product.featuredMedia?.preview?.image?.url;
  let sent = 0;
  let after: string | null = null;

  do {
    const { customers }: { customers: SubscriberPage } = await adminFetch(RESTOCK_SUBSCRIBERS_QUERY, {
      query: `tag:'${tag}'`,
      after,
    });

    for (const customer of customers.nodes) {
      const email = customer.defaultEmailAddress?.emailAddress;
      if (!email) continue;
      const title = escapeHtml(product.title);
      await sendEmail({
        to: email,
        idempotencyKey: `restock-${product.handle}-${customer.id.split("/").pop()}`,
        subject: `${product.title} is available again`,
        text: `You asked us to let you know: ${product.title} is available again at STRYDE.\n\n${url}\n\nYou're receiving this one-time email because you requested a restock notification.`,
        html: `<div style="background:#0a0a0a;color:#f3efe7;padding:40px;font-family:Helvetica,Arial,sans-serif">
  <p style="letter-spacing:.3em;font-size:12px;margin:0 0 24px">STRYDE</p>
  ${image ? `<img src="${escapeHtml(image)}&width=560" alt="" width="280" style="display:block;margin:0 0 24px"/>` : ""}
  <h1 style="font-size:22px;font-weight:600;margin:0 0 12px">${title} is available again</h1>
  <p style="opacity:.75;margin:0 0 28px">You asked us to let you know when it returned.</p>
  <a href="${escapeHtml(url)}" style="display:inline-block;background:#f3efe7;color:#0a0a0a;padding:14px 22px;text-decoration:none;letter-spacing:.15em;font-size:12px">VIEW THE PIECE</a>
  <p style="opacity:.5;font-size:11px;margin:32px 0 0">One-time email sent because you requested a restock notification.</p>
</div>`,
      });

      const [removed, added] = await Promise.all([
        adminFetch<{ tagsRemove: { userErrors: AdminUserError[] } }>(TAGS_REMOVE_MUTATION, {
          id: customer.id,
          tags: [tag],
        }),
        adminFetch<{ tagsAdd: { userErrors: AdminUserError[] } }>(TAGS_ADD_MUTATION, {
          id: customer.id,
          tags: [notifiedTag(product.handle)],
        }),
      ]);
      assertNoUserErrors(removed.tagsRemove.userErrors, "tagsRemove");
      assertNoUserErrors(added.tagsAdd.userErrors, "tagsAdd");

      if (++sent >= MAX_EMAILS_PER_RUN) return { sent, truncated: true };
    }
    after = customers.pageInfo.hasNextPage ? customers.pageInfo.endCursor : null;
  } while (after);

  return { sent };
}
