"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_PRODUCTS } from "@/lib/demo/catalog";
import type { Cart, CartLine, Money } from "@/lib/shopify/types";

type Entry = { variantId: string; quantity: number };
type CartContextValue = {
  cart: Cart | null;
  loaded: boolean;
  pending: boolean;
  error: string | null;
  notices: string[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (variantId: string, quantity?: number) => Promise<boolean>;
  updateLine: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: (code: string) => void;
};

const KEY = "stryde_demo_bag_v1";
const CartContext = createContext<CartContextValue | null>(null);
const money = (amount: number): Money => ({ amount: amount.toFixed(2), currencyCode: "USD" });
const PRODUCTS_BY_VARIANT = new Map(
  DEMO_PRODUCTS.flatMap((product) => product.variants.nodes.map((variant) => [variant.id, { product, variant }] as const))
);

function safeEntries(value: unknown): Entry[] {
  if (!Array.isArray(value)) return [];
  const seenProducts = new Set<string>();
  return value.slice(0, 50).flatMap((item): Entry[] => {
    if (!item || typeof item.variantId !== "string") return [];
    const found = PRODUCTS_BY_VARIANT.get(item.variantId);
    if (!found || seenProducts.has(found.product.id)) return [];
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) return [];
    seenProducts.add(found.product.id);
    return [{ variantId: item.variantId, quantity: 1 }];
  });
}

function buildCart(entries: Entry[]): Cart {
  const lines: CartLine[] = entries.flatMap((entry) => {
    const found = PRODUCTS_BY_VARIANT.get(entry.variantId);
    if (!found) return [];
    const { product, variant } = found;
    const price = Number(variant.price.amount);
    return [{
      id: `demo-line-${variant.id}`,
      quantity: entry.quantity,
      discountAllocations: [],
      cost: {
        totalAmount: money(price * entry.quantity),
        amountPerQuantity: variant.price,
        compareAtAmountPerQuantity: null,
      },
      merchandise: {
        id: variant.id,
        title: variant.title,
        availableForSale: variant.availableForSale,
        selectedOptions: variant.selectedOptions,
        image: variant.image,
        product: { handle: product.handle, title: product.title, featuredImage: product.featuredImage },
      },
    }];
  });
  const total = lines.reduce((sum, line) => sum + Number(line.cost.totalAmount.amount), 0);
  return {
    id: "stryde-demo-bag",
    checkoutUrl: "/checkout",
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    cost: { subtotalAmount: money(total), totalAmount: money(total) },
    discountCodes: [],
    lines: { nodes: lines },
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setEntries(safeEntries(JSON.parse(raw)));
    } catch {
      window.localStorage.removeItem(KEY);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
      setError("Your browser cannot save the bag between visits.");
    }
  }, [loaded, entries]);

  const add = useCallback(async (variantId: string, quantity = 1) => {
    const found = PRODUCTS_BY_VARIANT.get(variantId);
    if (!found || !found.variant.availableForSale) {
      setError("This size is sold out.");
      return false;
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      setError("Choose a valid quantity.");
      return false;
    }
    if (entries.some((entry) => PRODUCTS_BY_VARIANT.get(entry.variantId)?.product.id === found.product.id)) {
      setError("This piece is already in your bag. Remove it before selecting another size.");
      return false;
    }
    setEntries((previous) => {
      if (previous.some((entry) => PRODUCTS_BY_VARIANT.get(entry.variantId)?.product.id === found.product.id)) return previous;
      return [...previous, { variantId, quantity: 1 }];
    });
    setError(null);
    setIsOpen(true);
    return true;
  }, [entries]);

  const updateLine = useCallback((lineId: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity)) return;
    const variantId = lineId.replace(/^demo-line-/, "");
    setEntries((previous) =>
      previous.flatMap((item) => item.variantId === variantId
        ? quantity > 0 ? [{ ...item, quantity: 1 }] : []
        : [item]
      )
    );
    setError(null);
  }, []);

  const removeLine = useCallback((lineId: string) => updateLine(lineId, 0), [updateLine]);
  const cart = useMemo(() => buildCart(entries), [entries]);
  const value = useMemo<CartContextValue>(() => ({
    cart, loaded, pending: false, error, notices: [], isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    add, updateLine, removeLine,
    applyDiscount: async () => {
      setError("Discount codes are not available in the studio preview.");
      return false;
    },
    removeDiscount: () => setError(null),
  }), [cart, loaded, error, isOpen, add, updateLine, removeLine]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
