"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/format";

export default function CartContents({ onNavigate }: { onNavigate?: () => void }) {
  const { cart, loaded, error, updateLine, removeLine } = useCart();
  const lines = cart?.lines.nodes ?? [];

  if (!loaded) return <p className="py-16 text-center text-sm text-mist">Loading your bag…</p>;

  if (!lines.length) {
    return (
      <div className="py-16 text-center">
        <p className="eyebrow text-mist">Your bag is empty</p>
        <Link href="/shop" onClick={onNavigate} className="btn-ghost mt-8">Explore the shop</Link>
        {error && <p role="alert" className="mt-6 text-sm text-red-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="divide-y divide-line border-y border-line">
        {lines.map((line) => {
          const image = line.merchandise.image ?? line.merchandise.product.featuredImage;
          const options = line.merchandise.selectedOptions.map((o) => o.value).join(" / ");
          return (
            <li key={line.id} className="flex gap-4 py-5">
              <Link
                href={`/products/${line.merchandise.product.handle}`}
                onClick={onNavigate}
                className="relative w-20 aspect-[4/5] shrink-0 bg-ink-2 overflow-hidden"
              >
                {image && <Image src={image.url} alt={image.altText ?? line.merchandise.product.title} fill sizes="80px" className="object-cover" />}
              </Link>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex justify-between gap-3">
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    onClick={onNavigate}
                    className="text-sm font-semibold hover:underline underline-offset-4"
                  >{line.merchandise.product.title}</Link>
                  <span className="text-sm tabular-nums">{formatMoney(line.cost.totalAmount)}</span>
                </div>
                <p className="text-xs text-mist">{options}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center border border-line">
                    <button type="button" aria-label={`Decrease quantity of ${line.merchandise.product.title}`} className="size-9 text-mist hover:text-ivory" onClick={() => updateLine(line.id, line.quantity - 1)}>−</button>
                    <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{line.quantity}</span>
                    <button type="button" aria-label={`Increase quantity of ${line.merchandise.product.title}`} className="size-9 text-mist hover:text-ivory disabled:opacity-30" disabled={line.quantity >= 20} onClick={() => updateLine(line.id, line.quantity + 1)}>+</button>
                  </div>
                  <button type="button" className="text-xs text-mist underline underline-offset-4 hover:text-ivory" onClick={() => removeLine(line.id)}>Remove</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-mist">Subtotal</dt>
          <dd className="tabular-nums">{formatMoney(cart!.cost.subtotalAmount)}</dd>
        </div>
      </dl>
      <p className="text-xs text-mist leading-6">Studio preview only. Prices are illustrative, no shipping is calculated and no payment information is requested.</p>
      <a href="/checkout" className="btn-primary w-full text-center">Continue to checkout</a>
    </div>
  );
}
