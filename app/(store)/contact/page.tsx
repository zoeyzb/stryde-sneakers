import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/store/StoreStatus";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact information for the STRYDE preview.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <PageHeading eyebrow="Studio preview" title="Contact" />
      <div className="prose-stryde">
        <h2>About this preview</h2>
        <p>This is a portfolio-style STRYDE e-commerce demonstration. Its shopping experience is interactive, but the site does not accept real orders or customer service enquiries.</p>
        <p>No contact form or support inbox is collecting messages here. For now, explore the collection or return to the 3D studio.</p>
        <p className="mt-10"><Link href="/shop" className="underline underline-offset-4">Back to the collection →</Link></p>
      </div>
    </div>
  );
}
