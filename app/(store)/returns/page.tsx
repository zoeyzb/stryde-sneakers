import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/store/StoreStatus";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Returns information for the STRYDE preview.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <PageHeading eyebrow="Studio preview" title="Returns & Refunds" />
      <div className="prose-stryde">
        <h2>No purchases or refunds</h2>
        <p>This is a demonstration, so there are no completed orders, payments, shipments or eligible returns. The checkout experience ends with a sold-out notice.</p>
        <p>If STRYDE begins real retail operations, a full returns policy would be published before checkout is enabled.</p>
        <p className="mt-10"><Link href="/shop" className="underline underline-offset-4">Back to the collection →</Link></p>
      </div>
    </div>
  );
}
