
import { Product } from "@/types/shopping";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  emptyMessage: string;
  onProductClick?: (product: Product) => void;
}

export function ProductGrid({ products, isLoading, emptyMessage, onProductClick }: ProductGridProps) {
  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} onClick={() => onProductClick?.(product)} className="cursor-pointer">
          <ProductCard {...product} />
        </div>
      ))}
    </div>
  );
}
