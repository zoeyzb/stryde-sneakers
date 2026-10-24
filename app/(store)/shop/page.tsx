import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProductGrid from "@/components/store/ProductGrid";
import ShopFilters from "@/components/store/ShopFilters";
import { PageHeading } from "@/components/store/StoreStatus";
import { filterDemoProducts, getDemoProductTypes } from "@/lib/demo/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the STRYDE studio preview collection.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const products = filterDemoProducts({
    q: first(sp.q)?.slice(0, 100),
    type: first(sp.type)?.slice(0, 100),
    availability: first(sp.availability),
    scene: first(sp.scene),
    sort: first(sp.sort),
  });

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      <PageHeading eyebrow="STRYDE / Studio preview" title={first(sp.sort) === "newest" ? "New Arrivals" : "Shop"}>
        Explore the current collection, choose a size and add pieces to your bag. This is a demo catalogue; no payment or order is taken.
      </PageHeading>
      <div className="mb-8 -mt-3 flex flex-wrap items-center justify-between gap-4 border-y border-line py-5">
        <p className="text-xs text-mist">Editorial imagery is illustrative · Preview prices only</p>
        <Link href="/lookbook" className="eyebrow text-ivory hover:opacity-65">Discover the lookbook ↗</Link>
      </div>
      <Suspense>
        <ShopFilters productTypes={getDemoProductTypes()} />
      </Suspense>
      <div className="mt-10">
        {products.length ? <ProductGrid products={products} /> : (
          <div className="py-24 text-center">
            <p className="eyebrow text-mist">No pieces match your search</p>
            <Link href="/shop" className="btn-ghost mt-8">Clear filters</Link>
          </div>
        )}
      </div>
    </div>
  );
}
