import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductForm from "@/components/product/ProductForm";
import ProductGallery from "@/components/product/ProductGallery";
import ProductGrid from "@/components/store/ProductGrid";
import { NotConnected, StoreError } from "@/components/store/StoreStatus";
import { getProduct, getRecommendations, isStorefrontConfigured } from "@/lib/shopify";
import { getSiteUrl } from "@/lib/shopify/config";
import type { Product } from "@/lib/shopify/types";
import type { ShirtType } from "@/lib/textures";
import { HANDLE } from "@/lib/validation";

type Params = Promise<{ handle: string }>;

const SCENES: ShirtType[] = ["white", "gray", "sport"];

function sceneFor(product: Product): ShirtType | null {
  const tag = product.tags.find((t) => t.startsWith("scene:"));
  const scene = tag?.slice("scene:".length) as ShirtType | undefined;
  return scene && SCENES.includes(scene) ? scene : null;
}

async function load(handle: string) {
  if (!HANDLE.test(handle) || !isStorefrontConfigured()) return null;
  return getProduct(handle);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = await params;
  try {
    const product = await load(handle);
    if (!product) return { title: "Product" };
    return {
      title: product.seo.title ?? product.title,
      description: product.seo.description ?? product.description.slice(0, 160),
      openGraph: product.featuredImage ? { images: [product.featuredImage.url] } : undefined,
    };
  } catch {
    return { title: "Product" };
  }
}

function Section({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group border-b border-line" open={open}>
      <summary className="flex justify-between items-center py-5 cursor-pointer list-none eyebrow">
        {title}
        <span aria-hidden className="text-mist transition-transform group-open:rotate-45 text-base leading-none">+</span>
      </summary>
      <div className="pb-6 text-sm leading-7 text-ivory/80">{children}</div>
    </details>
  );
}

const Text = ({ value }: { value: string }) => <p className="whitespace-pre-line">{value}</p>;

async function Related({ productId }: { productId: string }) {
  let related;
  try {
    related = (await getRecommendations(productId)).slice(0, 4);
  } catch {
    return null;
  }
  if (!related.length) return null;
  return (
    <section className="mt-28" aria-labelledby="related-heading">
      <h2 id="related-heading" className="eyebrow text-mist mb-8">
        You may also like
      </h2>
      <ProductGrid products={related} />
    </section>
  );
}

export default async function ProductPage({ params }: { params: Params }) {
  const { handle } = await params;
  if (!isStorefrontConfigured()) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-16">
        <NotConnected what="This product" />
      </div>
    );
  }

  let product: Product | null;
  try {
    product = await load(handle);
  } catch (err) {
    console.error("[product]", err);
    return (
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-16">
        <StoreError />
      </div>
    );
  }
  if (!product) notFound();

  const scene = sceneFor(product);
  const images = product.gallery.nodes.length
    ? product.gallery.nodes
    : product.featuredImage
      ? [product.featuredImage]
      : [];
  const collection = product.collections.nodes[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images.map((i) => i.url),
    brand: { "@type": "Brand", name: product.vendor || "STRYDE" },
    url: `${getSiteUrl()}/products/${product.handle}`,
    offers: product.variants.nodes.map((v) => ({
      "@type": "Offer",
      sku: v.sku || undefined,
      price: v.price.amount,
      priceCurrency: v.price.currencyCode,
      availability: v.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-6 md:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-mist flex gap-2">
        <Link href="/shop" className="hover:text-ivory">Shop</Link>
        {collection && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/collections/${collection.handle}`} className="hover:text-ivory">
              {collection.title}
            </Link>
          </>
        )}
      </nav>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery images={images} title={product.title} scene={scene} soldOut={!product.availableForSale} />
        <div className="lg:sticky lg:top-24 self-start min-w-0">
          <Suspense>
            <ProductForm product={product} />
          </Suspense>
          <div className="mt-10 border-t border-line">
            {product.descriptionHtml && (
              <Section title="Description" open>
                <div className="prose-stryde" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
              </Section>
            )}
            {product.details?.value && (
              <Section title="Details">
                <Text value={product.details.value} />
              </Section>
            )}
            {(product.fabric?.value || product.care?.value) && (
              <Section title="Fabric & care">
                {product.fabric?.value && <Text value={product.fabric.value} />}
                {product.care?.value && (
                  <div className={product.fabric?.value ? "mt-4" : undefined}>
                    <Text value={product.care.value} />
                  </div>
                )}
              </Section>
            )}
            {(product.fit?.value || product.sizeGuide?.value) && (
              <Section title="Fit & size guide">
                {product.fit?.value && <Text value={product.fit.value} />}
                {product.sizeGuide?.value && (
                  <div className={product.fit?.value ? "mt-4" : undefined}>
                    <Text value={product.sizeGuide.value} />
                  </div>
                )}
              </Section>
            )}
            <Section title="Shipping & returns">
              <p>
                Shipping options, costs and delivery estimates for your address are shown at checkout before you pay.
                Read our <Link href="/shipping" className="underline underline-offset-4">shipping policy</Link> and{" "}
                <Link href="/returns" className="underline underline-offset-4">returns policy</Link> for full details.
              </p>
            </Section>
          </div>
        </div>
      </div>
      <Suspense>
        <Related productId={product.id} />
      </Suspense>
    </div>
  );
}
