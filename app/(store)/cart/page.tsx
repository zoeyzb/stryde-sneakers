import type { Metadata } from "next";
import CartContents from "@/components/cart/CartContents";
import { PageHeading } from "@/components/store/StoreStatus";

export const metadata: Metadata = { title: "Bag", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 md:px-10">
      <PageHeading eyebrow="STRYDE" title="Your bag" />
      <CartContents />
    </div>
  );
}
