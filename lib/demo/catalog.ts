import type { Collection, CollectionSummary, Money, Product, ProductCard, ShopifyImage } from "@/lib/shopify/types";

/**
 * The three actual STRYDE 3D garment worlds, and nothing else.
 * Images are captures of our existing 3D models, not third-party stock photos.
 * This is a studio demo: no live inventory, fulfilment or payment is connected.
 */
const money = (amount: number): Money => ({ amount: amount.toFixed(2), currencyCode: "USD" });
const image = (slug: string, title: string): ShopifyImage => ({
  url: `/garments/${slug}.png`,
  altText: `STRYDE ${title} — render of the actual interactive studio garment`,
  width: 580,
  height: 515,
});

type Scene = "gray" | "sport" | "white";
type World = "graphite" | "oxblood" | "white";

type Piece = {
  handle: string;
  idIndex: number;
  title: string;
  scene: Scene;
  world: World;
  price: number;
  description: string;
};

const PIECES: Piece[] = [
  {
    handle: "graphite-studio-tee",
    idIndex: 1,
    title: "Graphite Studio Layer",
    scene: "gray",
    world: "graphite",
    price: 64,
    description: "A deep graphite garment with a red STRYDE signature. Explore its proportions, texture and atmosphere through the original scroll-driven 3D experience.",
  },
  {
    handle: "sport-studio-tee",
    idIndex: 6,
    title: "Oxblood Studio Layer",
    scene: "sport",
    world: "oxblood",
    price: 72,
    description: "A dark garment in STRYDE's Oxblood world. The red-lit environment, movement and original 3D material study are the focus.",
  },
  {
    handle: "signature-heavyweight-tee",
    idIndex: 0,
    title: "White Studio Layer",
    scene: "white",
    world: "white",
    price: 58,
    description: "The lightest STRYDE world: a white garment with a restrained graphic and an immersive monochrome studio experience.",
  },
];

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export const DEMO_PRODUCTS: Product[] = PIECES.map((p) => {
  const modelImage = image(p.world, p.title);
  const variants = SIZES.map((size, sizeIndex) => ({
    id: `demo-variant-${p.idIndex}-${sizeIndex}`,
    title: size,
    sku: `STRYDE-${p.world.toUpperCase()}-${size}`,
    availableForSale: true,
    currentlyNotInStock: false,
    price: money(p.price),
    compareAtPrice: null,
    selectedOptions: [{ name: "Size", value: size }],
    image: modelImage,
  }));
  const collectionTitle = p.world === "oxblood" ? "Oxblood" : p.world === "graphite" ? "Graphite" : "White";
  return {
    id: `demo-product-${p.idIndex}`,
    handle: p.handle,
    title: p.title,
    productType: "Studio Layer",
    tags: [`scene:${p.scene}`],
    availableForSale: true,
    priceRange: { minVariantPrice: money(p.price), maxVariantPrice: money(p.price) },
    compareAtPriceRange: { maxVariantPrice: money(p.price) },
    featuredImage: modelImage,
    hoverImages: { nodes: [modelImage] },
    options: [{ name: "Size", optionValues: SIZES.map((name) => ({ name })) }],
    description: p.description,
    descriptionHtml: `<p>${p.description}</p>`,
    vendor: "STRYDE",
    seo: { title: p.title, description: p.description },
    gallery: { nodes: [modelImage] },
    detailOptions: [{
      id: `size-option-${p.idIndex}`,
      name: "Size",
      optionValues: SIZES.map((name) => ({ id: `size-${p.idIndex}-${name}`, name, swatch: null })),
    }],
    variants: { nodes: variants },
    fabric: { value: "A 3D design study; final fabrication has not been specified." },
    care: { value: "Care instructions will follow an actual release." },
    fit: { value: "The interactive silhouette is illustrative; no final manufactured fit is claimed." },
    sizeGuide: { value: "XS / S / M / L / XL — illustrative demo sizing." },
    details: { value: "Part of a three-world interactive 3D studio preview. No real orders or payments." },
    collections: { nodes: [{ id: `demo-collection-${p.world}`, handle: p.world, title: collectionTitle }] },
  };
});

const COLLECTION_COPY: Record<World, string> = {
  graphite: "A study in shadow, material and red accents.",
  oxblood: "The collection's most charged environment, in deep red.",
  white: "Quiet proportions in a bright, minimal world.",
};

export const DEMO_COLLECTIONS: CollectionSummary[] = DEMO_PRODUCTS.map((p) => {
  const handle = p.collections.nodes[0].handle as World;
  return {
    id: `demo-collection-${handle}`,
    handle,
    title: p.collections.nodes[0].title,
    description: COLLECTION_COPY[handle],
    image: p.featuredImage,
    products: { nodes: [p] },
  };
});

export function getDemoProduct(handle: string): Product | null {
  return DEMO_PRODUCTS.find((product) => product.handle === handle) ?? null;
}

export function getDemoProductTypes(): string[] {
  return [...new Set(DEMO_PRODUCTS.map((p) => p.productType))];
}

export type DemoFilter = {
  q?: string;
  type?: string;
  availability?: string;
  scene?: string;
  sort?: string;
};

export function filterDemoProducts(filter: DemoFilter, source: ProductCard[] = DEMO_PRODUCTS): ProductCard[] {
  const q = (filter.q ?? "").toLowerCase().trim();
  const products = source.filter((p) => {
    if (q && !`${p.title} ${p.productType}`.toLowerCase().includes(q)) return false;
    if (filter.type && p.productType !== filter.type) return false;
    if (filter.availability === "in-stock" && !p.availableForSale) return false;
    if (filter.availability === "sold-out" && p.availableForSale) return false;
    if (filter.scene && !p.tags.includes(`scene:${filter.scene}`)) return false;
    return true;
  });
  if (filter.sort === "price-asc") products.sort((a,b) => Number(a.priceRange.minVariantPrice.amount)-Number(b.priceRange.minVariantPrice.amount));
  if (filter.sort === "price-desc") products.sort((a,b) => Number(b.priceRange.minVariantPrice.amount)-Number(a.priceRange.minVariantPrice.amount));
  if (filter.sort === "newest") products.reverse();
  if (filter.sort === "title") products.sort((a,b) => a.title.localeCompare(b.title));
  return products;
}

export function getDemoCollection(handle: string, sort?: string): Collection | null {
  const summary = DEMO_COLLECTIONS.find((c) => c.handle === handle);
  if (!summary) return null;
  return {
    id: summary.id,
    handle: summary.handle,
    title: summary.title,
    description: summary.description,
    descriptionHtml: `<p>${summary.description}</p>`,
    seo: { title: summary.title, description: summary.description },
    image: summary.image,
    products: { nodes: filterDemoProducts({ sort }, DEMO_PRODUCTS.filter((p) => p.collections.nodes.some((collection) => collection.handle === handle))), filters: [], pageInfo: { hasNextPage: false, endCursor: null } },
  };
}
