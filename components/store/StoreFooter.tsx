import Link from "next/link";

const STUDIO = [
  { href: "/", label: "The collection" },
  { href: "/about", label: "Our story" },
];
const SUPPORT = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function StoreFooter() {
  return (
    <footer className="border-t border-line mt-20">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-12 flex flex-col lg:flex-row lg:justify-between gap-10">
        <div>
          <Link href="/" aria-label="STRYDE home" className="font-display text-xl tracking-[.35em]">STRYDE</Link>
          <p className="mt-4 text-sm text-mist">Move with intention.</p>
        </div>
        <nav aria-label="Studio" className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {STUDIO.map((item) => (
            <Link key={item.href} href={item.href} className="eyebrow opacity-75 hover:opacity-100">{item.label}</Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {SUPPORT.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-mist hover:text-ivory">{item.label}</Link>
            ))}
          </div>
          <div className="text-[11px] text-mist leading-6 lg:text-right">
            <p>© {new Date().getFullYear()} STRYDE</p>
            <p>Studio demo only · No orders or payments accepted</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
