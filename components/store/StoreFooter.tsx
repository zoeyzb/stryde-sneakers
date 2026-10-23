import Link from "next/link";
import WaitlistForm from "@/components/waitlist/WaitlistForm";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Shop all" },
      { href: "/collections", label: "Collections" },
      { href: "/next-drop", label: "Next drop" },
      { href: "/cart", label: "Bag" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/account", label: "Account" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/about", label: "About" },
      { href: "/", label: "3D experience" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function StoreFooter() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-16 grid gap-12 lg:grid-cols-[1.3fr_2fr]">
        <div className="max-w-md">
          <p className="font-display text-2xl tracking-[0.35em]">STRYDE</p>
          <p className="mt-4 text-sm text-mist leading-6">
            Hear about the next drop first. One email when it opens — no countdowns, no noise.
          </p>
          <WaitlistForm source="next-drop" compact className="mt-6" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow text-mist mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ivory/80 hover:text-ivory">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-6 flex flex-col sm:flex-row justify-between gap-2 text-[11px] text-mist">
          <p>© {new Date().getFullYear()} STRYDE</p>
          <p>Payments, shipping and taxes are handled securely by Shopify checkout.</p>
        </div>
      </div>
    </footer>
  );
}
