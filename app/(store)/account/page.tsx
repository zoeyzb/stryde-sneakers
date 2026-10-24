import type { Metadata } from "next";
import Link from "next/link";
import SavedPieces from "@/components/account/SavedPieces";
import { PageHeading } from "@/components/store/StoreStatus";

export const metadata: Metadata = { title: "Your studio", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 md:px-10">
      <PageHeading eyebrow="STRYDE / Demo" title="Your studio" />
      <div className="border border-line p-8">
        <p className="eyebrow text-mist">Guest preview</p>
        <p className="mt-4 text-sm leading-7 text-ivory/75">
          You can save pieces locally while exploring. Customer sign-in, order history and payment are intentionally
          unavailable in this demonstration — no account information is collected.
        </p>
        <Link href="/shop" className="btn-ghost mt-6">Explore the shop</Link>
      </div>
      <div className="mt-14"><SavedPieces /></div>
    </div>
  );
}
