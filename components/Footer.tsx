"use client";
import clsx from "clsx";
import Link from "next/link";
import { useParams } from "next/navigation";

const Footer = () => {
  const color = useParams()?.slug === "white" ? "text-black" : "text-white";
  return (
    <footer
      className={clsx(
        "fixed z-10 flex justify-start items-center md:gap-6 gap-3 bottom-3 md:px-20 px-5 md:text-[10px] text-[9px] tracking-[0.25em] text-nowrap",
        color
      )}
    >
      <p className="opacity-70">© STRYDE</p>
      <Link href="/about" className="hover-animation hidden sm:inline">
        ABOUT
      </Link>
      <Link href="/faq" className="hover-animation hidden sm:inline">
        HELP
      </Link>
    </footer>
  );
};

export default Footer;
