"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { useCart } from "@/components/cart/CartProvider";
import Price from "@/components/store/Price";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { useWishlist } from "@/lib/useWishlist";
import type { Product, ProductVariant } from "@/lib/shopify/types";

type Selection = Record<string, string>;

const isDefaultOnly = (product: Product) =>
  product.detailOptions.length === 1 &&
  product.detailOptions[0].optionValues.length === 1 &&
  product.detailOptions[0].optionValues[0].name === "Default Title";

function matches(variant: ProductVariant, selection: Selection) {
  return variant.selectedOptions.every((o) => selection[o.name] === undefined || selection[o.name] === o.value);
}

export default function ProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { add, pending, error } = useCart();
  const wishlist = useWishlist();
  const variants = product.variants.nodes;

  const initial = useMemo(() => {
    const fromUrl = variants.find((v) => v.id.endsWith(`/${params.get("variant")}`));
    const v = fromUrl ?? variants.find((x) => x.availableForSale) ?? variants[0];
    return Object.fromEntries((v?.selectedOptions ?? []).map((o) => [o.name, o.value])) as Selection;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const [selection, setSelection] = useState<Selection>(initial);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.selectedOptions.every((o) => selection[o.name] === o.value)) ?? null;
  const productSoldOut = !product.availableForSale;
  const variantSoldOut = !!variant && (!variant.availableForSale || variant.currentlyNotInStock);

  function choose(name: string, value: string) {
    const next = { ...selection, [name]: value };
    // Keep the selection resolvable when a combination doesn't exist.
    if (!variants.some((v) => v.selectedOptions.every((o) => next[o.name] === o.value))) {
      const fallback = variants.find((v) => matches(v, { [name]: value }));
      if (fallback) fallback.selectedOptions.forEach((o) => (next[o.name] = o.value));
    }
    setSelection(next);
    setAdded(false);
    const resolved = variants.find((v) => v.selectedOptions.every((o) => next[o.name] === o.value));
    if (resolved) {
      const sp = new URLSearchParams(params.toString());
      sp.set("variant", resolved.id.split("/").pop()!);
      router.replace(`${pathname}?${sp}`, { scroll: false });
    }
  }

  const saved = wishlist.has(product.handle);

  return (
    <div className="flex flex-col gap-8">
      <div>
        {product.productType && <p className="eyebrow text-mist mb-4">{product.productType}</p>}
        <h1 className="font-display text-2xl md:text-3xl tracking-[0.08em] uppercase leading-tight">{product.title}</h1>
        <Price
          className="mt-4 text-lg"
          min={variant?.price ?? product.priceRange.minVariantPrice}
          compareAt={variant ? variant.compareAtPrice : product.compareAtPriceRange.maxVariantPrice}
        />
        <p className="mt-2 text-xs text-mist">Taxes and shipping calculated at checkout.</p>
      </div>

      {productSoldOut && (
        <div className="border border-line px-5 py-5">
          <p className="eyebrow">Sold out</p>
          <p className="mt-2 text-sm text-ivory/75 leading-6">
            This piece is currently unavailable. Leave your email and we&apos;ll send a single note if it comes back
            into stock.
          </p>
        </div>
      )}

      {!isDefaultOnly(product) &&
        product.detailOptions.map((option) => (
          <fieldset key={option.id}>
            <legend className="eyebrow text-mist mb-3">
              {option.name}
              {selection[option.name] && <span className="ml-3 text-ivory normal-case tracking-normal font-sans text-xs">{selection[option.name]}</span>}
            </legend>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const selected = selection[option.name] === value.name;
                const candidate = variants.find((v) => matches(v, { ...selection, [option.name]: value.name }));
                const exists = variants.some((v) => matches(v, { [option.name]: value.name }));
                const available = !!candidate?.availableForSale;
                const swatch = value.swatch?.color;
                return (
                  <button
                    key={value.id}
                    type="button"
                    aria-pressed={selected}
                    disabled={!exists}
                    onClick={() => choose(option.name, value.name)}
                    className={clsx(
                      "relative min-w-12 h-11 px-3 border text-xs transition-colors",
                      selected ? "border-ivory text-ivory" : "border-line text-ivory/80 hover:border-ivory/60",
                      !available && "text-mist"
                    )}
                    aria-label={`${option.name} ${value.name}${available ? "" : ", sold out"}`}
                  >
                    {swatch && (
                      <span aria-hidden className="inline-block size-3 mr-2 align-[-1px] border border-line" style={{ background: swatch }} />
                    )}
                    <span className={clsx(!available && "line-through decoration-mist/70")}>{value.name}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

      {variant && variant.availableForSale && !variant.currentlyNotInStock && (
        <p className="text-xs tracking-widest uppercase text-ivory/75" role="status">
          In stock
        </p>
      )}

      {productSoldOut || variantSoldOut ? (
        <div className="flex flex-col gap-4">
          <button type="button" disabled className="btn-primary w-full">
            Sold out
          </button>
          <div>
            <p className="text-sm text-ivory/85 mb-3">
              {productSoldOut ? "Notify me if it returns" : `Notify me if ${variant?.title} returns`}
            </p>
            <WaitlistForm source="restock" productHandle={product.handle} productTitle={product.title} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="btn-primary w-full"
            disabled={!variant || pending}
            onClick={async () => {
              if (!variant) return;
              setAdded(await add(variant.id, 1));
            }}
          >
            {!variant ? "Select options" : pending ? "Adding…" : "Add to bag"}
          </button>
          {error && !pending && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          {added && !error && (
            <p role="status" className="text-xs text-mist">
              Added to your bag.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          wishlist.toggle({ handle: product.handle, title: product.title, image: product.featuredImage?.url ?? null })
        }
        aria-pressed={saved}
        className="self-start text-xs text-mist underline underline-offset-4 hover:text-ivory"
      >
        {saved ? "Saved to wishlist — remove" : "Save to wishlist"}
      </button>
    </div>
  );
}
