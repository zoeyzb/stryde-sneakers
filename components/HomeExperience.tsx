"use client";
import { MainStudioModel } from "@/components/MainStudioModel";
import { View } from "@react-three/drei";
import Link from "next/link";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { GARMENTS } from "@/lib/garments";

export type HomeCollectionStatus = "available" | "sold-out" | "unknown";

export default function HomeExperience({ status }: { status: HomeCollectionStatus }) {
  const isMobile = useMediaQuery({ maxWidth: 400 });
  const [currentIndex, setCurrentIndex] = useState(1);
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };
  const handleNext = () => {
    if (currentIndex < 2) setCurrentIndex((prev) => prev + 1);
  };
  return (
    <>
      <h1 className="sr-only">STRYDE — explore the collection in 3D</h1>
      <View className="w-full h-dvh">
        <MainStudioModel currentIndex={currentIndex} scale={isMobile ? 0.8 : 1} />
      </View>

      <div className="absolute z-10 inset-x-0 bottom-12 md:bottom-14 flex flex-col items-center gap-4 pointer-events-none px-5">
        {status === "sold-out" ? (
          <div className="text-center">
            <p className="font-display text-[10px] md:text-xs tracking-[0.4em] text-white">THE COLLECTION IS UNAVAILABLE</p>
            <p className="mt-2 text-[10px] tracking-[0.2em] text-white/60">EVERY PIECE HAS SOLD OUT</p>
          </div>
        ) : (
          <p className="text-white/80 md:text-xs text-[10px] font-medium tracking-[0.3em]">SELECT A PIECE TO EXPLORE</p>
        )}
        <nav aria-label="Garments" className="pointer-events-auto flex flex-wrap justify-center gap-2">
          {GARMENTS.map((g) => (
            <Link
              key={g.slug}
              href={`/shirts/${g.slug}`}
              className="eyebrow text-[9px] text-white/80 border border-white/20 px-3 py-2 hover:border-white hover:text-white transition-colors backdrop-blur-sm"
            >
              {g.name}
            </Link>
          ))}
          <Link
            href={status === "sold-out" ? "/next-drop" : "/shop"}
            className="eyebrow text-[9px] bg-white text-black px-4 py-2 hover:bg-white/85 transition-colors"
          >
            {status === "sold-out" ? "Join the next drop" : "Shop the collection"}
          </Link>
        </nav>
      </div>

      <button
        type="button"
        aria-label="Previous piece"
        className="absolute z-20 top-1/2 left-4 bg-white mask-[url(/icons/left.svg)] size-12 mask-no-repeat hover-animation md:hidden block disabled:opacity-20"
        disabled={currentIndex === 0}
        onClick={handlePrev}
      />
      <button
        type="button"
        aria-label="Next piece"
        className="absolute z-20 top-1/2 right-4 bg-white mask-[url(/icons/right.svg)] size-12 mask-no-repeat hover-animation md:hidden block disabled:opacity-20"
        disabled={currentIndex === 2}
        onClick={handleNext}
      />
    </>
  );
}
