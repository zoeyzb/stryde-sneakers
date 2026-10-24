"use client";
import { MainStudioModel } from "@/components/MainStudioModel";
import { View } from "@react-three/drei";
import Link from "next/link";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { GARMENTS } from "@/lib/garments";

export default function HomeExperience() {
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

      <div className="absolute z-10 inset-x-0 bottom-14 md:bottom-16 flex flex-col items-center gap-5 pointer-events-none px-5">
        <p className="text-white/80 md:text-xs text-[10px] font-medium tracking-[0.3em] text-center">
          THREE WORLDS · CHOOSE A PIECE · SCROLL TO EXPLORE
        </p>
        <nav aria-label="Garments" className="pointer-events-auto flex flex-wrap justify-center gap-2">
          {GARMENTS.map((g) => (
            <Link
              key={g.slug}
              href={`/shirts/${g.slug}`}
              className="eyebrow text-[10px] text-white/85 border border-white/25 px-5 py-3 hover:border-white hover:text-white transition-colors backdrop-blur-sm"
            >
              {g.name}
            </Link>
          ))}
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
