import type { ProductCard as ProductCardType } from "@/lib/shopify/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: ProductCardType[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard product={product} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
