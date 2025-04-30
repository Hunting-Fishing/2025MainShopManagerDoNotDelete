
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useCategoryDetail } from '@/hooks/useCategoryDetail';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { CategoryTabs } from '@/components/shopping/CategoryTabs';

const LoadingFallback = () => (
  <ShoppingPageLayout 
    title="Loading Category" 
    description="Please wait while we load the category details"
  >
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse">Loading products...</p>
    </div>
  </ShoppingPageLayout>
);

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  return (
    <ShoppingPageLayout 
      title="Error Loading Category" 
      description="We encountered a problem loading this category."
      error={error?.message || "An unexpected error occurred. Please try refreshing the page."}
    >
      <div className="flex flex-col items-center justify-center py-8">
        <Alert variant="destructive" className="mb-6 max-w-lg mx-auto">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Failed to load category</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error?.message || "An unexpected error occurred"}</p>
            <p className="text-xs text-muted-foreground">Error details: {error?.stack?.split('\n')[0]}</p>
            {slug && (
              <p className="text-sm">
                Tried to load: <span className="font-mono bg-gray-100 px-1 rounded">{slug}</span>
              </p>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button 
            onClick={() => {
              // Clear local storage cache if any
              try {
                const cacheKeys = Object.keys(localStorage).filter(key => 
                  key.startsWith('category_') || key.startsWith('products_')
                );
                cacheKeys.forEach(key => localStorage.removeItem(key));
              } catch (err) {
                console.error("Error clearing cache:", err);
              }
              resetErrorBoundary();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh Page
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/shopping/categories')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            View All Categories
          </Button>
        </div>
      </div>
    </ShoppingPageLayout>
  );
};

const CategoryDetailPage = () => {
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

  const [pageTitle, setPageTitle] = React.useState('Category');
  
  React.useEffect(() => {
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
        path: `/shopping/categories/${category.slug}`
      });
    } else if (slug) {
      breadcrumbs.push({ 
        label: slug.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        path: `/shopping/categories/${slug}`
      });
    }
    
    return breadcrumbs;
  };

  // Show loading state
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Show error state
  if (error) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ShoppingPageLayout 
          title="Category Not Found" 
          description="We couldn't find the category you were looking for."
          error={error}
          breadcrumbs={getBreadcrumbs()}
        >
          <div className="flex flex-col items-center justify-center py-8">
            <Button 
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
            
            {similarCategories.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">You might be looking for:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarCategories.map((cat) => (
                    <Link 
                      key={cat.id}
                      to={`/shopping/categories/${cat.slug}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium">{cat.name}</h4>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ShoppingPageLayout>
      </ErrorBoundary>
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
              <LoadingSpinner size="lg" />
            </div>
          ) : products && products.length > 0 ? (
            <ProductGrid 
              products={products} 
              isLoading={productsLoading}
              categoryName={category?.name}
            />
          ) : (
            <Alert className="bg-amber-50 border-amber-200 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-700">
                No products found in this category. We're continuously adding new items to our inventory.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </ShoppingPageLayout>
  );
};

export default CategoryDetailPage;
