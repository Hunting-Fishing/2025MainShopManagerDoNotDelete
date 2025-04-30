
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import CategoryDetail from './CategoryDetail';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

const LoadingFallback = () => (
  <ShoppingPageLayout 
    title="Loading Category" 
    description="Please wait while we load the category details"
  >
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground animate-pulse">Loading products...</p>
    </div>
  </ShoppingPageLayout>
);

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  const navigate = useNavigate();
  
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
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button 
            onClick={resetErrorBoundary}
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
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset application state here if needed
        window.location.reload();
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <CategoryDetail />
      </Suspense>
    </ErrorBoundary>
  );
};

export default CategoryDetailPage;
