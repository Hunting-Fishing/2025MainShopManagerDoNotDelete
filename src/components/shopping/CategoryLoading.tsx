
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const CategoryLoading: React.FC = () => {
  return (
    <div className="w-full space-y-8">
      {/* Loading header */}
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
        <p className="text-lg text-muted-foreground animate-pulse">Loading category details...</p>
      </div>
      
      {/* Loading product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
