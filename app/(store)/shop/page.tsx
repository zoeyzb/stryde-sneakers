import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProductGrid from "@/components/store/ProductGrid";
import ShopFilters from "@/components/store/ShopFilters";
import { NotConnected, PageHeading, StoreError } from "@/components/store/StoreStatus";
import { getProductTypes, isStorefrontConfigured, listProducts } from "@/lib/shopify";
import { parseSort } from "@/lib/shopify/sort";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop STRYDE tees, hoodies, jackets and pants.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const SCENES = ["white", "gray", "sport"];

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const term = first(sp.q)?.slice(0, 100);
  const availabilityParam = first(sp.availability);
  const availability =
    availabilityParam === "in-stock" || availabilityParam === "sold-out" ? availabilityParam : undefined;
  const scene = first(sp.scene);

  let result;
  try {
    result = await listProducts({
      term,
      productType: first(sp.type)?.slice(0, 100),
      availability,
      tag: scene && SCENES.includes(scene) ? `scene:${scene}` : undefined,
      sort: parseSort(sp.sort),
      after: first(sp.after),
    });
  } catch (err) {
    console.error("[shop]", err);
    return <StoreError />;
  }

  if (!result.nodes.length) {
    return (
      <div className="py-24 text-center">
        <p className="eyebrow text-mist">No pieces match</p>
        <Link href="/shop" className="btn-ghost mt-8">
          Clear filters
        </Link>
      </div>
    );
  }

  const nextParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const value = first(v);
    if (value && k !== "after") nextParams.set(k, value);
  }
  if (result.pageInfo.endCursor) nextParams.set("after", result.pageInfo.endCursor);

  return (
    <>
      {term && (
        <p className="mb-8 text-sm text-mist" role="status">
          Results for “{term}”
        </p>
      )}
      <ProductGrid products={result.nodes} />
      <div className="mt-16 flex justify-center gap-4">
        {sp.after && (
          <Link href={`/shop?${new URLSearchParams([...nextParams].filter(([k]) => k !== "after"))}`} className="btn-ghost">
            First page
          </Link>
        )}
        {result.pageInfo.hasNextPage && (
          <Link href={`/shop?${nextParams}`} className="btn-ghost">
            More pieces
          </Link>
        )}
      </div>
    </>
  );
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  if (!isStorefrontConfigured()) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <PageHeading eyebrow="STRYDE" title="Shop" />
        <NotConnected />
      </div>
    );
  }

  let productTypes: string[] = [];
  try {
    productTypes = await getProductTypes();
  } catch {
    productTypes = [];
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      <PageHeading eyebrow="STRYDE" title="Shop" />
      <Suspense>
        <ShopFilters productTypes={productTypes} />
      </Suspense>
      <div className="mt-12">
        <Suspense fallback={<GridSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-6" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="aspect-[4/5] bg-ink-2 animate-pulse" />
      ))}
    </ul>
  );
}
