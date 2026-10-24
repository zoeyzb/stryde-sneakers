import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/store/StoreStatus";

export const metadata: Metadata = { title: "FAQ", description: "Questions about the STRYDE studio preview." };

const QUESTIONS = [
  { q: "Can I place an order?", a: "Not in this preview. You can browse, select sizes and add pieces to a demo bag. Checkout ends with a sold-out message and never charges you." },
  { q: "Are these prices and stock levels real?", a: "No. They illustrate what a working clothing storefront looks like. Photographs are illustrative too." },
  { q: "Does my bag stay saved?", a: "Yes, within this browser. Your bag and wishlist are kept in local browser storage so you can return to them." },
  { q: "Can I choose a size?", a: "Yes. Open a product, select XS through XL, and add that variant to your bag. You can adjust quantities or remove it later." },
  { q: "Can I pay, get shipping, or make a return?", a: "No payment, fulfilment or return service is connected. The demo collects no delivery address or card details." },
  { q: "What happens when I checkout?", a: "You reach the final Sold Out page, which confirms that no order was placed and no payment was taken." },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <PageHeading eyebrow="Help / Studio preview" title="FAQ" />
      <div className="border-t border-line">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q} className="group border-b border-line">
            <summary className="flex justify-between gap-6 py-5 cursor-pointer list-none text-sm font-semibold">
              {q}<span aria-hidden className="text-mist transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="pb-6 text-sm text-ivory/75 leading-7">{a}</p>
          </details>
        ))}
      </div>
      <Link href="/shop" className="btn-ghost mt-10">Explore the shop</Link>
    </div>
  );
}
