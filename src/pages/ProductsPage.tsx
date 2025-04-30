
import React, { useState, useEffect } from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { useProducts } from '@/hooks/useProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function ProductsPage() {
  const { products, isLoading, error, filterOptions, updateFilters } = useProducts();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const isMobile = useIsMobile();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    updateFilters({ search: term });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateFilters({ filterType: value as any });
  };

  // Count products for each category
  const bestsellersCount = products.filter(p => p.is_bestseller).length;
  const featuredCount = products.filter(p => p.is_featured).length;
  const suggestedCount = products.filter(p => p.product_type === 'suggested').length;

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
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-muted/20 p-1">
              <TabsTrigger value="all" className="rounded-full">
                All Products
              </TabsTrigger>
              <TabsTrigger value="bestsellers" className="rounded-full">
                Bestsellers
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border border-amber-300">
                  {bestsellersCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="featured" className="rounded-full">
                Featured
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 border border-blue-300">
                  {featuredCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="suggested" className="rounded-full">
                Suggestions
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 border border-purple-300">
                  {suggestedCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <SlidersHorizontal size={16} />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="py-4">
                    <h3 className="text-lg font-medium mb-4">Filters</h3>
                    <ProductFilters
                      filters={filterOptions}
                      onUpdateFilters={updateFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {!isMobile && (
              <div className="md:col-span-1">
                <div className="sticky top-20">
                  <ProductFilters
                    filters={filterOptions}
                    onUpdateFilters={updateFilters}
                  />
                </div>
              </div>
            )}
            
            <div className="md:col-span-3">
              <TabsContent value="all" className="mt-0">
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
              </TabsContent>
              
              <TabsContent value="bestsellers" className="mt-0">
                <ProductGrid
                  products={products.filter(p => p.is_bestseller)}
                  isLoading={isLoading}
                  error={error ? error.message : null}
                  emptyMessage="No bestseller products available yet."
                />
              </TabsContent>
              
              <TabsContent value="featured" className="mt-0">
                <ProductGrid
                  products={products.filter(p => p.is_featured)}
                  isLoading={isLoading}
                  error={error ? error.message : null}
                  emptyMessage="No featured products available yet."
                />
              </TabsContent>
              
              <TabsContent value="suggested" className="mt-0">
                <ProductGrid
                  products={products.filter(p => p.product_type === 'suggested')}
                  isLoading={isLoading}
                  error={error ? error.message : null}
                  emptyMessage="No suggested products available yet."
                />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </ShoppingPageLayout>
  );
}
