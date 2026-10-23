import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShirtExperience from "@/components/ShirtExperience";
import { GARMENTS, garmentName } from "@/lib/garments";
import type { ShirtType } from "@/lib/textures";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return GARMENTS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${garmentName(slug as ShirtType)} — 3D studio`,
    description: `Explore the STRYDE ${garmentName(slug as ShirtType)} piece in an interactive 3D studio.`,
  };
}

export default async function ShirtPage({ params }: { params: Params }) {
  const { slug } = await params;
  const garment = GARMENTS.find((g) => g.slug === slug);
  if (!garment) notFound();
  return <ShirtExperience shirtType={garment.slug} />;
}
