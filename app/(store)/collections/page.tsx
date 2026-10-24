import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeading } from "@/components/store/StoreStatus";
import { DEMO_COLLECTIONS } from "@/lib/demo/catalog";

export const metadata: Metadata = {
  title: "Collections",
  description: "Discover the STRYDE studio collections.",
};

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      <PageHeading eyebrow="STRYDE / Studio preview" title="Collections">
        Distinct silhouettes, the same considered point of view.
      </PageHeading>
      <ul className="grid gap-6 md:grid-cols-2">
        {DEMO_COLLECTIONS.map((collection) => (
          <li key={collection.id}>
            <Link href={`/collections/${collection.handle}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-ink-2">
                {collection.image && <Image
                  src={collection.image.url}
                  alt={collection.image.altText ?? collection.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover opacity-80 transition duration-700 ease-luxe group-hover:scale-[1.03] group-hover:opacity-100"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <h2 className="font-display text-xl md:text-2xl tracking-[0.14em] uppercase">{collection.title}</h2>
                  <p className="mt-3 text-sm text-ivory/75">{collection.description}</p>
                  <span className="mt-5 inline-block eyebrow">Explore collection →</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
