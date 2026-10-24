import { PageHeading } from "@/components/store/StoreStatus";
import { getPage, isStorefrontConfigured } from "@/lib/shopify";
import type { ShopPage } from "@/lib/shopify/types";

/** Loads an Online Store page by handle so merchants can edit copy in Shopify. */
export async function loadShopPage(handle: string): Promise<ShopPage | null> {
  if (!isStorefrontConfigured()) return null;
  try {
    return await getPage(handle);
  } catch (err) {
    console.error(`[page:${handle}]`, err);
    return null;
  }
}

export default async function EditorialPage({
  handle,
  eyebrow,
  title,
  children,
  after,
}: {
  handle: string;
  eyebrow: string;
  title: string;
  /** Default copy used when no Shopify page with this handle is published. */
  children: React.ReactNode;
  after?: React.ReactNode;
}) {
  const page = await loadShopPage(handle);
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10">
      <PageHeading eyebrow={eyebrow} title={page?.title ?? title} />
      {page?.body ? <div className="prose-stryde" dangerouslySetInnerHTML={{ __html: page.body }} /> : children}
      {after}
    </div>
  );
}
