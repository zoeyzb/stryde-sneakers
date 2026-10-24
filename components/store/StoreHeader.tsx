"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useCart } from "@/components/cart/CartProvider";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/about", label: "About" },
];

export function BagButton({ className }: { className?: string }) {
  const { cart, open } = useCart();
  const count = cart?.totalQuantity ?? 0;
  return (
    <button
      type="button"
      onClick={open}
      className={clsx("eyebrow hover:opacity-100 opacity-80 transition-opacity", className)}
      aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
    >
      Bag ({count})
    </button>
  );
}

export default function StoreHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-[1600px] flex items-center justify-between h-16 px-5 md:px-10">
        <div className="flex items-center gap-10">
          <Link href="/" className="font-display text-lg tracking-[0.35em]" aria-label="STRYDE home">
            STRYDE
          </Link>
          <nav aria-label="Primary" className="hidden lg:flex gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href || (item.href !== "/" && !item.href.includes("?") && pathname.startsWith(item.href + "/")) ? "page" : undefined}
                className={clsx(
                  "eyebrow transition-opacity",
                  pathname === item.href || (item.href !== "/" && !item.href.includes("?") && pathname.startsWith(item.href + "/")) ? "opacity-100" : "opacity-60 hover:opacity-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/shop#search" className="eyebrow opacity-80 hover:opacity-100 hidden sm:inline">
            Search
          </Link>
          <Link href="/account" className="eyebrow opacity-80 hover:opacity-100 hidden sm:inline">
            Account
          </Link>
          <BagButton />
          <button
            type="button"
            className="lg:hidden eyebrow"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="lg:hidden border-t border-line px-5 py-6 flex flex-col gap-5">
          {[...NAV, { href: "/shop#search", label: "Search" }, { href: "/account", label: "Account" }].map((item) => (
            <Link key={item.href} href={item.href} className="eyebrow text-sm">
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
