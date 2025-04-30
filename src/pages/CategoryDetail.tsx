
import React from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { Separator } from '@/components/ui/separator';
import { CategoryLoading } from '@/components/shopping/CategoryLoading';
import { CategoryNotFound } from '@/components/shopping/CategoryNotFound';
import { useCategoryDetail } from '@/hooks/useCategoryDetail';

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
