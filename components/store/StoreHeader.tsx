"use client";

import Link from "next/link";
import clsx from "clsx";
import { useCart } from "@/components/cart/CartProvider";

export function BagButton({ className }: { className?: string }) {
  const { cart, open } = useCart();
  const count = cart?.totalQuantity ?? 0;
  return (
    <button
      type="button"
      onClick={open}
      className={clsx("eyebrow hover:opacity-100 opacity-80 transition-opacity", className)}
      aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
    >
      Bag ({count})
    </button>
  );
}

export default function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-[1600px] flex items-center justify-between h-16 px-5 md:px-10">
        <Link href="/" className="font-display text-lg tracking-[0.35em]" aria-label="STRYDE home">
          STRYDE
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-5 md:gap-8">
          <Link href="/about" className="eyebrow opacity-80 hover:opacity-100 transition-opacity">
            Studio
          </Link>
          <BagButton />
        </nav>
      </div>
    </header>
  );
}
