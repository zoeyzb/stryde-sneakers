import type { Metadata } from "next";
import Link from "next/link";
import EditorialPage from "@/components/content/EditorialPage";

export const metadata: Metadata = {
  title: "The Studio",
  description: "The idea behind STRYDE's three original scroll-driven 3D garment worlds.",
};

export default function AboutPage() {
  return (
    <EditorialPage handle="about" eyebrow="STRYDE / The studio" title="Less, with intent.">
      <div className="prose-stryde">
        <p>
          STRYDE begins with three garments and three environments: Graphite, Oxblood and White.
          Each one is an interactive design study. The story is told through the materials,
          the space and the movement of the garment itself.
        </p>
        <p>
          The main experience is the collection. Choose a world, then scroll through its
          original 3D sequence to see the piece from a different perspective.
        </p>
        <p>
          The shop is a working demonstration of choosing sizes and building a bag.
          Its images come from the same 3D garments, but no real inventory, orders
          or payments are connected.
        </p>
        <div className="not-prose mt-10 flex flex-wrap gap-4">
          <Link href="/collections" className="btn-primary">Enter the three worlds ↗</Link>
          <Link href="/shop" className="btn-ghost">View the collection</Link>
        </div>
      </div>
    </EditorialPage>
  );
}
