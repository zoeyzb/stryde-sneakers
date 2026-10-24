import { NextResponse, type NextRequest } from "next/server";
import { fetchCart } from "@/lib/shopify/cart";

export const dynamic = "force-dynamic";

/** Hands the shopper to Shopify's hosted checkout for their current cart. */
export async function GET(request: NextRequest) {
  try {
    const cart = await fetchCart();
    if (cart?.checkoutUrl && cart.totalQuantity > 0) {
      return NextResponse.redirect(cart.checkoutUrl, 303);
    }
  } catch (err) {
    console.error("[checkout]", err);
  }
  return NextResponse.redirect(new URL("/cart", request.url), 303);
}
