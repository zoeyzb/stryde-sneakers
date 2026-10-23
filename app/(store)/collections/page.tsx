import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NotConnected, PageHeading, StoreError } from "@/components/store/StoreStatus";
import SoldOutLabel from "@/components/store/SoldOutLabel";
import { getCollections, isStorefrontConfigured } from "@/lib/shopify";
import type { CollectionSummary } from "@/lib/shopify/types";

export const metadata: Metadata = {
  title: "Collections",
  description: "STRYDE collections — current, seasonal and archive.",
};

export default async function CollectionsPage() {
  if (!isStorefrontConfigured()) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <PageHeading eyebrow="STRYDE" title="Collections" />
        <NotConnected what="Collections" />
      </div>
    );
  }

  let collections: CollectionSummary[];
  try {
    collections = (await getCollections()).filter((c) => c.products.nodes.length > 0);
  } catch (err) {
    console.error("[collections]", err);
    return (
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <PageHeading eyebrow="STRYDE" title="Collections" />
        <StoreError />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      <PageHeading eyebrow="STRYDE" title="Collections" />
      {collections.length === 0 ? (
        <p className="text-sm text-mist">No collections have been published yet.</p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {collections.map((c) => {
            const image = c.image ?? c.products.nodes.find((p) => p.featuredImage)?.featuredImage ?? null;
            const soldOut = c.products.nodes.every((p) => !p.availableForSale) && c.products.nodes.length < 4;
            return (
              <li key={c.id}>
                <Link href={`/collections/${c.handle}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-ink-2">
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.altText ?? c.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover opacity-80 transition duration-700 ease-luxe group-hover:scale-[1.03] group-hover:opacity-100"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <h2 className="font-display text-lg md:text-2xl tracking-[0.14em] uppercase">{c.title}</h2>
                      {c.description && <p className="mt-2 text-sm text-ivory/70 line-clamp-2 max-w-md">{c.description}</p>}
                    </div>
                    {soldOut && <SoldOutLabel className="absolute top-4 left-4" />}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
