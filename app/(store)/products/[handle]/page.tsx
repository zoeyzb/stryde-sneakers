import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductForm from "@/components/product/ProductForm";
import ProductGallery from "@/components/product/ProductGallery";
import PreviewReviews from "@/components/product/PreviewReviews";
import ProductGrid from "@/components/store/ProductGrid";
import { getDemoProduct, DEMO_PRODUCTS } from "@/lib/demo/catalog";
import { HANDLE } from "@/lib/validation";
import type { ShirtType } from "@/lib/textures";

type Params = Promise<{ handle: string }>;
const SCENES: ShirtType[] = ["white", "gray", "sport"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = await params;
  const product = getDemoProduct(handle);
  return product ? { title: product.title, description: product.description } : { title: "Product" };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { handle } = await params;
  if (!HANDLE.test(handle)) notFound();
  const product = getDemoProduct(handle);
  if (!product) notFound();

  const tag = product.tags.find((t) => t.startsWith("scene:"));
  const candidate = tag?.slice(6) as ShirtType | undefined;
  const scene: ShirtType | null = candidate && SCENES.includes(candidate) ? candidate : null;
  const related = DEMO_PRODUCTS.filter((item) => item.handle !== handle).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-6 md:pt-10 pb-24 lg:pb-0">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-mist flex gap-2">
        <Link href="/shop" className="hover:text-ivory">Shop</Link>
        <span aria-hidden>/</span>
        <Link href={`/collections/${product.collections.nodes[0].handle}`} className="hover:text-ivory">
          {product.collections.nodes[0].title}
        </Link>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery images={product.gallery.nodes} title={product.title} scene={scene} soldOut={!product.availableForSale} />
        <div className="lg:sticky lg:top-24 self-start min-w-0">
          <Suspense><ProductForm product={product} /></Suspense>
          <div className="mt-10 border-t border-line">
            <details className="border-b border-line" open>
              <summary className="py-5 cursor-pointer eyebrow">Description</summary>
              <p className="pb-6 text-sm leading-7 text-ivory/80">{product.description}</p>
            </details>
            <details className="border-b border-line">
              <summary className="py-5 cursor-pointer eyebrow">Fabric & care</summary>
              <p className="pb-6 text-sm leading-7 text-ivory/80">{product.fabric?.value} {product.care?.value}</p>
            </details>
            <details className="border-b border-line">
              <summary className="py-5 cursor-pointer eyebrow">Fit & sizing</summary>
              <p className="pb-6 text-sm leading-7 text-ivory/80">{product.fit?.value} {product.sizeGuide?.value}</p>
            </details>
            <p className="mt-6 text-xs text-mist leading-6">Studio preview: product photography is illustrative. No orders or payments are accepted.</p>
          </div>
        </div>
      </div>
      <section className="mt-28" aria-labelledby="related-heading">
        <h2 id="related-heading" className="eyebrow text-mist mb-8">Complete the look</h2>
        <ProductGrid products={related} />
      </section>
      <PreviewReviews handle={product.handle} />
    </div>
  );
}
