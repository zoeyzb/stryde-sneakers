"use client";
import clsx from "clsx";
import Link from "next/link";
import { useParams } from "next/navigation";
import MusicStreamLine from "./MusicStreamLine";
import { BagButton } from "./store/StoreHeader";

const Header = () => {
  const dark = useParams()?.slug === "white";
  const color = dark ? "text-black" : "text-white";
  return (
    <header className="fixed z-10 flex justify-between items-center w-full md:pt-10 pt-3 md:px-20 px-5 pointer-events-none">
      <Link
        href="/"
        aria-label="STRYDE home"
        className={clsx(
          "pointer-events-auto h-16 flex items-center font-display text-xl md:text-2xl tracking-[0.35em] hover-animation",
          color
        )}
      >
        STRYDE
      </Link>
      <nav aria-label="Primary" className={clsx("pointer-events-auto flex items-center gap-6 md:gap-8", color)}>
        <Link href="/collections" className="eyebrow opacity-80 hover:opacity-100 transition-opacity hidden sm:inline">
          3D worlds
        </Link>
        <Link href="/shop" className="eyebrow opacity-80 hover:opacity-100 transition-opacity">
          Shop
        </Link>
        <BagButton />
        <MusicStreamLine color={dark ? "bg-black" : "bg-white"} />
      </nav>
    </header>
  );
};

export default Header;
