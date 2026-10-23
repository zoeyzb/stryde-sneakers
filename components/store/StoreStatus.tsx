import Link from "next/link";
import WaitlistForm from "@/components/waitlist/WaitlistForm";

export function NotConnected({ what = "The catalogue" }: { what?: string }) {
  return (
    <div className="border border-line px-6 py-16 text-center">
      <p className="eyebrow text-mist">Store not connected</p>
      <p className="mt-4 text-sm text-ivory/80 max-w-md mx-auto leading-6">
        {what} will appear here once this site is connected to the STRYDE Shopify store. Nothing can be
        purchased until then.
      </p>
    </div>
  );
}

export function StoreError() {
  return (
    <div className="border border-line px-6 py-16 text-center" role="alert">
      <p className="eyebrow text-mist">Temporarily unavailable</p>
      <p className="mt-4 text-sm text-ivory/80">We couldn&apos;t reach the store just now. Please refresh in a moment.</p>
    </div>
  );
}

/** Shown when every piece in the presented collection is genuinely out of stock. */
export function CollectionUnavailable({ title }: { title?: string }) {
  return (
    <section className="relative overflow-hidden border border-line px-6 py-16 md:py-24 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(243,239,231,0.06),transparent_65%)]" />
      <p className="eyebrow text-mist">{title ?? "Current collection"}</p>
      <h2 className="mt-6 font-display text-2xl md:text-4xl tracking-[0.14em] uppercase leading-tight">
        The Collection
        <br />
        Is Unavailable
      </h2>
      <p className="mt-6 text-sm text-ivory/75 max-w-lg mx-auto leading-6">
        Every piece from this collection has sold out. Browse it below, ask to be notified about a specific piece, or
        join the list to hear when the next collection opens.
      </p>
      <div className="mt-10 max-w-md mx-auto text-left">
        <WaitlistForm source="next-drop" />
      </div>
      <Link href="/next-drop" className="inline-block mt-8 eyebrow text-mist hover:text-ivory">
        About the next drop →
      </Link>
    </section>
  );
}

export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="py-14 md:py-20">
      {eyebrow && <p className="eyebrow text-mist mb-5">{eyebrow}</p>}
      <h1 className="font-display text-3xl md:text-5xl tracking-[0.1em] uppercase leading-[1.1]">{title}</h1>
      {children && <div className="mt-6 max-w-2xl text-sm leading-7 text-ivory/75">{children}</div>}
    </div>
  );
}
