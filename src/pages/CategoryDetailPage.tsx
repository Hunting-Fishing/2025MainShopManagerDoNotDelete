
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import CategoryDetail from './CategoryDetail';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ErrorFallback = () => (
  <ShoppingPageLayout 
    title="Error Loading Category" 
    description="We encountered a problem loading this category."
    error="An unexpected error occurred. Please try refreshing the page."
  >
    <div className="flex flex-col items-center justify-center h-64">
      <button 
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  </ShoppingPageLayout>
);

const CategoryDetailPage = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <CategoryDetail />
    </ErrorBoundary>
  );
};

export default CategoryDetailPage;
