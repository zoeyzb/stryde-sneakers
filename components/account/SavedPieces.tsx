"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/lib/useWishlist";

export default function SavedPieces() {
  const { items, toggle } = useWishlist();
  return (
    <section aria-labelledby="saved-heading" className="mt-16">
      <h2 id="saved-heading" className="eyebrow text-mist mb-2">
        Saved pieces
      </h2>
      <p className="text-xs text-mist mb-6">Saved on this device only.</p>
      {items.length === 0 ? (
        <p className="text-sm text-ivory/70">
          Nothing saved yet. Use “Save to wishlist” on any product.
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map((item) => (
            <li key={item.handle}>
              <Link href={`/products/${item.handle}`} className="block">
                <div className="relative aspect-[4/5] bg-ink-2 overflow-hidden">
                  {item.image && <Image src={item.image} alt={item.title} fill sizes="200px" className="object-cover" />}
                </div>
                <p className="mt-2 text-xs truncate">{item.title}</p>
              </Link>
              <button type="button" className="text-[11px] text-mist underline underline-offset-4" onClick={() => toggle(item)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
