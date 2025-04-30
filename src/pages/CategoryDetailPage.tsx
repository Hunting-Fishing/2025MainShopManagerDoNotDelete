
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import CategoryDetail from '@/pages/CategoryDetail';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

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

  // Use a key to force remount when the slug changes
  // This prevents stale data when navigating between categories
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset application state here if needed
        window.location.reload();
      }}
      onError={(error, info) => {
        // Log the error to the console for debugging
        console.error("Category page error:", error);
        console.error("Component stack:", info.componentStack);
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <CategoryDetail key={slug} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default CategoryDetailPage;
