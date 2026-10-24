import type { Metadata } from "next";
import Link from "next/link";
import EditorialPage from "@/components/content/EditorialPage";

export const metadata: Metadata = {
  title: "The Studio",
  description: "The point of view behind STRYDE: movement, restraint, and streetwear with presence.",
};

export default function AboutPage() {
  return (
    <EditorialPage handle="about" eyebrow="STRYDE / The idea" title="Every step says something.">
      <div className="prose-stryde">
        <p>
          Before a room knows your name, it knows how you carry yourself.
          STRYDE lives in that moment — the quiet confidence of moving on your own terms.
        </p>
        <p>
          Our point of view is built on contrast. Shadow and light. Restraint and energy.
          Movement and stillness. Nothing excessive. Nothing asking for permission.
        </p>
        <p>
          Graphite holds the line. Oxblood brings the pulse. White leaves room to breathe.
          Three expressions of the same idea: wear what feels like you, and let the rest follow.
        </p>
        <div className="not-prose mt-12 border-t border-line pt-9">
          <p className="eyebrow text-mist mb-6">The collection / Volume 001</p>
          <Link href="/" className="btn-primary inline-flex">Meet the three pieces ↗</Link>
        </div>
      </div>
    </EditorialPage>
  );
}
