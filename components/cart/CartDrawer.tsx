"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useCart } from "./CartProvider";
import CartContents from "./CartContents";

export default function CartDrawer() {
  const { isOpen, close, cart } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [isOpen, close]);

  if (pathname === "/cart") return null;

  return (
    <div className={clsx("fixed inset-0 z-50", !isOpen && "pointer-events-none")} aria-hidden={!isOpen}>
      <div
        className={clsx(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-luxe",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabIndex={-1}
        inert={!isOpen}
        className={clsx(
          "absolute right-0 top-0 h-full w-full max-w-md bg-ink border-l border-line flex flex-col outline-none transition-transform duration-500 ease-luxe",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-line">
          <p className="eyebrow">Bag {cart?.totalQuantity ? `(${cart.totalQuantity})` : ""}</p>
          <button type="button" onClick={close} className="eyebrow text-mist hover:text-ivory">
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isOpen && <CartContents onNavigate={close} />}
        </div>
      </div>
    </div>
  );
}
