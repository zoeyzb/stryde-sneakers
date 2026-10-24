import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";
import Price from "./Price";
import SoldOutLabel from "./SoldOutLabel";

export default function ProductCard({
  product,
  priority,
}: {
  product: ProductCardType;
  priority?: boolean;
}) {
  const primary = product.featuredImage ?? product.hoverImages.nodes[0] ?? null;
  const secondary = product.hoverImages.nodes.find((i) => i.url !== primary?.url) ?? null;
  const colours = product.options.find((o) => /colou?r/i.test(o.name))?.optionValues.length ?? 0;

  return (
    <Link href={`/products/${product.handle}`} className="group block" prefetch={false}>
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-2">
        {primary ? (
          <Image
            src={primary.url}
            alt={primary.altText ?? product.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={clsx(
              "object-cover transition duration-700 ease-luxe group-hover:scale-[1.03]",
              !product.availableForSale && "grayscale-[60%] opacity-70",
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
            className={clsx(
              "object-cover opacity-0 transition duration-700 ease-luxe group-hover:opacity-100",
              !product.availableForSale && "grayscale-[60%] group-hover:opacity-70"
            )}
          />
        )}
        {!product.availableForSale ? (
          <SoldOutLabel className="absolute left-3 top-3" />
        ) : (
          <span className="absolute left-3 top-3 bg-ink/85 text-ivory px-3 py-2 text-[10px] tracking-[0.18em] uppercase">
            Available
          </span>
        )}
      </div>
      <div className="pt-4 flex justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate">{product.title}</h3>
          {colours > 1 && <p className="text-xs text-mist mt-1">{colours} colours</p>}
        </div>
        <Price
          className="text-sm shrink-0"
          min={product.priceRange.minVariantPrice}
          max={product.priceRange.maxVariantPrice}
          compareAt={product.compareAtPriceRange.maxVariantPrice}
        />
      </div>
    </Link>
  );
}
