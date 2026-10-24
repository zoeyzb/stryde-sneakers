import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductGrid from "@/components/store/ProductGrid";
import { PageHeading } from "@/components/store/StoreStatus";
import { getDemoCollection } from "@/lib/demo/catalog";
import { HANDLE } from "@/lib/validation";

type Params = Promise<{ handle: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = await params;
  const collection = getDemoCollection(handle);
  return collection
    ? { title: collection.title, description: collection.description }
    : { title: "Collection" };
}

export default async function CollectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { handle } = await params;
  if (!HANDLE.test(handle)) notFound();
  const sp = await searchParams;
  const collection = getDemoCollection(handle, first(sp.sort));
  if (!collection) notFound();

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      <PageHeading eyebrow="Collection / Studio preview" title={collection.title}>
        {collection.description}
      </PageHeading>
      <div className="flex flex-wrap justify-between gap-4 border-y border-line py-5">
        <p className="eyebrow text-mist">{collection.products.nodes.length} pieces</p>
        <Link href="/collections" className="eyebrow hover:text-mist">All collections →</Link>
      </div>
      <div className="mt-10">
        <Suspense>
          <ProductGrid products={collection.products.nodes} />
        </Suspense>
      </div>
    </div>
  );
}
