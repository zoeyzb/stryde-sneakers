"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import MusicStreamLine from "./MusicStreamLine";
export default function Header() {
  const light = useParams()?.slug === "white";
  return <header className={"stryde-nav "+(light?"stryde-nav-light":"")}>
    <Link href="/" className="stryde-wordmark" aria-label="STRYDE homepage">STRYDE</Link>
    <nav aria-label="Primary navigation" className="stryde-nav-links">
      <Link href="/#collection">Collection</Link>
      <Link href="/shirts/sport">Explore 3D</Link>
    </nav>
    <MusicStreamLine color={light?"text-black":"text-white"}/>
  </header>;
}
