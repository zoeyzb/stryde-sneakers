import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import ViewCanvas from "@/components/ViewCanvas";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const mulish = Mulish({
  subsets: ["cyrillic"],
});

export const metadata: Metadata = {
  title: "STRYDE — Performance Apparel | Interactive 3D Collection",
  description:
    "Explore STRYDE, an interactive performance-apparel concept with immersive 3D garments and creative motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mulish.className} antialiased`}>
        <ViewCanvas />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
