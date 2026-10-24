import Link from "next/link";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col bg-ink">
      <StoreHeader />
      <main id="main" className="flex-1 grid place-items-center px-5 py-32 text-center">
        <div>
          <p className="eyebrow text-mist">404</p>
          <h1 className="mt-6 font-display text-3xl md:text-5xl tracking-[0.12em] uppercase">Not found</h1>
          <p className="mt-6 text-sm text-ivory/75">This page doesn&apos;t exist, or the piece is no longer listed.</p>
          <Link href="/shop" className="btn-ghost mt-10">
            Back to the shop
          </Link>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
