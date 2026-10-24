"use client";

import { useCallback, useSyncExternalStore } from "react";

export type WishlistItem = { handle: string; title: string; image: string | null };

const KEY = "stryde:wishlist";
const EVENT = "stryde:wishlist";
const EMPTY: WishlistItem[] = [];
let cache: { raw: string | null; items: WishlistItem[] } = { raw: null, items: EMPTY };

function read(): WishlistItem[] {
  const raw = window.localStorage.getItem(KEY);
  if (raw === cache.raw) return cache.items;
  let items: WishlistItem[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    items = Array.isArray(parsed) ? parsed.filter((i) => typeof i?.handle === "string") : EMPTY;
  } catch {
    items = EMPTY;
  }
  cache = { raw, items };
  return items;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

/** A device-local wishlist; nothing is sent to a server. */
export function useWishlist() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((item: WishlistItem) => {
    const current = read();
    const next = current.some((i) => i.handle === item.handle)
      ? current.filter((i) => i.handle !== item.handle)
      : [item, ...current].slice(0, 100);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const has = useCallback((handle: string) => items.some((i) => i.handle === handle), [items]);

  return { items, toggle, has };
}
