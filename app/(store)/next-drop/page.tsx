import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Next Drop",
  description: "The next STRYDE collection is coming.",
};

export default function NextDropPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <section className="text-center py-24 md:py-36">
        <p className="eyebrow text-mist">STRYDE / Studio preview</p>
        <h1 className="mt-8 font-display text-4xl md:text-6xl tracking-[0.1em] uppercase leading-tight">
          The next drop
        </h1>
        <p className="mx-auto max-w-lg mt-8 text-sm leading-7 text-ivory/75">
          Another collection is on the horizon. This is a demonstration, so restock registrations
          and purchases are not being accepted yet.
        </p>
        <div className="mt-12 flex justify-center gap-4">
          <Link href="/collections" className="btn-primary">View collections</Link>
          <Link href="/" className="btn-ghost">Back to 3D studio</Link>
        </div>
      </section>
    </div>
  );
}
