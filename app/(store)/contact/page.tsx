import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/content/ContactForm";
import { PageHeading } from "@/components/store/StoreStatus";
import { isEmailConfigured } from "@/lib/email";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with STRYDE about an order, sizing, returns or press.",
};

export default function ContactPage() {
  const to = process.env.STORE_CONTACT_EMAIL;
  const formEnabled = Boolean(to && isEmailConfigured());
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <PageHeading eyebrow="Help" title="Contact">
        <p>
          For order questions, include your order number. Many answers are already in the{" "}
          <Link href="/faq" className="underline underline-offset-4">FAQ</Link>.
        </p>
      </PageHeading>
      {formEnabled ? (
        <ContactForm />
      ) : to ? (
        <p className="text-sm">
          Email us at{" "}
          <a href={`mailto:${to}`} className="underline underline-offset-4">
            {to}
          </a>
          .
        </p>
      ) : (
        <div className="border border-line p-8">
          <p className="eyebrow text-mist">Not yet connected</p>
          <p className="mt-3 text-sm text-ivory/80 leading-6">
            Our contact inbox hasn&apos;t been connected to this site yet, so messages can&apos;t be sent from here.
          </p>
        </div>
      )}
    </div>
  );
}
