
import React, { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronRight, SortAsc } from 'lucide-react';

interface ServiceCategoriesListProps {
  categories: ServiceMainCategory[];
  selectedCategoryId: string | undefined;
  onSelectCategory: (category: ServiceMainCategory) => void;
  isLoading?: boolean;
}

export const ServiceCategoriesList: React.FC<ServiceCategoriesListProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isLoading = false,
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const [sortOrder, setSortOrder] = useState<'name' | 'position'>('position');

  const toggleCompactView = () => {
    setIsCompact(prev => !prev);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'name' ? 'position' : 'name');
  };
  
  const getSortedCategories = () => {
    if (!categories || categories.length === 0) return [];
    
    return [...categories].sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return (a.position || 0) - (b.position || 0);
      }
    });
  };

  const sortedCategories = getSortedCategories();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSortOrder}
            className="text-xs flex items-center"
          >
            <SortAsc className="h-3 w-3 mr-1" />
            Sort by: {sortOrder === 'name' ? 'Name' : 'Position'}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCompactView}
          className="text-xs"
        >
          {isCompact ? 'Expand' : 'Compact'}
        </Button>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">No service categories available</p>
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto flex-grow">
          {sortedCategories.map(category => (
            <div
              key={category.id}
              className={`rounded-md border cursor-pointer transition-colors ${
                category.id === selectedCategoryId 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
              }`}
              onClick={() => onSelectCategory(category)}
            >
              <div className={`p-3 ${isCompact ? 'py-2' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <h3 className="font-medium text-sm">{category.name}</h3>
                    {!isCompact && category.description && (
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    )}
                    {!isCompact && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {category.subcategories?.length || 0} subcategories
                        </span>
                        <span className="mx-1 text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          Position: {category.position || 0}
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
