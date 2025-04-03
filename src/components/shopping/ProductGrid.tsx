
import React from 'react';
import { Product } from '@/types/shopping';
import { ProductCard } from './ProductCard';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyMessage = "No products found"
}) => {
  if (isLoading) {
    return (
      <div className="w-full py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-12">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveGrid
      cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
      gap="md"
      className="w-full"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ResponsiveGrid>
  );
};
