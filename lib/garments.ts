import type { ShirtType } from "./textures";

/** The three garments presented in the 3D studio, in on-screen order (left → right). */
export const GARMENTS: { slug: ShirtType; name: string }[] = [
  { slug: "gray", name: "Graphite" },
  { slug: "sport", name: "Oxblood" },
  { slug: "white", name: "White" },
];

export const garmentName = (slug: ShirtType) => GARMENTS.find((g) => g.slug === slug)?.name ?? slug;
