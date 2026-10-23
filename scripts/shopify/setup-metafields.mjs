// Creates the product metafield definitions the product page reads
// (namespace "stryde"), with Storefront API read access. Safe to re-run.
//
//   node --env-file=.env.local scripts/shopify/setup-metafields.mjs
//
// Requires an Admin API token with write_products.
import { admin, adminEndpoint } from "./admin.mjs";

const CREATE_DEFINITION = /* GraphQL */ `
  mutation CreateDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        namespace
        key
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const DEFINITIONS = [
  { key: "fabric", name: "Fabric", description: "Composition, weight and origin of the fabric." },
  { key: "care", name: "Care", description: "Washing and care instructions." },
  { key: "fit", name: "Fit", description: "How the piece fits and what size to choose." },
  { key: "size_guide", name: "Size guide", description: "Garment measurements per size, one line per size." },
  { key: "details", name: "Details", description: "Construction details, one per line." },
];

const { domain } = adminEndpoint();
console.log(`Creating STRYDE product metafield definitions on ${domain}`);

let failed = false;
for (const def of DEFINITIONS) {
  const data = await admin(CREATE_DEFINITION, {
    definition: {
      ...def,
      namespace: "stryde",
      ownerType: "PRODUCT",
      type: "multi_line_text_field",
      access: { storefront: "PUBLIC_READ" },
    },
  });
  const { createdDefinition, userErrors } = data.metafieldDefinitionCreate;
  if (createdDefinition) {
    console.log(`  created stryde.${def.key}`);
  } else if (userErrors.some((e) => e.code === "TAKEN")) {
    console.log(`  stryde.${def.key} already exists`);
  } else {
    failed = true;
    console.error(`  stryde.${def.key} failed:`, userErrors.map((e) => e.message).join("; "));
  }
}
process.exit(failed ? 1 : 0);
