import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDemoCollection } from "@/lib/demo/catalog";
import { HANDLE } from "@/lib/validation";

type Params = Promise<{ handle: string }>;
const SCENE: Record<string, string> = { graphite: "gray", oxblood: "sport", white: "white" };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = await params;
  const collection = getDemoCollection(handle);
  return collection ? { title: collection.title, description: collection.description } : { title: "Collection" };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { handle } = await params;
  if (!HANDLE.test(handle) || !getDemoCollection(handle) || !SCENE[handle]) notFound();
  redirect(`/shirts/${SCENE[handle]}`);
}
