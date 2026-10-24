import type { ProductCard as ProductCardType } from "@/lib/shopify/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: ProductCardType[] }) {
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard product={product} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
