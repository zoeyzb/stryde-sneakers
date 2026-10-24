"use client";
import { useRef, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import Scene from "@/components/Scene";
import ScrollIndicator from "@/components/ScrollIndicator";
import StudioPurchasePanel from "@/components/StudioPurchasePanel";
import type { ShirtType } from "@/lib/textures";
import { garmentName } from "@/lib/garments";

export default function ShirtExperience({ shirtType }: { shirtType: ShirtType }) {
  const light = shirtType === "white";
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closePurchase() {
    setPurchaseOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <h1 className="sr-only">STRYDE {garmentName(shirtType)} — 3D studio</h1>
      <Scene shirtType={shirtType} />
      <ScrollIndicator shirtType={shirtType} />
      <Link
        href="/"
        className={clsx(
          "fixed z-20 bottom-[4.2rem] md:bottom-3 left-5 md:left-20 eyebrow text-[9px] px-4 py-2.5 transition-colors",
          light ? "bg-black/85 text-white hover:bg-black" : "bg-white/15 text-white border border-white/30 hover:bg-white/25"
        )}
      >
        ← All three
      </Link>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setPurchaseOpen(true)}
        className={clsx(
          "fixed z-20 bottom-3 right-5 md:right-20 eyebrow text-[9px] px-4 py-2.5 transition-colors",
          light ? "bg-black text-white hover:bg-black/80" : "bg-white text-black hover:bg-white/85"
        )}
      >
        Choose size · Add to bag ↗
      </button>
      {purchaseOpen && (
        <StudioPurchasePanel
          shirtType={shirtType}
          onClose={closePurchase}
          onAdded={() => setPurchaseOpen(false)}
        />
      )}
    </>
  );
}
