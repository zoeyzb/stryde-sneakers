"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/format";

export default function SoldOutPage() {
  const { cart, loaded } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <div className="relative isolate overflow-hidden min-h-[76vh]">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_20%,rgba(130,130,130,.13),transparent_55%)]" />
      <div aria-hidden className="absolute -z-10 top-20 left-1/2 -translate-x-1/2 text-[clamp(8rem,27vw,30rem)] font-display leading-none font-bold tracking-[-.12em] select-none whitespace-nowrap text-ivory/[.025]">STRYDE</div>
      <section className="mx-auto max-w-4xl px-5 md:px-10 py-28 md:py-40 text-center">
        <p className="eyebrow text-mist">Volume 001 / The archive</p>
        <div className="mx-auto mt-9 h-14 w-px bg-ivory/50" aria-hidden />
        <h1 className="font-display mt-8 text-5xl sm:text-7xl md:text-8xl tracking-[.07em] leading-[1.05] uppercase">
          Gone for<br />now.
        </h1>
        <p className="eyebrow text-ivory/80 mt-7">The drop is sold out</p>
        <p className="mx-auto mt-7 max-w-lg text-sm leading-7 text-ivory/65">
          Every drop has its moment. This demo journey ends here: no order was placed and no payment was collected.
        </p>
        {loaded && count > 0 && (
          <div className="mx-auto mt-8 max-w-sm border-y border-line py-5">
            <p className="eyebrow text-mist">Your preview bag</p>
            <p className="mt-3 text-sm">{count} {count === 1 ? "piece" : "pieces"}{cart && ` · ${formatMoney(cart.cost.subtotalAmount)} illustrative subtotal`}</p>
          </div>
        )}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link href="/collections" className="btn-primary">Return to the three worlds ↗</Link>
          <Link href="/shop" className="btn-ghost">Back to the three pieces</Link>
        </div>
        <p className="mt-16 text-[10px] tracking-[.24em] uppercase text-mist">Three worlds. One studio. Start again whenever you like.</p>
      </section>
    </div>
  );
}
