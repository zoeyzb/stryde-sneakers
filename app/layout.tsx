import type { Metadata, Viewport } from "next";
import { Mulish } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import { getSiteUrl } from "@/lib/shopify/config";

const mulish = Mulish({ subsets: ["latin"], variable: "--font-mulish" });
const syncopate = localFont({
  src: "../public/fonts/Syncopate-Bold.ttf",
  variable: "--font-syncopate",
  weight: "700",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "STRYDE — Luxury Streetwear",
    template: "%s — STRYDE",
  },
  description:
    "STRYDE is a streetwear concept built around movement, contrast and presence. Discover Graphite, Oxblood and White.",
  openGraph: { siteName: "STRYDE", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mulish.variable} ${syncopate.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-3 focus:left-3 focus:bg-ivory focus:text-ink focus:px-4 focus:py-2 eyebrow"
        >
          Skip to content
        </a>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
