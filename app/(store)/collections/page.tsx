import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DEMO_COLLECTIONS } from "@/lib/demo/catalog";

export const metadata: Metadata = {
  title: "Three Worlds",
  description: "Enter STRYDE's three original scroll-driven 3D experiences: Graphite, Oxblood and White.",
};

const SCENE: Record<string, string> = { graphite: "gray", oxblood: "sport", white: "white" };
const NUMERAL = ["I", "II", "III"];

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10">
      <header className="pt-16 md:pt-24 pb-12 md:pb-20">
        <p className="eyebrow text-mist">STRYDE / The original collection</p>
        <h1 className="mt-8 font-display text-3xl sm:text-5xl lg:text-7xl tracking-[.07em] uppercase leading-[1.1]">
          Three worlds.<br />One story.
        </h1>
        <p className="mt-8 max-w-xl text-sm text-ivory/65 leading-7">
          Choose a garment. Enter its environment. Scroll through the details. Nothing more to distract from the experience.
        </p>
      </header>
      <ul className="grid gap-8 lg:grid-cols-3">
        {DEMO_COLLECTIONS.map((collection, index) => (
          <li key={collection.id} className="min-w-0">
            <Link href={`/shirts/${SCENE[collection.handle]}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-ink-2">
                {collection.image && (
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText ?? collection.title}
                    fill
                    priority={index === 0}
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.035]"
                  />
                )}
                <span className="absolute left-5 top-5 eyebrow bg-ink/75 px-3 py-2">{NUMERAL[index]} / III</span>
                <span className="absolute bottom-5 right-5 eyebrow bg-ink/80 border border-ivory/30 px-4 py-3">Enter the 3D studio ↗</span>
              </div>
              <div className="flex items-start justify-between gap-5 mt-6">
                <div>
                  <h2 className="font-display text-lg md:text-xl tracking-[.1em] uppercase">{collection.title}</h2>
                  <p className="mt-3 text-sm text-mist leading-6">{collection.description}</p>
                </div>
                <span className="text-xl text-mist group-hover:text-ivory transition-colors" aria-hidden>↗</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-24 pt-8 border-t border-line flex flex-wrap items-center justify-between gap-5">
        <p className="text-sm text-mist">A focused collection of three interactive pieces.</p>
        <Link href="/shop" className="eyebrow hover:text-mist">View the demo shop →</Link>
      </div>
    </div>
  );
}
