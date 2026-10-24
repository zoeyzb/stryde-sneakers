"use server";

import {
  addLines,
  clearCartId,
  fetchCart,
  removeLines,
  setDiscountCodes,
  updateLines,
} from "@/lib/shopify/cart";
import { ShopifyError, StorefrontNotConfiguredError } from "@/lib/shopify/client";
import type { Cart, CartMutationPayload } from "@/lib/shopify/types";

export type CartActionResult = {
  cart: Cart | null;
  error?: string;
  notices?: string[];
};

const VARIANT_ID = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const LINE_ID = /^gid:\/\/shopify\/CartLine\/[\w-]+(\?[\w=&-]+)?$/;
const MAX_QUANTITY = 20;

function toResult(payload: CartMutationPayload | null, fallback: Cart | null = null): CartActionResult {
  if (!payload) return { cart: fallback, error: "Your bag has expired. Please add the item again." };
  return {
    cart: payload.cart ?? fallback,
    error: payload.userErrors[0]?.message,
    notices: payload.warnings.map((w) => w.message),
  };
}

async function guarded(run: () => Promise<CartActionResult>): Promise<CartActionResult> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof StorefrontNotConfiguredError) {
      return { cart: null, error: "The store is not connected yet. Purchasing is unavailable." };
    }
    console.error("[cart]", err);
    return {
      cart: null,
      error:
        err instanceof ShopifyError
          ? "We couldn't reach the store. Please try again."
          : "Something went wrong. Please try again.",
    };
  }
}

export async function getCartAction(): Promise<CartActionResult> {
  return guarded(async () => {
    const cart = await fetchCart();
    if (!cart) await clearCartId().catch(() => {});
    return { cart };
  });
}

export async function addToCartAction(variantId: string, quantity = 1): Promise<CartActionResult> {
  if (!VARIANT_ID.test(variantId)) return { cart: null, error: "Please choose a size." };
  const qty = Math.min(Math.max(1, Math.floor(quantity)), MAX_QUANTITY);
  return guarded(async () => toResult(await addLines([{ merchandiseId: variantId, quantity: qty }])));
}

export async function updateLineAction(lineId: string, quantity: number): Promise<CartActionResult> {
  if (!LINE_ID.test(lineId) || !Number.isFinite(quantity)) {
    return { cart: null, error: "Invalid bag update." };
  }
  const qty = Math.min(Math.max(0, Math.floor(quantity)), MAX_QUANTITY);
  return guarded(async () =>
    toResult(qty === 0 ? await removeLines([lineId]) : await updateLines([{ id: lineId, quantity: qty }]))
  );
}

export async function removeLineAction(lineId: string): Promise<CartActionResult> {
  if (!LINE_ID.test(lineId)) return { cart: null, error: "Invalid bag update." };
  return guarded(async () => toResult(await removeLines([lineId])));
}

export async function applyDiscountAction(code: string): Promise<CartActionResult> {
  const trimmed = code.trim().slice(0, 64);
  if (!trimmed) return { cart: null, error: "Enter a discount code." };
  return guarded(async () => {
    const current = await fetchCart();
    if (!current) return { cart: null, error: "Your bag is empty." };
    const existing = current.discountCodes.map((d) => d.code);
    if (existing.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return { cart: current, error: "That code is already applied." };
    }
    const result = toResult(await setDiscountCodes([...existing, trimmed]), current);
    const applied = result.cart?.discountCodes.find(
      (d) => d.code.toLowerCase() === trimmed.toLowerCase()
    );
    if (!result.error && applied && !applied.applicable) {
      const reverted = toResult(await setDiscountCodes(existing), current);
      return { ...reverted, error: "That code can't be applied to this bag." };
    }
    return result;
  });
}

export async function removeDiscountAction(code: string): Promise<CartActionResult> {
  return guarded(async () => {
    const current = await fetchCart();
    if (!current) return { cart: null };
    const next = current.discountCodes.map((d) => d.code).filter((c) => c !== code);
    return toResult(await setDiscountCodes(next), current);
  });
}
