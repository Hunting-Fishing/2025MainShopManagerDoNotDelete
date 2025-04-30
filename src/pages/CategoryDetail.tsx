
import React from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { Separator } from '@/components/ui/separator';
import { CategoryLoading } from '@/components/shopping/CategoryLoading';
import { CategoryNotFound } from '@/components/shopping/CategoryNotFound';
import { useCategoryDetail } from '@/hooks/useCategoryDetail';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, InfoIcon, Wrench, Package, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { 
    category, 
    products, 
    isLoading, 
    productsLoading, 
    error, 
    filterOptions, 
    similarCategories,
    diagnosticInfo,
    handleRetry,
    updateFilters
  } = useCategoryDetail(slug);

  // Special handling for the hand-tools category
  const isHandTools = slug === 'hand-tools';
  
  // Format the slug for display when category is not available
  const formatSlugForDisplay = (slug: string) => {
    if (!slug) return 'Category';
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const displayName = category?.name || (slug ? formatSlugForDisplay(slug) : 'Category');
  
  // If the page is still loading, show a loading message
  if (isLoading) {
    return (
      <ShoppingPageLayout
        title="Loading Category..."
        description="Please wait while we fetch the category details"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Shop', path: '/shopping' },
          { label: 'Categories', path: '/shopping/categories' },
          { label: displayName }
        ]}
      >
        <CategoryLoading />
      </ShoppingPageLayout>
    );
  }

  // Special display for hand-tools category
  if (isHandTools) {
    return (
      <ShoppingPageLayout
        title="Hand Tools"
        description="Essential hand tools for every mechanic and DIY enthusiast"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Shop', path: '/shopping' },
          { label: 'Categories', path: '/shopping/categories' },
          { label: 'Hand Tools' }
        ]}
      >
        <div className="mb-8 p-6 border border-amber-200 rounded-xl bg-amber-50">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-full bg-amber-100 border border-amber-300">
              <Wrench className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-amber-800 mb-2">Hand Tools Collection Coming Soon</h2>
              <p className="text-amber-700 mb-4">
                Our team is currently curating a selection of high-quality hand tools for automotive professionals and DIY enthusiasts.
                Check back soon to browse our complete collection!
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={handleRetry}
                >
                  Check Again
                </Button>
                <Button 
                  variant="default" 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => window.location.href = '/shopping/categories'}
                >
                  View All Categories
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Top Hand Tools Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Wrenches & Wrench Sets", "Sockets & Socket Sets", "Pliers", "Screwdrivers", "Hammers & Mallets", "Pry Bars"].map((item, index) => (
              <div key={index} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <p className="font-medium text-gray-800">{item}</p>
                <p className="text-sm text-gray-500 mt-1">Coming Soon</p>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <div className="flex items-center">
            <InfoIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-blue-800 text-sm">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
          </div>
        </div>
      </ShoppingPageLayout>
    );
  }

  // If there's an error, show it
  if (error) {
    return (
      <ShoppingPageLayout
        title="Category Not Found"
        error={error}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Shop', path: '/shopping' },
          { label: 'Categories', path: '/shopping/categories' },
          { label: displayName }
        ]}
      >
        <CategoryNotFound
          slug={slug || ''}
          error={error}
          similarCategories={similarCategories}
          diagnosticInfo={diagnosticInfo}
          onRetry={handleRetry}
        />
      </ShoppingPageLayout>
    );
  }

  // Show the category details with enhanced empty state
  return (
    <ShoppingPageLayout
      title={displayName}
      description={category?.description}
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shopping' },
        { label: 'Categories', path: '/shopping/categories' },
        { label: displayName }
      ]}
    >
      {/* Category info card */}
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Category
            </Badge>
            <CardTitle>{displayName}</CardTitle>
          </div>
          <CardDescription>{category?.description || `Browse our selection of ${displayName} products`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            We're continuously adding new products to this category. Check back soon for more options!
          </div>
        </CardContent>
      </Card>
      
      {/* Filter interface */}
      <div className="mb-8">
        <ProductFilters 
          filterOptions={filterOptions}
          onFilterChange={updateFilters}
        />
      </div>
      
      <Separator className="my-6" />
      
      {/* Products grid with enhanced empty state */}
      <ProductGrid 
        products={products}
        isLoading={productsLoading}
        categoryName={displayName}
        emptyMessage={`No products found in ${displayName} category. New products coming soon!`}
      />
      
      {/* Coming soon section when no products available */}
      {products.length === 0 && !productsLoading && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Coming to this Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Coming soon</p>
                    <p className="text-xs text-gray-400">New products will be added regularly</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-lg border border-blue-100 bg-blue-50">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800 font-medium">Looking for something specific?</p>
            </div>
            <p className="mt-1 text-sm text-blue-700 ml-7">
              Visit our <a href="/shopping/suggestions" className="underline">product suggestions</a> page to request items you'd like to see in our catalog.
            </p>
          </div>
        </div>
      )}
      
      <Separator className="my-8" />
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <div className="flex items-center">
          <InfoIcon className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-blue-800 text-sm">
            As an Amazon Associate, we earn from qualifying purchases.
          </p>
        </div>
      </div>
    </ShoppingPageLayout>
  );
};

export default CategoryDetail;
