import type { Metadata } from "next";
import Link from "next/link";
import EditorialPage from "@/components/content/EditorialPage";

export const metadata: Metadata = {
  title: "About",
  description: "STRYDE is a streetwear studio releasing considered pieces in limited collections.",
};

export default function AboutPage() {
  return (
    <EditorialPage handle="about" eyebrow="The studio" title="About STRYDE">
      <div className="prose-stryde">
        <p>
          STRYDE is a streetwear studio. We design a small number of pieces at a time — tees, hoodies, jackets and pants
          — and release them as collections rather than as a constant stream of product.
        </p>
        <p>
          Each collection is presented first as an interactive 3D studio, so you can explore the garments the way we see
          them while they are being made. When a collection sells out, it stays visible here as part of the archive and
          we move on to the next one.
        </p>
        <h2>How drops work</h2>
        <p>
          This interactive storefront preview uses illustrative product imagery, prices and availability. No orders
          or payments are accepted. See what comes next on the{" "}
          <Link href="/next-drop">next drop</Link> page.
        </p>
      </div>
    </EditorialPage>
  );
}
