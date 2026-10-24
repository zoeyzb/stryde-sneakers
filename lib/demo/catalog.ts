import type { Collection, CollectionSummary, Money, Product, ProductCard, ShopifyImage } from "@/lib/shopify/types";

/**
 * Curated, clearly illustrative STRYDE preview catalogue.
 * No inventory, fulfilment or payment service is connected.
 */
const money = (amount: number): Money => ({ amount: amount.toFixed(2), currencyCode: "USD" });
const photo = (id: string, alt: string): ShopifyImage => ({
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`,
  altText: alt,
  width: 1200,
  height: 1500,
});

type Piece = {
  handle: string;
  title: string;
  type: string;
  price: number;
  description: string;
  photo: string;
  second: string;
  scene?: "white" | "gray" | "sport";
  collection: "essentials" | "atelier";
  soldOut?: boolean;
};

const PIECES: Piece[] = [
  {
    handle: "signature-heavyweight-tee",
    title: "Signature Heavyweight Tee",
    type: "Tees",
    price: 58,
    description: "A substantial cotton jersey tee with a deliberately relaxed silhouette. The everyday starting point.",
    photo: "photo-1521572163474-6864f9cf17ab",
    second: "photo-1503342217505-b0a15ec3261c",
    scene: "white",
    collection: "essentials",
  },
  {
    handle: "graphite-studio-tee",
    title: "Graphite Studio Tee",
    type: "Tees",
    price: 64,
    description: "A boxy, clean-lined tee in deep graphite. Heavy jersey and an easy drop shoulder.",
    photo: "photo-1621388986228-ad0bba5b1b52",
    second: "photo-1523381210434-271e8be1f52b",
    scene: "gray",
    collection: "essentials",
  },
  {
    handle: "studio-zip-hoodie",
    title: "Studio Zip Hoodie",
    type: "Hoodies",
    price: 128,
    description: "A roomy everyday layer with considered proportions and a clean finish.",
    photo: "photo-1556821840-3a63f95609a7",
    second: "photo-1578681994506-b8f463449011",
    collection: "essentials",
  },
  {
    handle: "utility-overshirt",
    title: "Utility Overshirt",
    type: "Jackets",
    price: 152,
    description: "Workwear-inspired structure softened for daily wear. Layer over a simple tee.",
    photo: "photo-1591047139829-d91aecb6caea",
    second: "photo-1544923246-77307dd654cb",
    collection: "atelier",
  },
  {
    handle: "relaxed-cargo-trouser",
    title: "Relaxed Cargo Trouser",
    type: "Pants",
    price: 118,
    description: "A relaxed utility trouser with movement in mind, balanced by a tailored waist.",
    photo: "photo-1473966968600-fa801b869a1a",
    second: "photo-1511196044526-5cb3bcb7071b",
    collection: "atelier",
  },
  {
    handle: "archive-washed-jacket",
    title: "Archive Washed Jacket",
    type: "Jackets",
    price: 188,
    description: "A washed outer layer from the studio archive. Presented as a sold-out piece.",
    photo: "photo-1544923246-77307dd654cb",
    second: "photo-1591047139829-d91aecb6caea",
    collection: "atelier",
    soldOut: true,
  },
  {
    handle: "sport-studio-tee",
    title: "Sport Studio Tee",
    type: "Tees",
    price: 72,
    description: "A sport-inspired studio tee with bold energy and an easy everyday fit. Explore the matching interactive 3D concept.",
    photo: "photo-1523381210434-271e8be1f52b",
    second: "photo-1503342217505-b0a15ec3261c",
    scene: "sport",
    collection: "essentials",
  },
];

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export const DEMO_PRODUCTS: Product[] = PIECES.map((p, index) => {
  const firstImage = photo(p.photo, `Editorial preview for ${p.title}`);
  const secondImage = photo(p.second, `Alternate editorial preview for ${p.title}`);
  const variants = SIZES.map((size, sizeIndex) => ({
    id: `demo-variant-${index}-${sizeIndex}`,
    title: size,
    sku: `STRYDE-${index + 1}-${size}`,
    availableForSale: !p.soldOut,
    currentlyNotInStock: false,
    price: money(p.price),
    compareAtPrice: null,
    selectedOptions: [{ name: "Size", value: size }],
    image: firstImage,
  }));
  return {
    id: `demo-product-${index}`,
    handle: p.handle,
    title: p.title,
    productType: p.type,
    tags: p.scene ? [`scene:${p.scene}`] : [],
    availableForSale: !p.soldOut,
    priceRange: { minVariantPrice: money(p.price), maxVariantPrice: money(p.price) },
    compareAtPriceRange: { maxVariantPrice: money(p.price) },
    featuredImage: firstImage,
    hoverImages: { nodes: [firstImage, secondImage] },
    options: [{ name: "Size", optionValues: SIZES.map((name) => ({ name })) }],
    description: p.description,
    descriptionHtml: `<p>${p.description}</p>`,
    vendor: "STRYDE",
    seo: { title: p.title, description: p.description },
    gallery: { nodes: [firstImage, secondImage] },
    detailOptions: [{
      id: `size-option-${index}`,
      name: "Size",
      optionValues: SIZES.map((name) => ({
        id: `size-${index}-${name}`, name, swatch: null,
      })),
    }],
    variants: { nodes: variants },
    fabric: { value: p.type === "Pants" ? "Cotton-rich utility twill." : "Premium cotton blend." },
    care: { value: "Cold gentle wash. Lay flat or hang to dry." },
    fit: { value: "Relaxed fit. Choose your usual size for the intended silhouette." },
    sizeGuide: { value: "XS / S / M / L / XL — standard unisex sizing." },
    details: { value: "STRYDE studio preview collection. Imagery is illustrative; no orders are taken." },
    collections: { nodes: [{ id: `demo-collection-${p.collection}`, handle: p.collection, title: p.collection === "essentials" ? "Everyday Essentials" : "Studio Atelier" }] },
  };
});

export const DEMO_COLLECTIONS: CollectionSummary[] = [
  {
    id: "demo-collection-essentials",
    handle: "essentials",
    title: "Everyday Essentials",
    description: "Elevated layers with an everyday point of view.",
    image: DEMO_PRODUCTS[0].featuredImage,
    products: { nodes: DEMO_PRODUCTS.filter((p) => p.collections.nodes.some((c) => c.handle === "essentials")) },
  },
  {
    id: "demo-collection-atelier",
    handle: "atelier",
    title: "Studio Atelier",
    description: "Utility-led silhouettes and pieces from the archive.",
    image: DEMO_PRODUCTS[3].featuredImage,
    products: { nodes: DEMO_PRODUCTS.filter((p) => p.collections.nodes.some((c) => c.handle === "atelier")) },
  },
];

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
  if (filter.sort === "price-asc") products.sort((a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount));
  if (filter.sort === "price-desc") products.sort((a, b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount));
  if (filter.sort === "newest") products.reverse();
  if (filter.sort === "title") products.sort((a, b) => a.title.localeCompare(b.title));
  
  return products;
}

export function getDemoCollection(handle: string, sort?: string): Collection | null {
  const summary = DEMO_COLLECTIONS.find((c) => c.handle === handle);
  if (!summary) return null;
  const products = filterDemoProducts({ sort }, DEMO_PRODUCTS.filter((p) => p.collections.nodes.some((c) => c.handle === handle)));
  return {
    id: summary.id,
    handle: summary.handle,
    title: summary.title,
    description: summary.description,
    descriptionHtml: `<p>${summary.description}</p>`,
    seo: { title: summary.title, description: summary.description },
    image: summary.image,
    products: { nodes: products, filters: [], pageInfo: { hasNextPage: false, endCursor: null } },
  };
}
