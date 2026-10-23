"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/format";

export default function CartContents({ onNavigate }: { onNavigate?: () => void }) {
  const { cart, loaded, pending, error, notices, updateLine, removeLine, applyDiscount, removeDiscount } =
    useCart();
  const [code, setCode] = useState("");

  const lines = cart?.lines.nodes ?? [];
  const unavailable = lines.some((l) => !l.merchandise.availableForSale);

  if (!loaded) {
    return <p className="py-16 text-center text-sm text-mist">Loading your bag…</p>;
  }

  if (!lines.length) {
    return (
      <div className="py-16 text-center">
        <p className="eyebrow text-mist">Your bag is empty</p>
        <Link href="/shop" onClick={onNavigate} className="btn-ghost mt-8">
          Explore the shop
        </Link>
        {error && <p role="alert" className="mt-6 text-sm text-red-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className={clsx("flex flex-col gap-8 transition-opacity", pending && "opacity-60")}>
      <ul className="divide-y divide-line border-y border-line">
        {lines.map((line) => {
          const image = line.merchandise.image ?? line.merchandise.product.featuredImage;
          const options = line.merchandise.selectedOptions
            .filter((o) => o.value !== "Default Title")
            .map((o) => o.value)
            .join(" / ");
          return (
            <li key={line.id} className="flex gap-4 py-5">
              <Link
                href={`/products/${line.merchandise.product.handle}`}
                onClick={onNavigate}
                className="relative w-20 aspect-[4/5] shrink-0 bg-ink-2 overflow-hidden"
              >
                {image && (
                  <Image src={image.url} alt={image.altText ?? line.merchandise.product.title} fill sizes="80px" className="object-cover" />
                )}
              </Link>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex justify-between gap-3">
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    onClick={onNavigate}
                    className="text-sm font-semibold truncate hover:underline underline-offset-4"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  <span className="text-sm tabular-nums">{formatMoney(line.cost.totalAmount)}</span>
                </div>
                {options && <p className="text-xs text-mist">{options}</p>}
                {!line.merchandise.availableForSale && (
                  <p className="text-xs text-red-300">No longer available — remove to check out.</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${line.merchandise.product.title}`}
                      className="size-9 text-mist hover:text-ivory disabled:opacity-40"
                      disabled={pending}
                      onClick={() => updateLine(line.id, line.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${line.merchandise.product.title}`}
                      className="size-9 text-mist hover:text-ivory disabled:opacity-40"
                      disabled={pending || !line.merchandise.availableForSale}
                      onClick={() => updateLine(line.id, line.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-mist underline underline-offset-4 hover:text-ivory"
                    disabled={pending}
                    onClick={() => removeLine(line.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await applyDiscount(code)) setCode("");
        }}
      >
        <label htmlFor="discount-code" className="sr-only">
          Discount code
        </label>
        <input
          id="discount-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Discount code"
          autoComplete="off"
          className="field h-11"
        />
        <button type="submit" className="btn-ghost h-11 shrink-0" disabled={pending || !code.trim()}>
          Apply
        </button>
      </form>

      {cart!.discountCodes.length > 0 && (
        <ul className="flex flex-wrap gap-2 -mt-4">
          {cart!.discountCodes.map((d) => (
            <li key={d.code} className="flex items-center gap-2 border border-line px-3 py-1.5 text-xs">
              <span className={clsx(!d.applicable && "line-through text-mist")}>{d.code}</span>
              <button
                type="button"
                aria-label={`Remove discount ${d.code}`}
                className="text-mist hover:text-ivory"
                onClick={() => removeDiscount(d.code)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {(error || notices.length > 0) && (
        <div role="alert" className="text-sm space-y-1">
          {error && <p className="text-red-300">{error}</p>}
          {notices.map((n) => (
            <p key={n} className="text-mist">{n}</p>
          ))}
        </div>
      )}

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-mist">Subtotal</dt>
          <dd className="tabular-nums">{formatMoney(cart!.cost.subtotalAmount)}</dd>
        </div>
        {cart!.cost.totalAmount.amount !== cart!.cost.subtotalAmount.amount && (
          <div className="flex justify-between">
            <dt className="text-mist">After discounts</dt>
            <dd className="tabular-nums">{formatMoney(cart!.cost.totalAmount)}</dd>
          </div>
        )}
        <p className="text-xs text-mist pt-1">Shipping and taxes are calculated at checkout.</p>
      </dl>

      {unavailable ? (
        <button type="button" disabled className="btn-primary w-full">
          Remove unavailable items to check out
        </button>
      ) : (
        <a href="/checkout" className={clsx("btn-primary w-full", pending && "pointer-events-none")}>
          Checkout
        </a>
      )}
      <p className="text-[11px] leading-5 text-mist text-center -mt-4">
        You&apos;ll complete payment on Shopify&apos;s secure checkout. STRYDE never sees or stores your card details.
      </p>
    </div>
  );
}
