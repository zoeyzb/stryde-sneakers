"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { DEMO_PRODUCTS } from "@/lib/demo/catalog";
import { formatMoney } from "@/lib/format";
import { garmentName } from "@/lib/garments";
import type { ShirtType } from "@/lib/textures";

type Props = {
  shirtType: ShirtType;
  onClose: () => void;
  onAdded: () => void;
};

export default function StudioPurchasePanel({ shirtType, onClose, onAdded }: Props) {
  const { add, error, cart } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const product = DEMO_PRODUCTS.find((piece) => piece.tags.includes("scene:" + shirtType));
  const sizes = product?.detailOptions.find((option) => option.name === "Size")?.optionValues ?? [];
  const inBag = Boolean(cart?.lines.nodes.some((line) => product?.variants.nodes.some((v) => v.id === line.merchandise.id)));
  const variant = product?.variants.nodes.find(
    (item) => item.selectedOptions.some((option) => option.name === "Size" && option.value === size)
  );
  const number = shirtType === "gray" ? "01" : shirtType === "sport" ? "02" : "03";

  useEffect(() => {
    panelRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!product) return null;

  async function handleAdd() {
    if (!variant || !variant.availableForSale || inBag || adding) return;
    setAdding(true);
    try {
      if (await add(variant.id, 1)) onAdded();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" aria-label="Choose size and add to bag">
      <button
        type="button"
        aria-label="Close size chooser"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-[3px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-purchase-title"
        tabIndex={-1}
        className="relative ml-auto flex h-dvh w-full max-w-[460px] flex-col overflow-y-auto bg-ink text-ivory border-l border-white/15 px-6 sm:px-10 py-7 sm:py-10 outline-none"
      >
        <div className="flex items-center justify-between border-b border-line pb-7">
          <span className="eyebrow text-mist">STRYDE / VOLUME 001</span>
          <button type="button" onClick={onClose} className="eyebrow text-ivory hover:text-mist">
            Close ×
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center py-10">
          <p className="eyebrow text-mist">{number} / 03 — The collection</p>
          <h2 id="studio-purchase-title" className="font-display mt-5 text-3xl sm:text-4xl leading-tight uppercase tracking-[0.08em]">
            {garmentName(shirtType)}.
          </h2>
          <p className="mt-3 text-sm text-ivory/60">Studio Layer · {formatMoney(product.priceRange.minVariantPrice)}</p>

          <fieldset className="mt-12">
            <legend className="eyebrow text-ivory/80 mb-4">Choose your size</legend>
            <div className="grid grid-cols-5 gap-2">
              {sizes.map((option) => {
                const available = !inBag && product.variants.nodes.some(
                  (item) => item.availableForSale && item.selectedOptions.some(
                    (selected) => selected.name === "Size" && selected.value === option.name
                  )
                );
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!available}
                    aria-pressed={size === option.name}
                    aria-label={"Size " + option.name + (available ? "" : " sold out")}
                    onClick={() => setSize(option.name)}
                    className={
                      "h-12 min-w-0 border text-xs transition-colors " +
                      (size === option.name
                        ? "border-ivory bg-ivory text-ink"
                        : "border-white/25 text-ivory hover:border-white/70") +
                      (!available ? " opacity-40 line-through" : "")
                    }
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="button"
            className="btn-primary mt-8 w-full min-h-14"
            disabled={!variant || !variant.availableForSale || inBag || adding}
            onClick={handleAdd}
          >
            {inBag ? "Sold out · Already in your bag" : adding ? "Adding…" : !size ? "Choose a size" : "Add to bag"}
          </button>
          {error && <p role="alert" className="mt-3 text-xs text-red-300">{error}</p>}
          {inBag && <p role="status" className="mt-4 text-xs leading-6 text-ivory/80">This piece is already in your bag. Remove it to choose another size.</p>}
          <p className="mt-5 text-xs leading-6 text-mist">
            Studio concept · Illustrative sizing and pricing. No actual orders or payments are accepted.
          </p>
        </div>

        <div className="border-t border-line pt-6 flex flex-col gap-5">
          <button type="button" onClick={onClose} className="eyebrow self-start text-ivory hover:text-mist">
            ← Back to the 3D experience
          </button>
          <Link href="/" className="eyebrow self-start text-mist hover:text-ivory">
            View all three garments ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
