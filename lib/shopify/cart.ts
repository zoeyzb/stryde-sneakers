import "server-only";

import { cookies, headers } from "next/headers";
import { storefrontFetch } from "./client";
import {
  CART_CREATE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "./queries";
import type { Cart, CartMutationPayload } from "./types";

export const CART_COOKIE = "stryde_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

async function buyerIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");
}

export async function readCartId() {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

async function writeCartId(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

export async function clearCartId() {
  (await cookies()).delete(CART_COOKIE);
}

export async function fetchCart(): Promise<Cart | null> {
  const cartId = await readCartId();
  if (!cartId) return null;
  const data = await storefrontFetch<{ cart: Cart | null }>({
    query: CART_QUERY,
    variables: { cartId },
    buyerIp: await buyerIp(),
  });
  // Null once Shopify has converted the cart into an order.
  return data.cart;
}

async function mutate<K extends string>(
  key: K,
  query: string,
  variables: Record<string, unknown>
) {
  const data = await storefrontFetch<Record<K, CartMutationPayload>>({
    query,
    variables,
    buyerIp: await buyerIp(),
  });
  return data[key];
}

export async function createCartWithLines(lines: { merchandiseId: string; quantity: number }[]) {
  const payload = await mutate("cartCreate", CART_CREATE_MUTATION, { lines });
  if (payload.cart) await writeCartId(payload.cart.id);
  return payload;
}

export async function addLines(lines: { merchandiseId: string; quantity: number }[]) {
  const cartId = await readCartId();
  if (!cartId) return createCartWithLines(lines);
  const payload = await mutate("cartLinesAdd", CART_LINES_ADD_MUTATION, { cartId, lines });
  if (!payload.cart && payload.userErrors.some((e) => e.code === "INVALID" || e.field?.includes("cartId"))) {
    return createCartWithLines(lines);
  }
  return payload;
}

export async function updateLines(lines: { id: string; quantity: number }[]) {
  const cartId = await readCartId();
  if (!cartId) return null;
  return mutate("cartLinesUpdate", CART_LINES_UPDATE_MUTATION, { cartId, lines });
}

export async function removeLines(lineIds: string[]) {
  const cartId = await readCartId();
  if (!cartId) return null;
  return mutate("cartLinesRemove", CART_LINES_REMOVE_MUTATION, { cartId, lineIds });
}

export async function setDiscountCodes(discountCodes: string[]) {
  const cartId = await readCartId();
  if (!cartId) return null;
  return mutate("cartDiscountCodesUpdate", CART_DISCOUNT_CODES_UPDATE_MUTATION, {
    cartId,
    discountCodes,
  });
}
