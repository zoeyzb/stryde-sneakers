import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DEMO_PRODUCTS } from "@/lib/demo/catalog";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "A closer look at the STRYDE studio preview collection.",
};

const STORIES = [
  {
    index: "01",
    eyebrow: "The everyday uniform",
    title: "Form follows feeling.",
    body: "A quiet silhouette, worn on repeat. Heavy jersey, clean lines, no unnecessary noise.",
    product: DEMO_PRODUCTS[0],
    side: "right",
  },
  {
    index: "02",
    eyebrow: "Layers in motion",
    title: "Built to move.",
    body: "Pieces that transition with you. Familiar forms reframed through proportion and texture.",
    product: DEMO_PRODUCTS[2],
    side: "left",
  },
  {
    index: "03",
    eyebrow: "The archive",
    title: "Nothing stays forever.",
    body: "Each drop becomes part of the story. Sold-out pieces remain visible as an archive of the studio.",
    product: DEMO_PRODUCTS[5],
    side: "right",
  },
];

export default function LookbookPage() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto max-w-[1600px] px-5 md:px-10 pt-20 pb-24 md:pt-32 md:pb-36">
        <p className="eyebrow text-mist">STRYDE / Volume 001 / Studio preview</p>
        <h1 className="mt-8 font-display text-4xl sm:text-6xl lg:text-8xl tracking-[.06em] leading-[1.05] uppercase">
          The way<br />we move.
        </h1>
        <div className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <p className="max-w-xl text-sm leading-7 text-ivory/70">
            An editorial study in everyday garments, shape and motion. The images and pieces here are illustrative concepts from the STRYDE demonstration.
          </p>
          <Link href="/shop" className="btn-primary self-start">Explore the drop ↗</Link>
        </div>
      </section>
      <div className="border-y border-line">
        {STORIES.map((story) => (
          <section key={story.index} className="mx-auto max-w-[1600px] grid lg:grid-cols-2 lg:min-h-[680px] border-b border-line last:border-0">
            <div className={`relative aspect-[4/5] lg:aspect-auto min-h-[360px] bg-ink-2 overflow-hidden ${story.side === "left" ? "lg:order-2" : ""}`}>
              {story.product.featuredImage && (
                <Image
                  src={story.product.featuredImage.url}
                  alt={story.product.featuredImage.altText ?? story.product.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover saturate-[.7] contrast-[1.05]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
              <span className="absolute bottom-8 left-8 eyebrow">{story.index} / 03</span>
            </div>
            <div className="flex flex-col justify-center px-6 md:px-16 py-16 md:py-28">
              <p className="eyebrow text-mist">{story.eyebrow}</p>
              <h2 className="mt-7 font-display text-2xl md:text-4xl leading-tight tracking-[.08em] uppercase">{story.title}</h2>
              <p className="mt-7 max-w-md text-sm leading-7 text-ivory/70">{story.body}</p>
              <Link href={`/products/${story.product.handle}`} className="self-start mt-10 btn-ghost">
                Explore the piece ↗
              </Link>
            </div>
          </section>
        ))}
      </div>
      <section className="mx-auto max-w-[1600px] px-5 md:px-10 py-24 md:py-36 text-center">
        <p className="eyebrow text-mist">Every silhouette has a story</p>
        <h2 className="mt-7 font-display text-2xl md:text-5xl uppercase tracking-[.08em]">The collection awaits.</h2>
        <div className="mt-10 flex gap-4 justify-center flex-wrap">
          <Link href="/collections" className="btn-primary">View collections</Link>
          <Link href="/" className="btn-ghost">Enter the 3D studio</Link>
        </div>
      </section>
    </div>
  );
}
