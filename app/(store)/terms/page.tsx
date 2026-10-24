import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/store/StoreStatus";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the STRYDE demonstration.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <PageHeading eyebrow="Studio preview" title="Terms of Use" />
      <div className="prose-stryde">
        <h2>Preview only</h2>
        <p>STRYDE is presented here as an interactive design and shopping demonstration. Product names, photographs, prices, stock labels and availability are illustrative and do not constitute an offer to sell.</p>
        <p>You can explore the collection and add pieces to your local demo bag. Checkout never collects money or creates a purchase. No fulfilment or post-purchase service is provided.</p>
        <p className="mt-10"><Link href="/shop" className="underline underline-offset-4">Back to the collection →</Link></p>
      </div>
    </div>
  );
}
