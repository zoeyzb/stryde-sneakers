import type { Metadata } from "next";
import Link from "next/link";
import { loadShopPage } from "@/components/content/EditorialPage";
import ProductGrid from "@/components/store/ProductGrid";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { getCollection, getCollectionAvailability, isStorefrontConfigured } from "@/lib/shopify";
import { CURRENT_COLLECTION_HANDLE, UPCOMING_COLLECTION_HANDLE } from "@/lib/shopify/config";
import type { Collection } from "@/lib/shopify/types";

export const metadata: Metadata = {
  title: "Next Drop",
  description: "Join the STRYDE list to hear when the next collection opens.",
};

async function loadUpcoming(): Promise<Collection | null> {
  if (!isStorefrontConfigured()) return null;
  try {
    return await getCollection(UPCOMING_COLLECTION_HANDLE, { first: 8 });
  } catch {
    return null;
  }
}

async function currentSoldOut() {
  if (!isStorefrontConfigured()) return false;
  try {
    return (await getCollectionAvailability(CURRENT_COLLECTION_HANDLE)) === "sold-out";
  } catch {
    return false;
  }
}

export default async function NextDropPage() {
  const [page, upcoming, soldOut] = await Promise.all([loadShopPage("next-drop"), loadUpcoming(), currentSoldOut()]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      <section className="relative overflow-hidden py-20 md:py-32 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(243,239,231,0.08),transparent_60%)]"
        />
        <p className="eyebrow text-mist">{soldOut ? "The current collection has sold out" : "STRYDE"}</p>
        <h1 className="mt-6 font-display text-3xl md:text-6xl tracking-[0.12em] uppercase leading-[1.05]">
          {page?.title ?? "The Next Drop"}
        </h1>
        {page?.body ? (
          <div className="prose-stryde mt-8 max-w-xl mx-auto" dangerouslySetInnerHTML={{ __html: page.body }} />
        ) : (
          <p className="mt-8 max-w-xl mx-auto text-sm leading-7 text-ivory/75">
            We release STRYDE in collections. The next one opens when it&apos;s ready — we don&apos;t announce dates we
            can&apos;t keep. Join the list and we&apos;ll email you when it&apos;s live.
          </p>
        )}
        <div className="mt-12 max-w-md mx-auto text-left">
          <WaitlistForm source="next-drop" />
        </div>
      </section>

      {upcoming && upcoming.products.nodes.length > 0 && (
        <section aria-labelledby="upcoming-heading" className="mt-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow text-mist mb-3">Upcoming collection</p>
              <h2 id="upcoming-heading" className="font-display text-xl md:text-2xl tracking-[0.12em] uppercase">
                {upcoming.title}
              </h2>
            </div>
            <Link href={`/collections/${upcoming.handle}`} className="eyebrow text-mist hover:text-ivory">
              View all →
            </Link>
          </div>
          {upcoming.description && <p className="mb-10 max-w-2xl text-sm leading-7 text-ivory/75">{upcoming.description}</p>}
          <ProductGrid products={upcoming.products.nodes} />
        </section>
      )}
    </div>
  );
}
