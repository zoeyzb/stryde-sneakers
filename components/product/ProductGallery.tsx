"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";
import type { ShopifyImage } from "@/lib/shopify/types";
import type { ShirtType } from "@/lib/textures";
import SoldOutLabel from "@/components/store/SoldOutLabel";

const ProductViewer3D = dynamic(() => import("./ProductViewer3D"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-ink-2 animate-pulse" />,
});

export default function ProductGallery({
  images,
  title,
  scene,
  soldOut,
}: {
  images: ShopifyImage[];
  title: string;
  scene: ShirtType | null;
  soldOut: boolean;
}) {
  const [show3D, setShow3D] = useState(false);
  const [active, setActive] = useState(0);
  const hero = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="relative aspect-[4/5] bg-ink-2 overflow-hidden">
        {show3D && scene ? (
          <ProductViewer3D scene={scene} label={`Interactive 3D view of ${title}`} />
        ) : hero ? (
          <Image
            src={hero.url}
            alt={hero.altText ?? title}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className={clsx("object-cover saturate-[.7] contrast-[1.04]", soldOut && "grayscale-[50%] opacity-80")}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center eyebrow text-mist">STRYDE</div>
        )}
        {soldOut && <SoldOutLabel large className="absolute left-4 top-4 z-10" />}
        {scene && (
          <button
            type="button"
            onClick={() => setShow3D((v) => !v)}
            aria-pressed={show3D}
            className="absolute right-4 top-4 z-10 eyebrow bg-ink/70 backdrop-blur-sm border border-ivory/25 px-3 py-2 hover:border-ivory"
          >
            {show3D ? "View photos" : "Explore 3D concept"}
          </button>
        )}
      </div>
      {scene && <p className="text-[11px] leading-5 text-mist">Interactive 3D garment study. Illustrative preview, not a manufacturing-accurate product model.</p>}
      {images.length > 1 && (
        <ul className="flex gap-3 overflow-x-auto snap-x pb-1" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.url} className="snap-start shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  setShow3D(false);
                }}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={!show3D && i === active}
                className={clsx(
                  "relative block w-20 aspect-[4/5] bg-ink-2 overflow-hidden border transition-colors",
                  !show3D && i === active ? "border-ivory" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover saturate-[.7] contrast-[1.04]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
