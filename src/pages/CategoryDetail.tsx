
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCategoryDetail } from '@/hooks/useCategoryDetail';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeftIcon, Loader2 } from 'lucide-react';
import { CategoryNotFound } from '@/components/shopping/CategoryNotFound';
import { CategoryLoading } from '@/components/shopping/CategoryLoading';
import { CategoryTabs } from '@/components/shopping/CategoryTabs';

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { 
    category, 
    products, 
    isLoading, 
    productsLoading,
    error, 
    filterOptions,
    updateFilters,
    similarCategories,
    diagnosticInfo,
    handleRetry
  } = useCategoryDetail(slug);
  
  const [pageTitle, setPageTitle] = useState('Category');
  
  useEffect(() => {
    // Update page title when category is loaded
    if (category) {
      setPageTitle(category.name);
    } else if (slug) {
      // If we have a slug but no category, use a formatted version of the slug
      setPageTitle(slug.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '));
    }
  }, [category, slug]);

  // Prepare breadcrumbs based on the current category
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Shop', path: '/shopping' },
      { label: 'Categories', path: '/shopping/categories' }
    ];
    
    if (category) {
      breadcrumbs.push({ 
        label: category.name,
        path: `/shopping/categories/${category.slug}` // Add required path prop
      });
    } else if (slug) {
      breadcrumbs.push({ 
        label: slug.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        path: `/shopping/categories/${slug}` // Add required path prop
      });
    }
    
    return breadcrumbs;
  };
  
  // Show loading state
  if (isLoading) {
    return <CategoryLoading />;  // Remove the slug prop as it's not expected
  }
  
  // Show error state if category not found
  if (error) {
    return (
      <CategoryNotFound 
        slug={slug || ''} 
        error={error} 
        similarCategories={similarCategories} 
        diagnosticInfo={diagnosticInfo}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <ShoppingPageLayout
      title={pageTitle}
      description={category?.description}
      breadcrumbs={getBreadcrumbs()}
    >
      {category && category.subcategories && category.subcategories.length > 0 && (
        <div className="mb-8">
          <CategoryTabs 
            selectedCategoryId={category.id} 
            onCategoryChange={(categoryId) => {
              if (categoryId) {
                updateFilters({ categoryId });
              }
            }}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ProductFilters 
            filters={filterOptions} 
            onUpdateFilters={updateFilters} 
          />
        </div>
        
        <div className="lg:col-span-3">
          {productsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products && products.length > 0 ? (
            <ProductGrid 
              products={products} 
              isLoading={productsLoading}
              categoryName={category?.name}
            />
          ) : (
            <Alert className="bg-amber-50 border-amber-200 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-700">
                No products found in this category. We're continuously adding new items to our inventory.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </ShoppingPageLayout>
  );
}
