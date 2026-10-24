import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CollectionFilters from "@/components/store/CollectionFilters";
import ProductGrid from "@/components/store/ProductGrid";
import { CollectionUnavailable, NotConnected, PageHeading, StoreError } from "@/components/store/StoreStatus";
import {
  getCollection,
  getCollectionAvailability,
  isStorefrontConfigured,
  type CollectionAvailability,
} from "@/lib/shopify";
import { parseSort } from "@/lib/shopify/sort";
import type { Collection } from "@/lib/shopify/types";
import { HANDLE } from "@/lib/validation";

type Params = Promise<{ handle: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

function parseFilters(raw: string[]) {
  return raw.slice(0, 20).flatMap((input) => {
    try {
      const value = JSON.parse(input);
      return value && typeof value === "object" && !Array.isArray(value) ? [value as Record<string, unknown>] : [];
    } catch {
      return [];
    }
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = await params;
  if (!isStorefrontConfigured() || !HANDLE.test(handle)) return { title: "Collection" };
  try {
    const c = await getCollection(handle, { first: 1 });
    if (!c) return { title: "Collection" };
    return {
      title: c.seo.title ?? c.title,
      description: c.seo.description ?? c.description,
      openGraph: c.image ? { images: [c.image.url] } : undefined,
    };
  } catch {
    return { title: "Collection" };
  }
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { handle } = await params;
  if (!HANDLE.test(handle)) notFound();
  const wrap = (node: React.ReactNode) => <div className="mx-auto max-w-[1600px] px-5 md:px-10">{node}</div>;

  if (!isStorefrontConfigured()) {
    return wrap(
      <>
        <PageHeading eyebrow="Collection" title={handle.replace(/-/g, " ")} />
        <NotConnected what="This collection" />
      </>
    );
  }

  const sp = await searchParams;
  const filters = parseFilters(list(sp.filter));
  const after = list(sp.after)[0];

  let collection: Collection | null;
  let availability: CollectionAvailability;
  try {
    [collection, availability] = await Promise.all([
      getCollection(handle, { sort: parseSort(sp.sort), filters, after }),
      getCollectionAvailability(handle),
    ]);
  } catch (err) {
    console.error("[collection]", err);
    return wrap(<StoreError />);
  }
  if (!collection) notFound();

  const products = collection.products.nodes;
  const nextParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (k !== "after") list(v).forEach((x) => nextParams.append(k, x));
  const firstPage = `/collections/${handle}${nextParams.size ? `?${nextParams}` : ""}`;
  if (collection.products.pageInfo.endCursor) nextParams.set("after", collection.products.pageInfo.endCursor);

  return wrap(
    <>
      <PageHeading eyebrow="Collection" title={collection.title}>
        {collection.descriptionHtml ? (
          <div className="prose-stryde" dangerouslySetInnerHTML={{ __html: collection.descriptionHtml }} />
        ) : null}
      </PageHeading>

      {availability === "sold-out" && (
        <div className="mb-14">
          <CollectionUnavailable title={collection.title} />
        </div>
      )}

      <Suspense>
        <CollectionFilters filters={collection.products.filters} />
      </Suspense>

      <div className="mt-12">
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <div className="py-24 text-center">
            <p className="eyebrow text-mist">{filters.length ? "No pieces match these filters" : "No pieces yet"}</p>
            {filters.length > 0 && (
              <Link href={`/collections/${handle}`} className="btn-ghost mt-8">
                Clear filters
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-16 flex justify-center gap-4">
        {after && (
          <Link href={firstPage} className="btn-ghost">
            First page
          </Link>
        )}
        {collection.products.pageInfo.hasNextPage && (
          <Link href={`/collections/${handle}?${nextParams}`} className="btn-ghost">
            More pieces
          </Link>
        )}
      </div>
    </>
  );
}
