"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";
import { getDemoProduct } from "@/lib/demo/catalog";
import { useCart } from "@/components/cart/CartProvider";
import Price from "./Price";
import SoldOutLabel from "./SoldOutLabel";

export default function ProductCard({ product, priority }: { product: ProductCardType; priority?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const { add } = useCart();
  const primary = product.featuredImage ?? product.hoverImages.nodes[0] ?? null;
  const secondary = product.hoverImages.nodes.find((image) => image.url !== primary?.url) ?? null;
  const detail = getDemoProduct(product.handle);
  const scene = product.tags.find((tag) => tag.startsWith("scene:"))?.slice(6);
  const studioHref = scene ? `/shirts/${scene}` : `/products/${product.handle}`;

  async function quickAdd(size: string) {
    const variant = detail?.variants.nodes.find((v) => v.selectedOptions.some((o) => o.name === "Size" && o.value === size));
    if (!variant) return;
    if (await add(variant.id)) {
      setConfirmation(`${size} added to bag`);
      setExpanded(false);
    }
  }

  return (
    <article className="group min-w-0">
      <Link href={studioHref} className="block" prefetch={false}>
        <div className="relative aspect-[4/5] overflow-hidden bg-ink-2">
          {primary ? (
            <Image
              src={primary.url}
              alt={primary.altText ?? product.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={clsx(
                "object-cover transition duration-700 ease-luxe group-hover:scale-[1.035]",
                !product.availableForSale && "grayscale opacity-75",
                secondary && "group-hover:opacity-0"
              )}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center eyebrow text-mist">STRYDE</div>
          )}
          {secondary && (
            <Image
              src={secondary.url}
              alt=""
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover opacity-0 transition duration-700 ease-luxe group-hover:opacity-100"
            />
          )}
          {!product.availableForSale ? (
            <SoldOutLabel className="absolute left-3 top-3" />
          ) : (
            <span className="absolute left-3 top-3 bg-ink/85 text-ivory px-3 py-2 text-[10px] tracking-[0.18em] uppercase">
              Original 3D render
            </span>
          )}
          <span className="absolute bottom-4 right-4 eyebrow bg-ink/80 border border-line px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            Enter the 3D studio ↗
          </span>
        </div>
      </Link>
      <div className="pt-4 flex justify-between items-start gap-3">
        <div className="min-w-0">
          <Link href={`/products/${product.handle}`} className="block text-sm font-semibold hover:underline underline-offset-4">
            {product.title}
          </Link>
          <Link href={studioHref} className="inline-block mt-3 text-[11px] tracking-[.14em] uppercase text-mist hover:text-ivory">Explore in 3D ↗</Link>
        </div>
        <Price className="text-sm shrink-0" min={product.priceRange.minVariantPrice} max={product.priceRange.maxVariantPrice} compareAt={product.compareAtPriceRange.maxVariantPrice} />
      </div>
      {product.availableForSale && detail && (
        <div className="mt-4">
          <button
            type="button"
            className="w-full border border-line py-3 eyebrow hover:border-ivory transition-colors"
            aria-expanded={expanded}
            aria-controls={`quick-add-${product.handle}`}
            onClick={() => { setExpanded((v) => !v); setConfirmation(""); }}
          >
            {expanded ? "Close sizes −" : "Quick add +"}
          </button>
          {expanded && (
            <div id={`quick-add-${product.handle}`} className="grid grid-cols-5 gap-1 mt-2" aria-label={`Choose size for ${product.title}`}>
              {detail.variants.nodes.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  disabled={!variant.availableForSale}
                  onClick={() => quickAdd(variant.title)}
                  className="py-3 border border-line text-xs text-ivory hover:bg-ivory hover:text-ink disabled:opacity-40"
                  aria-label={`Add ${product.title} size ${variant.title} to bag`}
                >
                  {variant.title}
                </button>
              ))}
            </div>
          )}
          <p className="sr-only" role="status">{confirmation}</p>
        </div>
      )}
      {!product.availableForSale && (
        <Link href={`/products/${product.handle}`} className="mt-4 inline-flex justify-center items-center w-full border border-line py-3 eyebrow text-mist hover:text-ivory">
          View archive piece
        </Link>
      )}
    </article>
  );
}
