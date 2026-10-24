import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/store/StoreStatus";

export const metadata: Metadata = {
  title: "Shipping",
  description: "How shipping works in the STRYDE demonstration.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <PageHeading eyebrow="Studio preview" title="Shipping" />
      <div className="prose-stryde">
        <h2>No shipping in the preview</h2>
        <p>STRYDE is currently a demonstration storefront. You can browse clothing and build a bag, but you cannot place an order. No shipping fees, delivery dates, tracking numbers or addresses are collected.</p>
        <p>Shipping methods and rates would be shown here before a real store opened. None are being offered through this preview.</p>
        <p className="mt-10"><Link href="/shop" className="underline underline-offset-4">Back to the collection →</Link></p>
      </div>
    </div>
  );
}
