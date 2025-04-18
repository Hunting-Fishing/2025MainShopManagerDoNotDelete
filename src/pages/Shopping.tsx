import React, { useState } from 'react';
import { ShoppingHeader } from '@/components/shopping/ShoppingHeader';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { CategoryTabs } from '@/components/shopping/CategoryTabs';
import { SuggestionForm } from '@/components/shopping/SuggestionForm';
import { WishlistPanel } from '@/components/shopping/WishlistPanel';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { EnhancedProductFilters } from '@/components/shopping/EnhancedProductFilters';

export default function Shopping() {
  const { products, isLoading, filterOptions, updateFilters } = useProducts();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAdmin } = useAuthUser();
  
  const [activeTab, setActiveTab] = useState<string>('all-products');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const handleSearch = (searchTerm: string) => {
    updateFilters({ search: searchTerm });
  };

  const handleCategoryChange = (categoryId?: string) => {
    updateFilters({ categoryId });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'user-suggestions') {
      updateFilters({ filterType: 'suggested' });
    } else {
      updateFilters({ filterType: 'all' });
    }
  };

  return (
    <ResponsiveContainer className="py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Shop</h1>
        </div>
      </div>
      
      <EnhancedProductFilters 
        onFilterChange={(filters) => {
          updateFilters({ categoryId: filters[0] });
        }}
      />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all-products" className="rounded-full">All Products</TabsTrigger>
          <TabsTrigger value="user-suggestions" className="rounded-full">
            User Suggestions
            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">New</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-products" className="mt-0">
          <div className="flex flex-col md:flex-row gap-6">
            {isMobile ? (
              <ProductFilters
                filterOptions={filterOptions}
                onFilterChange={updateFilters}
                isMobileVisible={showMobileFilters}
                onMobileClose={() => setShowMobileFilters(false)}
              />
            ) : (
              <div className="w-full md:w-64 flex-shrink-0">
                <ProductFilters
                  filterOptions={filterOptions}
                  onFilterChange={updateFilters}
                />
              </div>
            )}
            
            <div className="flex-grow">
              <CategoryTabs
                selectedCategoryId={filterOptions.categoryId}
                onCategoryChange={handleCategoryChange}
              />
              
              <div className="mt-6">
                <ProductGrid
                  products={products}
                  isLoading={isLoading}
                  emptyMessage="No products found matching your filters."
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="user-suggestions" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductGrid
                products={products}
                isLoading={isLoading}
                emptyMessage="No user suggestions yet. Be the first to suggest a product!"
              />
            </div>
            
            <div>
              <SuggestionForm />
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>About User Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Share your favorite products with the community! Submit suggestions for tools, consumables, 
                    or any products you find useful. Our team will review submissions before they appear in this section.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <WishlistPanel
        visible={showWishlist}
        onClose={() => setShowWishlist(false)}
      />
    </ResponsiveContainer>
  );
}
