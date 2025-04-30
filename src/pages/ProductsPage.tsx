
import React, { useState } from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsPage() {
  const { products, isLoading, error, filterOptions, updateFilters } = useProducts();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    updateFilters({ search: term });
  };

  return (
    <ShoppingPageLayout
      title="All Products"
      description="Browse our complete collection of tools and equipment"
      onSearch={handleSearch}
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shopping' },
        { label: 'All Products' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <ProductFilters
            filters={filterOptions}
            onUpdateFilters={updateFilters}
          />
        </div>
        
        <div className="md:col-span-3">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            error={error ? error.message : null}
            emptyMessage={
              searchTerm 
                ? `No products found matching "${searchTerm}". Try different search terms or browse our categories.`
                : "No products available yet. Check back soon as we're constantly adding new items!"
            }
          />
        </div>
      </div>
    </ShoppingPageLayout>
  );
}
