"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/format";

export default function SoldOutPage() {
  const { cart, loaded } = useCart();
  const count = cart?.totalQuantity ?? 0;
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <section className="relative text-center py-24 md:py-36">
        <p className="eyebrow text-mist">STRYDE / Studio preview</p>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl tracking-[0.08em] leading-tight mt-8 uppercase">
          Sold<br />Out.
        </h1>
        <div className="mx-auto mt-10 max-w-lg text-sm leading-7 text-ivory/75">
          <p>This drop is no longer available. Your bag was part of a storefront demonstration — no order has been placed and no payment was taken.</p>
          {loaded && count > 0 && (
            <p className="mt-5 text-ivory">
              Your preview bag: {count} {count === 1 ? "piece" : "pieces"}
              {cart && ` · ${formatMoney(cart.cost.subtotalAmount)} illustrative subtotal`}
            </p>
          )}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="btn-primary">Continue exploring</Link>
          <Link href="/collections" className="btn-ghost">Explore collections</Link>
        </div>
        <p className="mt-12 text-xs tracking-[0.14em] uppercase text-mist">The next chapter is coming.</p>
      </section>
    </div>
  );
}
