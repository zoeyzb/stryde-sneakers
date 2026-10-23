import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { after, NextResponse } from "next/server";
import { TAGS } from "@/lib/shopify";
import { isAdminConfigured } from "@/lib/shopify/admin";
import { notifyRestock, productIdForInventoryItem } from "@/lib/restock";

export const dynamic = "force-dynamic";

function verify(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const provided = Buffer.from(signature, "base64");
  return provided.length === digest.length && timingSafeEqual(provided, digest);
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhooks not configured" }, { status: 503 });

  const rawBody = await request.text();
  if (!verify(rawBody, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (topic.startsWith("products/") || topic.startsWith("inventory_levels/")) {
    revalidateTag(TAGS.products);
    revalidateTag(TAGS.collections);
  } else if (topic.startsWith("collections/")) {
    revalidateTag(TAGS.collections);
  } else if (topic.startsWith("shop/") || topic.startsWith("pages/")) {
    revalidateTag(TAGS.content);
  }

  if (isAdminConfigured() && (topic === "products/update" || topic === "inventory_levels/update")) {
    after(async () => {
      try {
        const productId =
          topic === "products/update"
            ? (payload.admin_graphql_api_id as string | undefined)
            : await productIdForInventoryItem(payload.inventory_item_id as number);
        if (productId) {
          const result = await notifyRestock(productId);
          if (result.sent) console.info(`[restock] ${productId}: sent ${result.sent}`);
        }
      } catch (err) {
        console.error("[restock]", err);
      }
    });
  }

  return NextResponse.json({ ok: true });
}
