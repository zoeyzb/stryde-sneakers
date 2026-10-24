"use client";
import Link from "next/link";
import clsx from "clsx";
import Scene from "@/components/Scene";
import ScrollIndicator from "@/components/ScrollIndicator";
import type { ShirtType } from "@/lib/textures";
import { garmentName } from "@/lib/garments";

export default function ShirtExperience({ shirtType }: { shirtType: ShirtType }) {
  const light = shirtType === "white";
  return (
    <>
      <h1 className="sr-only">STRYDE {garmentName(shirtType)} — 3D studio</h1>
      <Scene shirtType={shirtType} />
      <ScrollIndicator shirtType={shirtType} />
      <Link
        href={`/shop?scene=${shirtType}`}
        className={clsx(
          "fixed z-20 bottom-3 right-5 md:right-20 eyebrow text-[9px] px-4 py-2.5 transition-colors",
          light ? "bg-black text-white hover:bg-black/80" : "bg-white text-black hover:bg-white/85"
        )}
      >
        Shop {garmentName(shirtType)}
      </Link>
    </>
  );
}
