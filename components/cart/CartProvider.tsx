"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  addToCartAction,
  applyDiscountAction,
  getCartAction,
  removeDiscountAction,
  removeLineAction,
  updateLineAction,
  type CartActionResult,
} from "@/app/actions/cart";
import type { Cart } from "@/lib/shopify/types";

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

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notices, setNotices] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const apply = useCallback((result: CartActionResult) => {
    if (result.cart) setCart(result.cart);
    setError(result.error ?? null);
    setNotices(result.notices ?? []);
    return !result.error;
  }, []);

  useEffect(() => {
    let active = true;
    getCartAction().then((result) => {
      if (!active) return;
      setCart(result.cart);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(
    (action: () => Promise<CartActionResult>) =>
      new Promise<boolean>((resolve) => {
        startTransition(async () => {
          resolve(apply(await action()));
        });
      }),
    [apply]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loaded,
      pending,
      error,
      notices,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add: async (variantId, quantity = 1) => {
        const ok = await run(() => addToCartAction(variantId, quantity));
        if (ok) setIsOpen(true);
        return ok;
      },
      updateLine: (lineId, quantity) => void run(() => updateLineAction(lineId, quantity)),
      removeLine: (lineId) => void run(() => removeLineAction(lineId)),
      applyDiscount: (code) => run(() => applyDiscountAction(code)),
      removeDiscount: (code) => void run(() => removeDiscountAction(code)),
    }),
    [cart, loaded, pending, error, notices, isOpen, run]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
