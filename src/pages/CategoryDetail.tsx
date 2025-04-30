
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
import { AlertCircle } from 'lucide-react';

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
  
  // If the page is still loading, show a loading message
  if (isLoading) {
    return (
      <ShoppingPageLayout
        title="Loading Category..."
        description="Please wait while we fetch the category details"
      >
        <CategoryLoading />
      </ShoppingPageLayout>
    );
  }

  // Special error handling for hand-tools category
  if (isHandTools && !category) {
    return (
      <ShoppingPageLayout
        title="Hand Tools"
        description="Shop our selection of quality hand tools"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Shop', path: '/shopping' },
          { label: 'Categories', path: '/shopping/categories' },
          { label: 'Hand Tools' }
        ]}
      >
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Category Under Construction</AlertTitle>
          <AlertDescription className="text-amber-700">
            The Hand Tools category is currently being set up. Please check back soon to browse our selection of quality hand tools.
          </AlertDescription>
        </Alert>
        
        <CategoryNotFound
          slug={slug || ''}
          error="This category is still being set up. Our team is working on adding products."
          similarCategories={similarCategories}
          diagnosticInfo={diagnosticInfo}
          onRetry={handleRetry}
        />
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
          { label: slug || 'Unknown' }
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

  // Show the category details
  return (
    <ShoppingPageLayout
      title={category?.name || 'Category'}
      description={category?.description}
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shopping' },
        { label: 'Categories', path: '/shopping/categories' },
        { label: category?.name || slug || 'Category' }
      ]}
    >
      {/* Filter interface */}
      <div className="mb-8">
        <ProductFilters 
          filterOptions={filterOptions}
          onFilterChange={updateFilters}
        />
      </div>
      
      <Separator className="my-6" />
      
      {/* Products grid */}
      <ProductGrid 
        products={products}
        isLoading={productsLoading}
        emptyMessage={`No products found in ${category?.name || 'this category'}. ${category ? 'Try adding some products first.' : ''}`}
      />
    </ShoppingPageLayout>
  );
};

export default CategoryDetail;
