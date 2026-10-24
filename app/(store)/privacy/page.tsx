import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/store/StoreStatus";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the STRYDE demo storefront.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <PageHeading eyebrow="Studio preview" title="Privacy" />
      <div className="prose-stryde">
        <h2>What this demonstration stores</h2>
        <p>Your demo bag and saved pieces are stored in your browser to keep the preview usable between page visits. You can clear that data through your browser settings. No checkout account or payment details are requested by the demo flow.</p>
        <p>Like other hosted sites, the hosting provider may process routine technical information required to serve pages. This informational page is not a production privacy policy.</p>
        <p className="mt-10"><Link href="/shop" className="underline underline-offset-4">Back to the collection →</Link></p>
      </div>
    </div>
  );
}
