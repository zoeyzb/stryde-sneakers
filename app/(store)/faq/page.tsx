import type { Metadata } from "next";
import Link from "next/link";
import EditorialPage from "@/components/content/EditorialPage";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about STRYDE orders, sizing, shipping and returns.",
};

const QUESTIONS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I know if something is in stock?",
    a: "Availability on every product page comes straight from our store inventory. If a size or piece shows as sold out, it can't be ordered. You can ask to be notified if it returns.",
  },
  {
    q: "Will sold-out pieces come back?",
    a: "Sometimes, but not always — we don't promise restocks. If you ask to be notified on a product page, we'll send you a single email if it becomes available again.",
  },
  {
    q: "How do I find my size?",
    a: "Each product page includes fit notes and a size guide where we have them. If you're between sizes, contact us with the piece and your usual size and we'll help.",
  },
  {
    q: "Which payment methods can I use?",
    a: "Payment options depend on our configured secure checkout provider. Available methods and order totals are shown at checkout before you pay. We do not see or store your card details.",
  },
  {
    q: "How much is shipping and how long does it take?",
    a: (
      <>
        Shipping options, prices and delivery estimates for your address are shown at checkout. See our{" "}
        <Link href="/shipping">shipping policy</Link> for details.
      </>
    ),
  },
  {
    q: "Are taxes and duties included?",
    a: "Taxes are calculated at checkout based on your shipping address. Any duties for international orders are shown at checkout where they apply.",
  },
  {
    q: "Can I cancel or change my order?",
    a: (
      <>
        <Link href="/contact">Contact us</Link> with your order number as soon as possible. Once an order has shipped it
        can&apos;t be changed or cancelled, but you can return it under our returns policy.
      </>
    ),
  },
  {
    q: "How do returns work?",
    a: (
      <>
        Our <Link href="/returns">returns policy</Link> explains what can be returned and how. You can view each
        order and its return options from your <Link href="/account">account</Link>.
      </>
    ),
  },
  {
    q: "Do I need an account to order?",
    a: "No. You can check out as a guest. An account lets you see your order history and track deliveries.",
  },
];

export default function FaqPage() {
  return (
    <EditorialPage handle="faq" eyebrow="Help" title="FAQ">
      <div className="border-t border-line">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q} className="group border-b border-line">
            <summary className="flex justify-between gap-6 py-5 cursor-pointer list-none text-sm font-semibold">
              {q}
              <span aria-hidden className="text-mist transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="pb-6 prose-stryde">
              <p>{a}</p>
            </div>
          </details>
        ))}
      </div>
    </EditorialPage>
  );
}
