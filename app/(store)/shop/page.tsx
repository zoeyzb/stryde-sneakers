import type { Metadata } from "next";
import Link from "next/link";
import ProductGrid from "@/components/store/ProductGrid";
import { filterDemoProducts } from "@/lib/demo/catalog";

export const metadata: Metadata = {
  title: "The Three — Shop",
  description: "Graphite, Oxblood, White. Explore the three original STRYDE 3D garments.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const scene = first(sp.scene);
  const selected = scene === "gray" || scene === "sport" || scene === "white";
  const products = filterDemoProducts({ scene: selected ? scene : undefined, sort: first(sp.sort) });

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      <section className="pt-16 md:pt-24 pb-10 md:pb-16">
        <p className="eyebrow text-mist">STRYDE / Volume 001 / Studio preview</p>
        <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl uppercase tracking-[.08em] leading-[1.1]">
              {selected ? "The selected piece." : "Only three."}
            </h1>
            <p className="mt-7 max-w-xl text-sm text-ivory/65 leading-7">
              Graphite. Oxblood. White. Three original 3D garment studies, one focused collection.
              Enter each interactive world, then select a size if you want to try the demo bag.
            </p>
          </div>
          <Link href="/collections" className="eyebrow text-ivory/80 hover:text-ivory border-b border-ivory/40 pb-2 self-start">
            Explore the 3D worlds ↗
          </Link>
        </div>
      </section>
      <div className="border-t border-line pt-8">
        <ProductGrid products={products} />
      </div>
      <p className="mt-12 text-xs text-mist leading-6">
        The products, sizing and prices are a studio demonstration. No orders or payments are accepted.
      </p>
      {selected && (
        <Link href="/shop" className="mt-8 inline-block eyebrow text-ivory/80 hover:text-ivory">← View all three</Link>
      )}
    </div>
  );
}
