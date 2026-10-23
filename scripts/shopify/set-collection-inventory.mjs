// Sets the "available" inventory of every tracked variant in a collection to a
// given quantity (default 0) at every stocked location. Use it to mark a
// collection as genuinely sold out in Shopify, or to restock it in a dev store.
//
// Dry run (default) — prints what would change:
//   node --env-file=.env.local scripts/shopify/set-collection-inventory.mjs current-collection
// Apply:
//   node --env-file=.env.local scripts/shopify/set-collection-inventory.mjs current-collection --confirm
// Restock to 5 in a development store:
//   node --env-file=.env.local scripts/shopify/set-collection-inventory.mjs current-collection --quantity 5 --confirm
//
// Requires an Admin API token with read_products, read_inventory, write_inventory, read_locations.
import { randomUUID } from "node:crypto";
import { admin, adminEndpoint } from "./admin.mjs";

const COLLECTION_INVENTORY = /* GraphQL */ `
  query CollectionInventory($handle: String!, $cursor: String) {
    collectionByIdentifier(identifier: { handle: $handle }) {
      id
      title
      products(first: 50, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          variants(first: 100) {
            nodes {
              id
              title
              inventoryItem {
                id
                tracked
                inventoryLevels(first: 50) {
                  nodes {
                    location {
                      id
                      name
                    }
                    quantities(names: ["available"]) {
                      name
                      quantity
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const SET_QUANTITIES = /* GraphQL */ `
  mutation ZeroInventory($input: InventorySetQuantitiesInput!, $key: String!) {
    inventorySetQuantities(input: $input) @idempotent(key: $key) {
      inventoryAdjustmentGroup {
        reason
        changes {
          name
          delta
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const args = process.argv.slice(2);
const handle = args.find((a) => !a.startsWith("--"));
const confirm = args.includes("--confirm");
const qIndex = args.indexOf("--quantity");
const target = qIndex >= 0 ? Number(args[qIndex + 1]) : 0;

if (!handle || !Number.isInteger(target) || target < 0) {
  console.error("Usage: set-collection-inventory.mjs <collection-handle> [--quantity N] [--confirm]");
  process.exit(1);
}

const { domain } = adminEndpoint();
const changes = [];
const untracked = [];
let title;
let cursor = null;

do {
  const data = await admin(COLLECTION_INVENTORY, { handle, cursor });
  const collection = data.collectionByIdentifier;
  if (!collection) {
    console.error(`No collection with handle "${handle}" on ${domain}.`);
    process.exit(1);
  }
  title = collection.title;
  for (const product of collection.products.nodes) {
    for (const variant of product.variants.nodes) {
      const item = variant.inventoryItem;
      const label = `${product.title} / ${variant.title}`;
      if (!item.tracked) {
        untracked.push(label);
        continue;
      }
      for (const level of item.inventoryLevels.nodes) {
        const current = level.quantities.find((q) => q.name === "available")?.quantity ?? 0;
        if (current === target) continue;
        changes.push({
          label: `${label} @ ${level.location.name}`,
          current,
          inventoryItemId: item.id,
          locationId: level.location.id,
        });
      }
    }
  }
  const page = collection.products.pageInfo;
  cursor = page.hasNextPage ? page.endCursor : null;
} while (cursor);

console.log(`${title} (${handle}) on ${domain}: set available → ${target}`);
for (const c of changes) console.log(`  ${c.label}: ${c.current} → ${target}`);
if (!changes.length) console.log("  Nothing to change.");
if (untracked.length) {
  console.warn(
    `\n${untracked.length} variant(s) don't track inventory and stay purchasable — turn on "Track quantity" in Shopify:`
  );
  for (const label of untracked) console.warn(`  ${label}`);
}

if (!confirm) {
  if (changes.length) console.log("\nDry run. Re-run with --confirm to apply.");
  process.exit(0);
}

let failed = false;
for (let i = 0; i < changes.length; i += 250) {
  const batch = changes.slice(i, i + 250);
  const data = await admin(SET_QUANTITIES, {
    key: randomUUID(),
    input: {
      name: "available",
      reason: "correction",
      quantities: batch.map((c) => ({
        inventoryItemId: c.inventoryItemId,
        locationId: c.locationId,
        quantity: target,
        changeFromQuantity: c.current,
      })),
    },
  });
  const { userErrors } = data.inventorySetQuantities;
  if (userErrors.length) {
    failed = true;
    console.error("Shopify rejected the update:", userErrors.map((e) => e.message).join("; "));
  }
}
if (!failed) console.log(`\nUpdated ${changes.length} inventory level(s).`);
process.exit(failed ? 1 : 0);
