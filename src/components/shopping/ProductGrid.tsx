
import React from 'react';
import { Product } from '@/types/shopping';
import { ProductCard } from './ProductCard';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Package } from 'lucide-react';

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
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 h-72">
              <div className="h-40 bg-gray-200 animate-pulse rounded-md mb-3"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
              <div className="mt-4 h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-12 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center space-y-2 text-center p-8">
          <Package className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-lg font-medium text-muted-foreground">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveGrid
      cols={{ default: 1, sm: 2, md: 3 }}
      gap="md"
      className="w-full"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ResponsiveGrid>
  );
};
