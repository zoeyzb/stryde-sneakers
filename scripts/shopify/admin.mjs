const version = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2026-10";

export function adminEndpoint() {
  const domain = (
    process.env.SHOPIFY_ADMIN_STORE_DOMAIN ?? process.env.SHOPIFY_STORE_DOMAIN ?? ""
  )
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!domain || !token || domain.endsWith("mock.shop")) {
    console.error(
      "Set SHOPIFY_STORE_DOMAIN (or SHOPIFY_ADMIN_STORE_DOMAIN) and SHOPIFY_ADMIN_ACCESS_TOKEN for a real Shopify store.\n" +
        "Put them in .env.local and use npm run shopify:metafields / npm run shopify:inventory."
    );
    process.exit(1);
  }
  return { domain, token, url: `https://${domain}/admin/api/${version}/graphql.json` };
}

export async function admin(query, variables = {}) {
  const { token, url } = adminEndpoint();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Admin API ${res.status}: ${await res.text()}`);
  const body = await res.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  return body.data;
}
